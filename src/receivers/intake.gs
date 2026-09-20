/**
 * Olsen Automation AI Visibility intake receiver.
 *
 * Deploy as a Google Apps Script web app:
 * - Execute as: Me (the Olsen Automation Workspace account)
 * - Who has access: Anyone
 *
 * The public form can submit an intake, but it cannot choose the recipient.
 */

const CONFIG = Object.freeze({
  RECIPIENT: 'brian@olsenautomation.com',
  EXPECTED_INTAKE_TYPE: 'olsen_automation_ai_visibility',
  EXPECTED_SOURCE_PAGE: 'https://olsenautomation.com/ai-visibility.html',
  MAX_PAYLOAD_BYTES: 100000,
  MIN_FORM_AGE_MS: 4000,
  MAX_FORM_AGE_MS: 86400000,
  MAX_ACCEPTED_PER_HOUR: 30,
  DUPLICATE_TTL_SECONDS: 21600
});

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Olsen Automation AI Visibility Intake',
    accepts: 'POST'
  });
}

function doPost(e) {
  let requestId = "";
  try {
    const parameters = e && e.parameter ? e.parameter : {};

    // Quietly accept likely bot submissions so the trap is not advertised.
    if (String(parameters.company_website_confirm || '').trim()) {
      return postResponse_({ ok: true, accepted: true });
    }

    const payloadText = String(parameters.payload || '');
    validatePayloadSize_(payloadText);

    const intake = JSON.parse(payloadText);
    if (intake && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(String(intake.request_id || ""))) requestId = intake.request_id;
    const formStartedAt = Number(parameters.form_started_at || 0);
    validateFormAge_(formStartedAt);
    if (intake.intake_type === "olsen_automation_client_conversation") return handleConversation_(intake);
    validateIntake_(intake);
    rejectSecretFields_(intake);

    const canonicalJson = JSON.stringify(intake, null, 2) + '\n';
    const digest = digest_(canonicalJson);
    enforceRateAndDuplicateLimits_(digest);

    if (MailApp.getRemainingDailyQuota() < 1) {
      throw new Error('The intake mailbox has reached its daily send limit.');
    }

    const businessName = cleanSingleLine_(intake.client.business_name, 120);
    const contactName = cleanSingleLine_(intake.client.contact_name, 120);
    const contactEmail = cleanEmail_(intake.client.contact_email);
    const filename = slug_(businessName) + '-ai-visibility-intake-' + dateStamp_() + '.json';
    const attachment = Utilities.newBlob(canonicalJson, 'application/json', filename);
    const subject = 'AI Visibility Intake — ' + businessName;
    const body = [
      'A new AI Visibility intake was submitted through olsenautomation.com.',
      '',
      'Business: ' + businessName,
      'Contact: ' + contactName,
      'Contact email: ' + contactEmail,
      'Website: ' + cleanSingleLine_(intake.client.website, 300),
      'Main location: ' + cleanSingleLine_(intake.client.main_location, 180),
      'Target queries: ' + intake.visibility.target_queries.length,
      '',
      'The complete structured intake is attached as ' + filename + '.',
      'Do not treat the submission itself as permission beyond the boundaries recorded in the attachment.'
    ].join('\n');

    try {
      MailApp.sendEmail(CONFIG.RECIPIENT, subject, body, {
        attachments: [attachment],
        name: 'Olsen Automation AI Visibility Intake',
        replyTo: contactEmail
      });
    } catch (mailError) {
      CacheService.getScriptCache().remove('intake:' + digest);
      throw mailError;
    }

    return postResponse_({ ok: true, accepted: true, submission_id: digest.slice(0, 16) });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return postResponse_({
      ok: false,
      accepted: false,
      request_id: requestId,
      error: safeError_(error)
    });
  }
}

// The conversation form is a separate, exact allowlisted contract.
function handleConversation_(intake) {
  if (intake.source_page !== 'https://olsenautomation.com/conversation/joe-v-7c4e9a/' ||
      !['initial_call', 'follow_up'].includes(intake.submission_kind) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(String(intake.request_id || ''))) {
    throw new Error('The conversation form is not recognized.');
  }
  if (!intake.client || !intake.confirmations || intake.confirmations.no_secrets_or_private_customer_data !== true) {
    throw new Error('Required contact information or confirmation is missing.');
  }
  ['business_name', 'contact_name', 'contact_email'].forEach(function(key) {
    if (typeof intake.client[key] !== 'string' || !intake.client[key].trim() || intake.client[key].length > 254) {
      throw new Error('Required contact information is missing or too long.');
    }
  });
  const email = cleanEmail_(intake.client.contact_email);
  const answers = intake.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length > 20) {
    throw new Error('The answers format is invalid.');
  }
  Object.keys(answers).forEach(function(key) {
    if (!/^[a-z_]{1,60}$/.test(key) || typeof answers[key] !== 'string' || answers[key].length > 4000) {
      throw new Error('An answer is too long or has an unsupported format.');
    }
  });
  const required = intake.submission_kind === 'initial_call' ? ['goal'] : ['topic', 'question'];
  required.forEach(function(key) {
    if (!answers[key] || !answers[key].trim()) throw new Error('Please complete the required answers.');
  });
  rejectSecretFields_(intake);
  const json = JSON.stringify(intake, null, 2) + '\n';
  const hash = digest_(json);
  const cache = CacheService.getScriptCache();
  const key = 'conversation:' + intake.request_id;
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const previous = cache.get(key);
    if (previous) {
      if (previous !== hash) throw new Error('This submission reference was already used for different answers.');
      return postResponse_({ok:true, accepted:true, duplicate:true, request_id:intake.request_id, submission_id:hash.slice(0,16)});
    }
    const rateKey = 'hour:' + Math.floor(Date.now() / 3600000);
    const count = Number(cache.get(rateKey) || 0);
    if (count >= CONFIG.MAX_ACCEPTED_PER_HOUR || MailApp.getRemainingDailyQuota() < 1) {
      throw new Error('The intake service is temporarily busy. Please contact Brian directly.');
    }
    const business = cleanSingleLine_(intake.client.business_name, 120);
    const label = intake.submission_kind === 'initial_call' ? 'Call preparation' : 'Follow-up question';
    const filename = slug_(business) + '-' + intake.submission_kind + '-' + dateStamp_() + '.json';
    const lines = [label + ' submitted through olsenautomation.com.', '',
      'Business: ' + business, 'Contact: ' + cleanSingleLine_(intake.client.contact_name, 120),
      'Reply email: ' + email, 'Reference: ' + intake.request_id, ''];
    Object.keys(answers).forEach(function(answerKey) {
      lines.push(answerKey.replace(/_/g, ' ').toUpperCase() + ':', answers[answerKey] || '(not supplied)', '');
    });
    lines.push('This is a nonbinding marketing conversation, not authorization to publish, bill, or book a call.');
    MailApp.sendEmail(CONFIG.RECIPIENT, 'Client Conversation — ' + label + ' — ' + business, lines.join('\n'), {
      attachments:[Utilities.newBlob(json, 'application/json', filename)], name:'Olsen Automation Intake', replyTo:email
    });
    cache.put(key, hash, CONFIG.DUPLICATE_TTL_SECONDS);
    cache.put(rateKey, String(count + 1), 3600);
    return postResponse_({ok:true, accepted:true, request_id:intake.request_id, submission_id:hash.slice(0,16)});
  } finally { lock.releaseLock(); }
}

function validateFormAge_(startedAt) {
  const age = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || startedAt <= 0 || age < CONFIG.MIN_FORM_AGE_MS) {
    throw new Error('The form was submitted too quickly. Please try again.');
  }
  if (age > CONFIG.MAX_FORM_AGE_MS) {
    throw new Error('This form session expired. Please reload the page and try again.');
  }
}

function validatePayloadSize_(payloadText) {
  const bytes = Utilities.newBlob(payloadText).getBytes().length;
  if (!payloadText || bytes > CONFIG.MAX_PAYLOAD_BYTES) {
    throw new Error('The intake file is empty or too large.');
  }
}

function validateIntake_(intake) {
  if (!intake || typeof intake !== 'object' || Array.isArray(intake)) {
    throw new Error('The intake format is invalid.');
  }
  if (intake.intake_type !== CONFIG.EXPECTED_INTAKE_TYPE) {
    throw new Error('The intake type is not supported.');
  }
  if (intake.source_page !== CONFIG.EXPECTED_SOURCE_PAGE) {
    throw new Error('The intake source is not recognized.');
  }
  if (!intake.client || !intake.visibility || !intake.confirmations) {
    throw new Error('Required intake sections are missing.');
  }
  if (!intake.confirmations.authorized_representative || !intake.confirmations.no_secrets_or_private_customer_data) {
    throw new Error('Required confirmations are missing.');
  }
  if (!intake.client.business_name || !intake.client.contact_name || !cleanEmail_(intake.client.contact_email)) {
    throw new Error('Required contact information is missing.');
  }
  if (!Array.isArray(intake.visibility.target_queries) || intake.visibility.target_queries.length < 1 || intake.visibility.target_queries.length > 20) {
    throw new Error('Provide between 1 and 20 target queries.');
  }
  if (intake.access_readiness && intake.access_readiness.credentials_included !== false) {
    throw new Error('Credential-bearing submissions are not accepted.');
  }
}

function rejectSecretFields_(value, path) {
  const currentPath = path || 'intake';
  const forbiddenKey = /(password|passcode|api.?key|access.?token|refresh.?token|secret|credit.?card|card.?number|cvv|social.?security|ssn)/i;
  if (Array.isArray(value)) {
    value.forEach(function(item, index) { rejectSecretFields_(item, currentPath + '[' + index + ']'); });
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.keys(value).forEach(function(key) {
    // These explicit booleans are safety declarations, not credential values.
    const safeDeclaration =
      (key === 'credentials_included' && value[key] === false) ||
      (key === 'no_secrets_or_private_customer_data' && value[key] === true);
    if (safeDeclaration) return;
    if (forbiddenKey.test(key)) {
      throw new Error('Remove secret or credential fields before submitting.');
    }
    rejectSecretFields_(value[key], currentPath + '.' + key);
  });
}

function enforceRateAndDuplicateLimits_(digest) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const cache = CacheService.getScriptCache();
    const duplicateKey = 'intake:' + digest;
    if (cache.get(duplicateKey)) {
      throw new Error('This intake was already received recently.');
    }

    const bucket = Math.floor(Date.now() / 3600000);
    const rateKey = 'hour:' + bucket;
    const count = Number(cache.get(rateKey) || 0);
    if (count >= CONFIG.MAX_ACCEPTED_PER_HOUR) {
      throw new Error('The intake service is temporarily busy. Please try again later.');
    }

    cache.put(rateKey, String(count + 1), 3600);
    cache.put(duplicateKey, '1', CONFIG.DUPLICATE_TTL_SECONDS);
  } finally {
    lock.releaseLock();
  }
}

function digest_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function cleanSingleLine_(value, maxLength) {
  return String(value || '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, maxLength || 200);
}

function cleanEmail_(value) {
  const email = cleanSingleLine_(value, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid contact email is required.');
  }
  return email;
}

function slug_(value) {
  return cleanSingleLine_(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business';
}

function dateStamp_() {
  return Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd');
}

function safeError_(error) {
  const message = cleanSingleLine_(error && error.message ? error.message : 'The intake could not be accepted.', 180);
  return message || 'The intake could not be accepted.';
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function postResponse_(payload) {
  const envelope = JSON.stringify({
    channel: 'olsen_ai_visibility_intake',
    payload: payload
  }).replace(/</g, '\\u003c');
  const html = [
    '<!doctype html><meta charset="utf-8">',
    '<title>AI Visibility intake response</title>',
    '<p>Submission processed. You may close this page.</p>',
    '<script>window.top.postMessage(' + envelope + ', "*");<\/script>'
  ].join('');
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

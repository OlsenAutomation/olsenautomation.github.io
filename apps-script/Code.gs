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
  try {
    const parameters = e && e.parameter ? e.parameter : {};

    // Quietly accept likely bot submissions so the trap is not advertised.
    if (String(parameters.company_website_confirm || '').trim()) {
      return postResponse_({ ok: true, accepted: true });
    }

    const formStartedAt = Number(parameters.form_started_at || 0);
    validateFormAge_(formStartedAt);

    const payloadText = String(parameters.payload || '');
    validatePayloadSize_(payloadText);

    const intake = JSON.parse(payloadText);
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
      error: safeError_(error)
    });
  }
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

(() => {
  'use strict';
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwtqcIqB02Q_BT4d5c3z1OCy6rQif5Jeyg897wQLBoY6UA5vHBR8NOcOdh1SAbmFC3FTQ/exec';
  const SOURCE_PAGE = 'https://olsenautomation.com/conversation/joe-v-7c4e9a/';
  const CHANNEL = 'olsen_ai_visibility_intake';
  const TIMEOUT_MS = 30000;
  const prep = document.getElementById('prep-form');
  const steps = [...prep.querySelectorAll('[data-step]')];
  const back = prep.querySelector('[data-back]');
  const next = prep.querySelector('[data-next]');
  const prepSubmit = prep.querySelector('[type="submit"]');
  const states = [];
  let activeStep = 0;

  const field = (form, name) => String(form.elements.namedItem(name)?.value || '').trim();
  const uuid = () => crypto.randomUUID();
  const answerFields = {
    main_goal: ['goal', 'Customer conversations and service area'],
    current_inquiries: ['current_inquiries', 'Current inquiry sources and baseline'],
    inquiry_path_and_ownership: ['inquiry_path_and_ownership', 'First step, inquiry path and account ownership'],
    customer_questions_and_difference: ['customer_questions_and_difference', 'Customer questions and what sets you apart'],
    content_accounts_and_permissions: ['content_accounts_and_permissions', 'Available content, accounts and permissions'],
    content_approval_process: ['content_approval_process', 'NEXA content review and approval'],
    questions_and_concerns: ['questions_and_concerns', 'Questions and concerns for our call'],
    desired_next_decision: ['desired_next_decision', 'What you want to decide together']
  };

  function reviewAnswers() {
    const list = document.createElement('dl');
    const entries = [['Name', field(prep, 'contact_name')], ['Reply email', field(prep, 'contact_email')], ['Business', field(prep, 'business_name') || 'Valencia Lending Group']];
    Object.entries(answerFields).forEach(([name, [, label]]) => entries.push([label, field(prep, name)]));
    entries.forEach(([label, value]) => {
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value || 'We can discuss this on the call.';
      list.append(term, description);
    });
    document.getElementById('answer-review').replaceChildren(list);
  }

  function setStep(index, focus = true) {
    activeStep = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, i) => { step.hidden = i !== activeStep; });
    prep.querySelectorAll('[data-step-label]').forEach((label, i) => {
      if (i === activeStep) label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
    });
    back.hidden = activeStep === 0;
    next.hidden = activeStep === steps.length - 1;
    prepSubmit.hidden = activeStep !== steps.length - 1;
    document.getElementById('step-position').textContent = `Step ${activeStep + 1} of ${steps.length}`;
    if (activeStep === steps.length - 1) reviewAnswers();
    if (focus) {
      const legend = steps[activeStep].querySelector('legend');
      legend.tabIndex = -1;
      legend.focus({preventScroll: true});
      document.getElementById('call-prep').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
    }
  }

  function validateArea(area) {
    const invalid = [...area.querySelectorAll('input,select,textarea')].find(input => !input.checkValidity());
    if (!invalid) return true;
    const step = invalid.closest('[data-step]');
    if (step) setStep(Number(step.dataset.step), false);
    invalid.focus();
    invalid.reportValidity();
    return false;
  }

  next.addEventListener('click', () => {
    if (!validateArea(steps[activeStep])) return;
    document.getElementById('prep-status').textContent = '';
    setStep(activeStep + 1);
  });
  back.addEventListener('click', () => setStep(activeStep - 1));
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
  setStep(0, false);

  function buildSnapshot(state) {
    const form = state.form;
    const answers = {};
    if (state.kind === 'initial_call') {
      Object.entries(answerFields).forEach(([name, [key]]) => { answers[key] = field(form, name); });
    } else {
      answers.topic = field(form, 'topic');
      answers.question = field(form, 'question');
    }
    return {
      intake_type: 'olsen_automation_client_conversation',
      source_page: SOURCE_PAGE,
      submission_kind: state.kind,
      client: {
        business_name: field(form, 'business_name') || 'Valencia Lending Group',
        contact_name: field(form, 'contact_name'),
        contact_email: field(form, 'contact_email')
      },
      answers,
      confirmations: {no_secrets_or_private_customer_data: form.elements.namedItem('privacy_confirmation').checked}
    };
  }

  function status(state, message, className = '') {
    state.status.textContent = message;
    state.status.className = `form-status ${className}`.trim();
  }

  function lock(state, locked) {
    state.submit.disabled = locked;
    if (state.kind === 'initial_call') {
      back.disabled = locked;
      next.disabled = locked;
    }
    [...state.form.querySelectorAll('input,select,textarea')].forEach(input => { input.disabled = locked; });
  }

  function submit(state) {
    if (state.phase === 'pending' || state.phase === 'uncertain' || state.phase === 'accepted') return;
    if (!validateArea(state.form)) return;
    if (Date.now() - state.startedAt < 4000) {
      status(state, 'Please take a moment to review your answers, then send.', 'error');
      return;
    }
    const snapshot = buildSnapshot(state);
    const signature = JSON.stringify(snapshot);
    // A retry of unchanged answers keeps its request ID and exact JSON payload.
    // Unknown delivery never enables a resend; Brian must check his inbox first.
    if (!state.payload || state.signature !== signature) {
      state.signature = signature;
      state.payload = {...snapshot, request_id: uuid()};
    }
    state.phase = 'pending';
    status(state, 'Sending to Brian… Please keep this page open while we check receipt.', 'pending');
    const delivery = document.createElement('form');
    delivery.method = 'post';
    delivery.action = ENDPOINT;
    delivery.target = state.frame.name;
    delivery.hidden = true;
    const parameters = {
      form_started_at: String(state.startedAt),
      company_website_confirm: field(state.form, 'company_website_confirm'),
      payload: JSON.stringify(state.payload)
    };
    Object.entries(parameters).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = name; input.value = value;
      delivery.append(input);
    });
    document.body.append(delivery);
    lock(state, true);
    state.timer = setTimeout(() => {
      if (state.phase !== 'pending') return;
      state.phase = 'uncertain';
      status(state, `Receipt is not confirmed. Your answers remain on this page, and they may already have reached Brian. Please contact him before sending again. Reference: ${state.payload.request_id}`, 'pending');
      state.submit.textContent = 'Receipt not confirmed';
    }, TIMEOUT_MS);
    try {
      delivery.submit();
    } catch (_) {
      clearTimeout(state.timer);
      state.phase = 'uncertain';
      status(state, `The browser could not confirm submission. Contact Brian before sending again. Reference: ${state.payload.request_id}`, 'pending');
      state.submit.textContent = 'Receipt not confirmed';
    } finally {
      delivery.remove();
    }
  }

  function prepareForm(id, kind, frameId, statusId, successId) {
    const form = document.getElementById(id);
    const state = {form, kind, frame: document.getElementById(frameId), status: document.getElementById(statusId), success: document.getElementById(successId), submit: form.querySelector('[type="submit"]'), startedAt: Date.now(), phase: 'ready', payload: null, signature: null, timer: null};
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (kind === 'initial_call' && activeStep < steps.length - 1) {
        if (validateArea(steps[activeStep])) setStep(activeStep + 1);
        return;
      }
      submit(state);
    });
    states.push(state);
  }
  prepareForm('prep-form', 'initial_call', 'prep-receiver', 'prep-status', 'prep-success');
  prepareForm('followup-form', 'follow_up', 'followup-receiver', 'followup-status', 'followup-success');

  window.addEventListener('message', event => {
    const trusted = /^https:\/\/([a-z0-9-]+\.)*(script\.google\.com|googleusercontent\.com)$/i.test(event.origin);
    if (!trusted || event.data?.channel !== CHANNEL) return;
    const result = event.data.payload;
    if (!result || typeof result.request_id !== 'string') return;
    const state = states.find(item => ['pending', 'uncertain'].includes(item.phase) && item.payload?.request_id === result.request_id);
    if (!state) return;
    clearTimeout(state.timer);
    if (result.ok === true && result.accepted === true && typeof result.submission_id === 'string' && result.submission_id) {
      state.phase = 'accepted';
      status(state, 'Receipt confirmed. Thank you.');
      state.submit.textContent = 'Sent to Brian';
      state.success.querySelector('.receipt').textContent = `Receipt: ${result.submission_id}`;
      state.success.hidden = false;
      state.success.focus({preventScroll: true});
      state.success.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      return;
    }
    if (result.accepted === false) {
      state.phase = 'rejected';
      lock(state, false);
      state.submit.textContent = state.kind === 'initial_call' ? 'Send answers to Brian' : 'Send question to Brian';
      status(state, (typeof result.error === 'string' ? result.error.slice(0, 350) : 'The intake service did not accept this submission.') + ' Your answers are still here. Correct the issue or contact Brian for help.', 'error');
    }
  });

  window.addEventListener('beforeunload', event => {
    if (!states.some(state => ['pending', 'uncertain'].includes(state.phase))) return;
    event.preventDefault();
    event.returnValue = '';
  });
})();

(() => {
      const form = document.getElementById('visibility-intake');
      const progressBar = document.getElementById('progress-bar');
      const progressLabel = document.getElementById('progress-label');
      const status = document.getElementById('form-status');
      const successPanel = document.getElementById('success-panel');
      const downloadAgain = document.getElementById('download-again');
      const submitButton = document.getElementById('submit-intake');
      const receiverFrame = document.getElementById('intake-receiver-frame');
      const receiverEndpoint = 'https://script.google.com/macros/s/AKfycbwtqcIqB02Q_BT4d5c3z1OCy6rQif5Jeyg897wQLBoY6UA5vHBR8NOcOdh1SAbmFC3FTQ/exec';
      const isLocal = ['127.0.0.1','localhost'].includes(location.hostname);
      const previewOnly = document.body.dataset.siteMode !== 'production';
      const localMode = new URLSearchParams(location.search).get('intake-test') || 'accepted';
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const formStartedAt = Date.now();
      if(isLocal || previewOnly){const note=document.createElement('p');note.className='notice';note.textContent=isLocal ? 'Local review: this intake uses an isolated test receiver. Nothing is sent to Olsen Automation.' : 'Preview: prepare a downloadable intake draft. This preview does not submit your answers.';form.prepend(note);}
      let lastDownload = null;
      let lastFilename = '';
      let deliveryTimer = null;

      const lines = (value) => value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
      const checked = (name) => Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map(input => input.value);
      const value = (name) => (form.elements[name]?.value || '').trim();

      function updateProgress() {
        const required = Array.from(form.querySelectorAll('[required]'));
        const groups = new Map();
        required.forEach(field => {
          const key = field.type === 'radio' ? `radio:${field.name}` : field.id || field.name;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(field);
        });
        let complete = 0;
        groups.forEach(fields => {
          if (fields.some(field => field.type === 'checkbox' || field.type === 'radio' ? field.checked : field.value.trim() !== '')) complete += 1;
        });
        const percent = groups.size ? Math.round((complete / groups.size) * 100) : 0;
        progressBar.style.width = `${percent}%`;
        progressLabel.textContent = `${percent}%`;
      }

      function buildIntake() {
        let domain = '';
        try { domain = new URL(value('website')).hostname.replace(/^www\./, ''); } catch (_) { domain = ''; }
        const businessName = value('business_name');
        const brandVariants = Array.from(new Set([businessName, domain, ...lines(value('brand_variants'))].filter(Boolean)));
        const requiredApprovals = Array.from(form.querySelectorAll('[name="approval_actions"]')).map(input => input.value);

        return {
          schema_version: '1.0.0',
          intake_type: 'olsen_automation_ai_visibility',
          created_at_utc: new Date().toISOString(),
          source_page: 'https://olsenautomation.com/ai-visibility.html',
          client: {
            business_name: businessName,
            website: value('website'),
            domain,
            contact_name: value('contact_name'),
            contact_email: value('contact_email'),
            public_email: value('public_email'),
            public_phone: value('public_phone'),
            main_location: value('location'),
            timezone: value('timezone'),
            business_model: value('business_model'),
            public_address: value('public_address'),
            primary_service: value('primary_service'),
            services: lines(value('services')),
            service_areas: lines(value('service_areas')),
            brand_variants: brandVariants,
            known_competitors: lines(value('competitors'))
          },
          visibility: {
            target_queries: lines(value('queries')),
            engines_requested: ['grok', 'perplexity', 'bing_copilot'],
            cadence: 'weekly',
            report_period_days: 14,
            report_email: value('report_email')
          },
          public_footprint: {
            google_business_profile: value('google_business_profile'),
            apple_business_connect: value('apple_business_connect'),
            yelp: value('yelp'),
            booking_url: value('booking_url'),
            other_profiles: lines(value('other_profiles')),
            cms_platform: value('cms_platform'),
            cms_login_url: value('cms_login_url')
          },
          access_readiness: {
            google_business_profile: value('google_business_status'),
            google_search_console: value('search_console_status'),
            bing_webmaster_tools: value('bing_webmaster_status'),
            apple_business_connect: value('apple_business_status'),
            credentials_included: false,
            access_method: 'official_invitation_only'
          },
          operating_permissions: {
            automatic_actions_requested: checked('automatic_actions'),
            approval_always_required: requiredApprovals,
            photo_consent_policy: value('photo_consent_policy'),
            notes: value('notes'),
            final_scope_requires_separate_confirmation: true
          },
          confirmations: {
            authorized_representative: document.getElementById('authority').checked,
            no_secrets_or_private_customer_data: document.getElementById('no-secrets').checked
          },
          handoff: {
            recipient: 'brian@olsenautomation.com',
            next_step: 'Intake prepared. Delivery requires a receiver acknowledgement; setup and scope require validation before a local workflow is created.'
          }
        };
      }

      function downloadIntake(payload) {
        const slug = (payload.client.business_name || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 54) || 'business';
        const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
        const filename = `${slug}-ai-visibility-intake-${date}.json`;
        const blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        lastDownload = payload;
        return filename;
      }

      function sendIntake(payload) {
        if(previewOnly && !isLocal)return;
        const deliveryForm = document.createElement('form');
        deliveryForm.method = 'post';
        deliveryForm.action = isLocal ? '/__test/intake-receiver?mode='+encodeURIComponent(localMode) : receiverEndpoint;
        deliveryForm.target = receiverFrame.name;
        deliveryForm.hidden = true;
        const fields = {
          company_website_confirm: value('company_website_confirm'),
          form_started_at: String(formStartedAt),
          payload: JSON.stringify(payload)
        };
        Object.entries(fields).forEach(([name, fieldValue]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = fieldValue;
          deliveryForm.appendChild(input);
        });
        document.body.appendChild(deliveryForm);
        deliveryForm.submit();
        deliveryForm.remove();
      }

      window.addEventListener('message', event => {
        const trustedGoogleOrigin = /^https:\/\/([a-z0-9-]+\.)*(script\.google\.com|googleusercontent\.com)$/i.test(event.origin);
        const trusted = isLocal ? event.origin === location.origin && event.source === receiverFrame.contentWindow : trustedGoogleOrigin;
        if (!trusted || event.data?.channel !== 'olsen_ai_visibility_intake' || !submitButton.disabled) return;
        clearTimeout(deliveryTimer);
        submitButton.disabled = false;
        const result = event.data.payload || {};
        if (!result.ok || !result.accepted) {
          status.textContent = `${result.error || 'Delivery could not be confirmed.'} Your backup was still downloaded.`;
          status.classList.add('error');
          return;
        }
        status.classList.remove('error');
        status.textContent = `${isLocal ? 'Local test accepted; nothing was sent.' : 'Sent to Olsen Automation.'} Downloaded backup: ${lastFilename}`;
        successPanel.classList.add('visible');
        if(isLocal){successPanel.replaceChildren();const h=document.createElement('h3');h.textContent='Local receiver test completed.';const p=document.createElement('p');p.textContent='The synthetic acknowledgement passed. No intake or email was delivered.';successPanel.append(h,p);}
        successPanel.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'nearest' });
      });

      form.addEventListener('input', updateProgress);
      form.addEventListener('change', updateProgress);

      form.addEventListener('submit', event => {
        event.preventDefault();
        status.classList.remove('error');
        successPanel.classList.remove('visible');
        if (!form.checkValidity()) {
          form.reportValidity();
          const firstInvalid = form.querySelector(':invalid');
          firstInvalid?.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
          status.textContent = 'Please complete the highlighted required information before creating the file.';
          status.classList.add('error');
          return;
        }
        const payload = buildIntake();
        lastFilename = downloadIntake(payload);
        if(previewOnly && !isLocal){status.textContent='Draft downloaded. Nothing has been sent.';return;}
        submitButton.disabled = true;
        status.textContent = `${isLocal ? 'Testing the local receiver…' : 'Sending intake to Olsen Automation…'} Backup downloaded: ${lastFilename}`;
        sendIntake(payload);
        clearTimeout(deliveryTimer);
        deliveryTimer = setTimeout(() => {
          submitButton.disabled = false;
          status.textContent = 'Your backup downloaded, but delivery could not be confirmed. Please try sending again.';
          status.classList.add('error');
        }, 20000);
      });

      downloadAgain.addEventListener('click', () => {
        if (lastDownload) downloadIntake(lastDownload);
      });

      if(previewOnly && !isLocal)submitButton.textContent='Download intake draft';
      submitButton.hidden=false;
      updateProgress();
    })();

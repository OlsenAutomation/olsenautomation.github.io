const accessForm = document.querySelector('#access-form');
    const familyEmail = document.querySelector('#family-email');
    const formStatus = document.querySelector('#form-status');
    const copyButton = document.querySelector('#copy-invite');
    const copyStatus = document.querySelector('#copy-status');

    accessForm.querySelector('button[type=submit]').hidden=false;
    accessForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = familyEmail.value.trim();
      if (!familyEmail.checkValidity()) {
        familyEmail.reportValidity();
        return;
      }
      const subject = encodeURIComponent('Family Card Chaos access request');
      const body = encodeURIComponent(`Hi Brian,\n\nPlease add this email address to the Family Card Chaos approved-family list:\n\n${email}\n\nPlease let me know when access is ready. Thanks!`);
      if(document.body.dataset.siteMode==='preview'){
        formStatus.textContent='Draft prepared. Nothing has been sent. ';
        const link=document.createElement('a');link.href=`mailto:brian@olsenautomation.com?subject=${subject}&body=${body}`;link.textContent='Review in your email app';formStatus.append(link);return;
      }
      formStatus.textContent = 'Opening your mail app. Review the message, then press Send.';
      window.location.href = `mailto:brian@olsenautomation.com?subject=${subject}&body=${body}`;
    });

    const inviteText = `Family game night! We’re using Family Card Chaos, a private browser game that works on phones, iPads, and computers.\n\n1. Read the setup guide and request access: https://olsenautomation.com/family-card-chaos-access.html\n2. Wait for Brian to confirm your email was added.\n3. Open https://play.olsenfamilygames.com/ and enter that approved email.\n4. Cloudflare will email you a one-time sign-in code—no account or app needed.\n5. Once the game opens, choose Join a game and enter the six-digit room code from the host.\n\nSee you at the table!`;

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(inviteText);
        copyStatus.textContent = 'Invite copied. Paste it into your family text thread.';
        copyButton.textContent = 'Copied!';
      } catch {
        const fallback = document.createElement('textarea');
        fallback.value = inviteText;
        fallback.setAttribute('readonly', '');
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.appendChild(fallback);
        fallback.select();
        const copied = document.execCommand('copy');
        fallback.remove();
        copyStatus.textContent = copied ? 'Invite copied. Paste it into your family text thread.' : 'Copy did not work. Select the guide address from your browser instead.';
        if (copied) copyButton.textContent = 'Copied!';
      }
    });

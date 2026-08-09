# AI Visibility intake receiver

This standalone Google Apps Script receives the public AI Visibility intake and emails one JSON attachment to the fixed address `brian@olsenautomation.com`.

## Deployment settings

- Owner: Olsen Automation Google Workspace account
- Project: `Olsen Automation AI Visibility Intake Receiver`
- Type: Web app
- Execute as: Me
- Access: Anyone
- Required Google scope: send email as the deploying account

Never change the recipient to a form-controlled value. The public page may supply customer information, but only the checked-in `CONFIG.RECIPIENT` is allowed to receive submissions.

## Included safeguards

- fixed recipient
- maximum payload size
- required source and intake type
- required no-secrets and authorized-representative confirmations
- suspicious credential-field rejection
- honeypot support
- minimum and maximum form age
- duplicate suppression
- per-hour intake limit
- Google Workspace email quota check

The customer-facing page must use a normal form POST to the deployed `/exec` URL. This avoids placing Google authorization or mail credentials in the browser.

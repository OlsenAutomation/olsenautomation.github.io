# Olsen Automation website setup

Public direct-link guide at https://olsenautomation.com/client-setup/. It is unlisted from site navigation and sitemap, with noindex metadata. Unlisted and noindex do not provide confidentiality or authentication.

Standalone HTML/CSS/JavaScript, no dependencies or backend. Uses the business invitation address brian@olsenautomation.com. Only the current step and invitation self-report persist in localStorage under olsen-automation-client-setup-v1. Reset removes that entry; nothing changes in Wix. No tracking, credential entry or account connection.

Website Designer is the starting design role. Actual Wix invitations, acceptance, editor permissions, plan compatibility and owner approval are performed separately. Replacement-site handoff remains conditional; automatic cross-editor migration is not promised.

The existing release pipeline copies this directory into production. The existing Worker serves /client-setup/ without visitor-notification calls, applies noindex/no-store and rejects non-GET/HEAD requests. It redirects /client-setup to the slash URL.

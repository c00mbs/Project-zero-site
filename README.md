# PROJECT ZERO — Official Website

A responsive, cinematic landing page for the PROJECT ZERO game, with:
- Story, world, gameplay, Pixel, and Sanctuary sections
- Signup form with explicit consent and honeypot field
- Cloudflare Pages Functions API
- Cloudflare D1 subscriber database
- Double opt-in confirmation email through Resend
- Confirmation screen (`/thank-you.html`) and verified signup screen (`/welcome.html`)
- Privacy and terms starter pages
- Google Ads conversion destination: `/welcome.html` (confirmed subscribers only)

## Hosting recommendation

Use Cloudflare Pages (free static hosting tier) + Cloudflare D1 + Pages Functions. Register a domain through Cloudflare Registrar if the desired name is available, or another registrar and point DNS to Cloudflare.

Suggested names to check at registration (availability is not confirmed):
- `playprojectzero.com`
- `projectzero.game`
- `projectzero.world`
- `projectzeroofficial.com`

## Before public launch

1. Create a Cloudflare account.
2. Create a D1 database named `project-zero-subscribers`.
3. Run `schema.sql` against the database.
4. Copy the D1 database ID into `wrangler.toml`.
5. Connect this repository to Cloudflare Pages, with the repository root as the build output directory and no build command.
6. Add Pages environment variables:
   - `SITE_URL` = your final HTTPS domain, e.g. `https://playprojectzero.com`
   - `RESEND_API_KEY` = API key from Resend
   - `FROM_EMAIL` = a sender address on a domain verified with Resend, e.g. `PROJECT ZERO <updates@yourdomain.com>`
   - `RATE_LIMIT_SALT` = a long random secret
7. Bind the D1 database to the Pages project with binding name `DB`.
8. Deploy and test signup using an email address you control.
9. Confirm the email; verify that the browser reaches `/welcome.html` and that the D1 row status becomes `confirmed`.
10. Test unsubscribe handling and update the privacy page with a monitored contact email and publisher details.

## Local development

Install Wrangler, authenticate to Cloudflare, then:

```bash
npm install -g wrangler
wrangler pages dev .
```

For local function testing, configure a local D1 binding and the required environment variables. Do not commit API keys or secrets.

## Google Ads conversion tracking

For lead-quality reporting, use the verified confirmation page as the conversion destination:
- URL contains: `/welcome.html`
- Conversion name: `PROJECT ZERO — Confirmed Email Signup`
- Goal: Lead / Sign-up
- Count: One

The `/thank-you.html` page means the confirmation email was sent; `/welcome.html` means the player clicked the email confirmation link. Track `/welcome.html` if you want confirmed subscribers rather than unverified form submissions.

Google Ads conversion tags / Google tag ID are not included yet because the account-specific tag ID must come from your Google Ads account. Add it after the site is deployed and the domain is final.

## Important launch checklist

- Check and purchase the domain; suggested names above are not confirmed available.
- Configure Resend sender-domain verification and secrets.
- Replace placeholder legal contact information.
- Add the publisher's real contact details.
- Add official social/community links only when accounts exist.
- Add final game screenshots/trailer when available.
- Do not advertise beta access unless a real beta program exists.
- Review privacy/terms with appropriate legal guidance before collecting public leads.
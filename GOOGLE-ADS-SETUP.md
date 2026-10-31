# Google Ads setup

After the domain is connected and the website is live:

1. In Google Ads, create a Website conversion action.
2. Choose the Leads / Sign-up category.
3. Use the URL rule `URL contains /welcome.html`.
4. Name it `PROJECT ZERO — Confirmed Email Signup`.
5. Set Count to `One`.
6. Install the Google tag on all pages (or use Google Tag Manager) and verify the conversion with Tag Assistant.
7. Test a full signup and click the confirmation link in the email. Only the verified route `/welcome.html` should count as a completed signup.

The page URL alone is not a complete tracking setup until the Google tag / conversion action has been configured in the actual Google Ads account.
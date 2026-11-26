@AGENTS.md

# Pont Academy

Marketing site only (the admin/teacher/student portal, API routes, Prisma DB and R2 storage were removed). See README.md.

- Forms: `src/app/actions.ts` (`submitBasvuruForm`, `submitContactForm`) mail the submission via `src/lib/mail.ts` (nodemailer, SMTP_* / MAIL_TO env). The photo input (`name="photo"`) is attached to the mail; nothing is stored.
- Home page content that used to be admin settings comes from env via `src/lib/site.ts` (SITE_* vars), read per request.

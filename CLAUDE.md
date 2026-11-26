@AGENTS.md

# Pont Academy

Marketing site only (the admin/teacher/student portal, API routes, Prisma DB and R2 storage were removed). See README.md.

- Forms: online submissions are closed. `src/app/actions.ts` (`submitBasvuruForm`, `submitContactForm`) store and send nothing; they return an error that shows the contact phone so visitors call instead.
- Home page content that used to be admin settings comes from env via `src/lib/site.ts` (SITE_* vars), read per request.

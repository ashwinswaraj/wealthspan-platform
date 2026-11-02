# Seeding the first admin

There is no seed script: Wealthspan admins are _pinned_, not stored.

1. In `apps/api/catalyst/functions/finance/catalyst-config.json` set `ADMIN_EMAILS` (the admin's email) and
   `ADMIN_USER_IDS` (the admin's Catalyst user id: Console → Cloud Scale → Authentication → Users).
2. Sign up once from the app with that email (Google, Zoho or email), then deploy.
3. An admin must match BOTH lists; anyone else gets 403 on `/app/admin/`.

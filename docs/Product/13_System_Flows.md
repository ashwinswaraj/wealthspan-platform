# System Flows

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## 1. Sign-in
User opens `/app/` → Catalyst Embedded Authentication (Google / Zoho / email) → session cookie → functions read the user from the session.

## 2. Add an entry
Sheet row (or chat) → `POST /transactions` → validation (`packages/validation`) → payment mode must suit the account → store (Data Store, keyed by `user_id`) → audit entry. Card-bill-looking expenses trigger a "record as transfer instead?" warning.

## 3. Conclude a festival
Confirm → event status `concluded` → its expenses now count in Expense on their own dates.

## 4. Ask the accountant
Message → `chat` function → daily quota check (40/day) → Sarvam with the user's context → answer. Numbers come from `packages/utils/src/finance.ts`. Tool calls that write data: Planned.

## 5. Export
Choose format and range → `GET /server/files/export?format=csv|xlsx|docx|pdf&from&to&projectId` → file download.

## 6. Subscribe
Start trial once → or pay by UPI and submit the 12-digit UTR (`POST /subscription/payments`) → admin approves in `apps/admin` → subscription starts. Automated gateway: TBD.

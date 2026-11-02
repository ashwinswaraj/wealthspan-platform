# API Specification

> Status: Draft · Last updated: 2026-11-01

Base: `/server/<function>`. Login required everywhere (401 otherwise). Writes need header `X-Requested-With: wealthspan` (403 otherwise). Source of truth: the `entry.ts` files.

## finance

| Route                                                             | Purpose                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| `GET /me`                                                         | 200 if logged in                                        |
| `GET /transactions?from&to&projectId&accountId&type&limit&offset` | list                                                    |
| `POST /transactions`, `PATCH                                      | DELETE /transactions/:id`                               | create / edit / soft delete                                  |
| `GET /summary?from&to&projectId`                                  | totals computed by `packages/utils`                     |
| `GET                                                              | POST /projects                                          | accounts                                                     | events               | loans      | investments`, `PATCH | DELETE /<entity>/:id`       | catalog (409 if still in use) |
| `POST /events/:id/conclude                                        | reopen`, `/loans/:id/close                              | reopen`, `/projects                                          | accounts/:id/archive | unarchive` | state changes        |
| `GET /subscription`                                               | plan, `active`, `endsOn`, `daysLeft`, `trialUsed`       |
| `POST /subscription/trial`                                        | start the free 1-month trial (409 if already used)      |
| `GET                                                              | POST /subscription/payments`                            | my payment submissions / submit plan + 12-digit UTR + amount |
| `GET /admin/me`                                                   | am I an admin (and, if listed but unpinned, my user id) |
| `GET /admin/overview                                              | users                                                   | payments                                                     | ledger               | audit      | health`              | admins only (403 otherwise) |
| `POST /admin/payments/:id/approve                                 | reject`                                                 | admins only, optional `note`                                 |

Limits: 90 writes/min and 300 reads/min per user (per instance).

## chat

`POST /chat` with `{ messages: [{ role, content }] }`: last 12 messages, 2000 chars each. Returns `{ reply, usage }`. Errors: `402 subscription_required` (no live trial/plan), `429 daily_limit` (40 messages per IST day), `400 validation`, provider errors 502. Tool calls (create/update/delete with server-side confirmation) are Planned; today it is plain Q&A.

## files

| Route                                 | Purpose        |
| ------------------------------------- | -------------- |
| `GET /export?format=csv               | xlsx           | docx                                                                                                              | pdf&from&to&projectId` | report file (PDF uses "Rs.") |
| `GET /sheet?sheet=<key>&month=YYYY-MM | all&projectId` | one sheet as `.xlsx`; keys: income, expense, debt-loan, savings-investing, festivals-functions, accounts, project |

Limit: 5 requests/min per client address.

## Errors

`{ error: "validation" | "forbidden" | "not_found" | "conflict" | "rate_limited" | "too_large" | "server" | ..., message, fields? }` with matching HTTP status.

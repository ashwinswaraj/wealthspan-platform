# Notifications

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Phase 1

No push, SMS or e-mail notification system is built. Users see in-app state only (trial days left, payment status). The admin panel has a notifications modal (`AdminNotificationsModal.tsx`) for admin-side alerts.

## Planned

| Notification | Channel | Phase |
| --- | --- | --- |
| Trial ending soon, payment approved / rejected | E-mail | Phase 2 |
| Budget cap reached, EMI due | In-app, then push | Phase 2 |
| Bank / SMS-detected transactions to review | Push | Phase 2 |

SMS and push are not in Phase 1 because there is no SMS reader or native app yet. See `docs/Integrations/50_Email.md`.

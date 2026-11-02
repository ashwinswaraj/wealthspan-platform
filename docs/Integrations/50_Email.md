# Email

> Status: Draft · Last updated: 2026-11-01

**Transactional email provider: TBD. Nothing in Wealthspan sends e-mail itself yet.**

- Login e-mails (verification, password reset for e-mail sign-in) are sent by Catalyst Authentication, configured in the Catalyst console, not by our code.
- Catalyst Mail's free tier is small (about 100 e-mails); it must be reviewed before launch if we send anything ourselves.
- Support and refund replies are manual e-mail from the owner's mailbox in Phase 1.

Planned e-mails (not built): payment received/approved/rejected, trial ending, data export ready. Each needs a provider decision, a sender domain with SPF/DKIM, and an unsubscribe rule for anything that is not strictly transactional.

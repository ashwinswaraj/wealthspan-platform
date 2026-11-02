# Form Standards

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

- Floating-label inputs with a visible label.
- Required fields marked and validated before submit; use shared Zod rules from `@wealthspan/validation` where they exist.
- Disable the submit button while saving; show a status message after.
- If a form does not save yet (plan editor, broadcast), say so in an inline notice.
- Destructive actions ask for confirmation.

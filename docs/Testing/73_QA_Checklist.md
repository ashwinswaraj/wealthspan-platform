# QA Checklist

> Status: Draft · Last updated: 2026-11-01

Manual checks before a release:

- [ ] Money: totals match a hand calculation; card-bill payment is a transfer; open-event spending is outside Expense until concluded.
- [ ] Isolation: second user cannot see or edit the first user's rows (including by guessing ids).
- [ ] Trial can be started once; chat blocked without trial or plan; daily limit message at 40.
- [ ] UTR flow: wrong amount rejected, duplicate UTR rejected, approval creates one subscription.
- [ ] Exports open correctly (PDF, Excel, CSV, Word); sheet .xlsx matches the screen.
- [ ] Admin panel refuses a non-admin; a listed e-mail with a wrong user id is refused.
- [ ] Writes without `X-Requested-With` are refused.
- [ ] Phone width, slow network, Hindi/Hinglish chat.

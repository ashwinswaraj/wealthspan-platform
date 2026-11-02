# Platform Documentation

> Status: Active · Owner: Ashwin Swaraj · Last updated: 2026-11-01

Specs for the Wealthspan user web app (`apps/web`, a TanStack Start SPA served under `/app/`): what a subscriber sees and does. The admin side lives in `docs/Admin/`.

Files are numbered by topic and organized flat in this folder:

| Range | Contents |
| --- | --- |
| `15`–`25`, `28`–`30` | App modules (Dashboard, Users Directory, Access Control, Admin team and roles, Plans and Catalog, Entries, Chatbot actions, Data quality, Subscription billing, Support and refunds, Communication, Audit and Logs, Security, System). |
| `26`–`27` | Platform rules and user-facing policies. |
| `31`–`36` | Lifecycles: entries and transactions, chatbot actions, data quality, subscription payment, support and refunds, subscriber account. |

Each doc says honestly what is shipped and what is Planned/TBD. UI patterns build on the shared design system in `docs/Frontend/`; the product model is `docs/Database/41_Wealthspan_Data_Model.md`; API contracts live in `docs/API/`.

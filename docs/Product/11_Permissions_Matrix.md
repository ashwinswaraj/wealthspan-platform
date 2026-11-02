# Permissions Matrix

> Status: Draft · Owner: Ashwin Swaraj · Last updated: 2026-11-01

Enforcement is server-side in the Catalyst functions; the UI only hides what a role cannot use.

| Action                                                                        | User     | Admin                                                    |
| ----------------------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| Read / write own transactions, projects, accounts, events, loans, investments | Yes      | No (admin reads are aggregate or recent-list views only) |
| Chat with the accountant (40 messages/day)                                    | Yes      | Yes (as a user)                                          |
| Export own data (PDF / Excel / CSV / Word)                                    | Yes      | Own only                                                 |
| Start free trial (once)                                                       | Yes      | n/a                                                      |
| Submit a UPI payment for a plan                                               | Yes      | n/a                                                      |
| Approve / reject a payment                                                    | No (403) | Yes                                                      |
| List users, subscriptions, recent ledger, audit log                           | No       | Yes (`/admin/*`)                                         |
| Edit plans and catalog                                                        | No       | Planned (plans are currently code constants)             |

Chatbot actions follow `CHATBOT_TOOL_POLICY`: reads run immediately, creates run with Undo, updates / deletes / event conclude-reopen need confirmation (see [State Machines](12_State_Machines.md)).

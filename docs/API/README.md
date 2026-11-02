# API Documentation

Contracts for the Catalyst functions in `apps/api` (finance, chat, files).

| File                      | Contents                                                |
| ------------------------- | ------------------------------------------------------- |
| `41_API_Architecture.md`  | How the functions are built, authenticated and guarded. |
| `42_API_Specification.md` | Every route, with auth and limits.                      |
| `43_Webhooks.md`          | Webhooks: none in Phase 1.                              |
| `44_Event_System.md`      | Events: the audit log; no event bus in Phase 1.         |

All routes are same-domain: `/server/<function>/<path>`. Errors are JSON `{ error, message, fields? }`.

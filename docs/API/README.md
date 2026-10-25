# API Documentation

Contracts for `apps/api` and the server functions in `apps/web`.

Files are numbered by topic:

| File | Contents |
| --- | --- |
| `41_API_Architecture.md` | API architecture and per-domain module breakdown. |
| `42_API_Specification.md` | Endpoint-by-endpoint specification (paths, payloads, responses). |
| `43_Webhooks.md` | Inbound/outbound webhook contracts and signature verification. |
| `44_Event_System.md` | Domain events emitted and consumed by the platform. |

Authentication and middleware topics (token issuance, sessions, rate limiting,
RBAC) will be added here as `apps/api` grows past the scaffold stage.

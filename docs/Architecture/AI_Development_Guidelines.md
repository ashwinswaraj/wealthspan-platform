# AI Development Guidelines

> Status: Active · Last updated: 2026-11-01

Root [`AGENTS.md`](../../AGENTS.md) is the authority. Read it, then the app's own `AGENTS.md`, then `docs/Database/41_Wealthspan_Data_Model.md` before touching money logic.

## Rules that matter most for Wealthspan

- **Numbers come from code, never from the model.** The chatbot calls tools; totals, balances and loan outstanding come from `packages/utils/src/finance.ts`. The model only explains them.
- **The chatbot never touches the database.** It calls fixed tools; the server enforces user id, validation and confirmation. Confirmation state lives on the server.
- **User id only from the Catalyst session.** Never accept it from a request body, query or prompt.
- **Money is integer paise.** No floats for amounts.
- **Do not invent shipped features.** Mark anything unbuilt as Planned or TBD (payment gateway, chat tools, SMS reader, Account Aggregator).
- **Do not invent legal or tax specifics.** Legal docs are drafts for a lawyer.
- **Verify against code** before documenting; several earlier docs described a product that no longer exists.
- No secrets in prompts, logs or the repo.

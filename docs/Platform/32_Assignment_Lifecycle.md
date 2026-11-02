# Chatbot Action Lifecycle

> Status: Planned (tools not built) · Owner: Ashwin Swaraj · Last updated: 2026-11-01

## Flow

1. User message reaches `POST /chat`; quota is consumed.
2. The model proposes a tool call from the fixed list (`CHATBOT_TOOL_POLICY`).
3. The server looks up the level with `confirmationFor(tool, affectedRows)`.
   - `none`: run and answer.
   - `undo`: run, show Undo.
   - `confirm`: store a pending action, show exactly what will change, wait.
4. On user confirmation the server runs it, writes the audit row (actor, tool, before, after), and replies. On decline nothing changes.
5. Undo sets `undone_at` and reverses the change.

More than 3 affected rows always escalates to `confirm`. Deletes are soft.

Built today: step 1 only. Steps 2 to 5 are Planned.

## References

- [Data model](../Database/41_Wealthspan_Data_Model.md)

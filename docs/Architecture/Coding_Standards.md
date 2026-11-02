# Wealthspan — Coding Standards & Refactoring Guide

This document is the single source of truth for how code gets written and
refactored in this repository. Every future change — by a human or by
Claude — should follow this guide. If a rule here conflicts with something
in the code, the code is wrong, not this file.

---

## 1. When to refactor a file

Decide by file size, not by mood:

| File size        | What to do                | Rule |
|------------------|----------------------------|------|
| 20–50 lines      | **Tidy up only.** Rename a variable/function only if the current name is genuinely confusing. Do not add comments just to add them. | Minimal touch |
| 100–200 lines    | **Extract functions.** Break logic into small, reusable functions. Any function over **30 lines** must be split. | Medium touch |
| 300+ lines        | **Modularize.** Split the file into a folder structure (see §5). Do this **first** for any file that changes almost every week — churn rate matters more than raw size. | Structural |

### YAGNI gate (applies before all of the above)

If a file hasn't been touched in ~3 months **and** it works correctly,
**do not touch it.** No drive-by renames, no "while I'm in here" cleanups.
Every line changed in a stable file is a line that can introduce a new bug
in code nobody was asking to change.

---

## 2. The 5 senior-developer formatting rules

1. **Self-documenting names.**
   Bad: `let d = new Date();`
   Good: `let userRegistrationDate = new Date();`
   The name should make the comment unnecessary.

2. **Single Responsibility Principle (SRP).**
   One function, one job. A function that validates a user, saves it to
   the DB, *and* sends an email is three functions wearing a trenchcoat.
   Split it into `validateUser()`, `saveUser()`, `sendWelcomeEmail()`, and
   call them in sequence from whatever orchestrates the flow.

3. **Top-to-bottom flow.**
   Every file reads in this order, no exceptions:
   ```
   Imports
   Constants / Config
   Types
   Helper functions
   Main execution logic / exported component
   ```

4. **No magic numbers or strings.**
   Bad: `if (user.role === 3)`
   Good: `const ADMIN_ROLE = 3; if (user.role === ADMIN_ROLE)`
   If a literal value has meaning beyond its immediate use, name it.

5. **Comments explain "why", never "what".**
   Bad: `// incrementing i by 1` above `i++;`
   Good: `// Retrying 3 times because the third-party API is unstable`
   The code already says *what* it does. A comment that repeats that is
   noise. Delete comments that don't survive this test.

---

## 3. The 4-step safe refactor method

Follow this order for every refactor, no matter how small:

1. **The Safety Net.** Before changing anything, know what "unchanged
   output" means for this code — a passing test, a visual before/after,
   or (in this repo, since we can't run `pnpm install`/tests in every
   environment) a bracket-balance + isolated type-check pass on the
   touched files as a minimum bar.
2. **Boy Scout Rule.** Only clean the 5–10 ugly lines that are actually in
   your way for the task at hand, in the area you're already touching.
   Don't go clean up an unrelated file just because you noticed it.
3. **Small commits.** One logical change → verify → commit. Never batch
   ten unrelated renames into one commit "to save time."
4. **Tooling.** Respect whatever the project's linter/formatter enforces
   (ESLint + Prettier here). Don't hand-format against the grain of the
   existing config.

### Definition of "done"

A refactor is done only when **all** of these are true:
- A new/junior developer can read the code without it being explained to
  them out loud.
- All existing tests still pass.
- The `git diff` is mostly **red** (deletions) — total line count should
  go **down**, not up. If your "refactor" added more lines than it
  removed, you probably extracted the wrong abstraction.

---

## 4. Import direction inside a feature

A shared module and its consumers depend in one direction only: shared
atoms are imported by feature files, never the reverse, and never sideways
between two sibling files. If two files need the same thing, move it to a
shared module. A barrel (`index.ts`) must not be imported by the files it
re-exports; circular imports fail silently at runtime and are a hard rule,
not a style preference.

---

## 5. Where logic lives (Wealthspan)

- Money calculations: `packages/utils/src/finance.ts` only.
- Input rules: `packages/validation/src/finance.ts`, used by client and server.
- Fixed lists (categories, payment modes, sheet columns, chatbot tool policy): `packages/constants`.
- Server business rules: `apps/api/src/features/<domain>/service.ts`; Data Store access only in `catalyst-store.ts`.
- Catalyst entry files (`functions/*/src/entry.ts`) only wire routes.

Large files: when a file passes ~300 lines and changes often, split it
into a folder with a barrel, one step at a time, with typecheck and tests
after each step.

---

## 6. Junk cleanup

Before finishing a change: no stray `console.log` (server errors log a
truncated message only, never secrets or full bodies), no unused exports
(grep each exported name, not just the file), no commented-out code, no
empty placeholder stubs in docs. Library scaffolding that is not used yet
(for example unused shadcn/ui primitives) may stay on purpose.

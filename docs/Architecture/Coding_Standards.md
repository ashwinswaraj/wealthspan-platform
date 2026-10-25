# Jobrio — Coding Standards & Refactoring Guide

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

## 4. Known exception in this repo: circular imports

This codebase uses plain ES module imports (no lazy/dynamic loading for
UI components). That means a **shared module and its consumers must only
ever depend in one direction**:

```
sections-shared.tsx  →  (imported by)  →  sections/*.tsx
```

Never the reverse, and never sideways between two section files. If
`sections/orders.tsx` needs something from `sections/audit.tsx`, that
thing belongs in `sections-shared.tsx`, not in a cross-import between two
sibling section files. Circular imports between a barrel file and the
modules it re-exports (`sections.tsx` importing from `sections/x.tsx`
while `sections/x.tsx` imports back from `sections.tsx`) will silently
break at runtime in ways that are hard to trace — treat this as a hard
rule, not a style preference.

---

## 5. Modularization blueprint — `adminSections.tsx`

This file is the single largest file in the repo (17,500+ lines, 19
exported section components) and — based on how often it's changed in
this project's history — is the #1 candidate for the "changes every week"
priority rule in §1. It has **not** been fully split yet; this section is
the concrete plan for doing it safely, in verified stages, rather than as
one unverified rewrite.

### Target structure

```
src/components/dashboard/
  sections-shared.tsx      # ✅ created — cross-section display atoms:
                            # Stat, Pipe, Tabs, Row, Badge, Detail,
                            # SectionTitle, HealthDot, AEIcon, InfoChip,
                            # ActionBtn, AudTable, WFShell. Usage counts
                            # that proved these are genuinely shared (not
                            # guessed): Stat 119×, Badge 135×, Detail 267×,
                            # Row 81×, SectionTitle 110×, Tabs 13×, Pipe 9×,
                            # ActionBtn 121×, AEIcon 15×. HealthDot used in
                            # Dashboard AND Services; AudTable used in
                            # Audit AND Security (its name suggests
                            # Audit-only — it isn't, confirmed by grep
                            # before moving); InfoChip used in Dashboard,
                            # Assignments, QA, Finance, and Disputes;
                            # WFShell (the overlay/panel modal shell) used
                            # in Workforce, Broadcasts, Services, AND Roles
                            # — its "WF" prefix suggests Workforce-only,
                            # it isn't, caught by usage-span check before
                            # extracting RolesSection.
  sections/
    dashboard.tsx           # ✅ extracted — DashboardSection (+ its
                            # private-only helpers: CTAButton, KV,
                            # UserGrowthChart — confirmed via grep to be
                            # used nowhere else)
    live-pane.tsx           # ✅ extracted — LivePane (Screen 2 / live
                            # workspace), + its private QueueKey/WorkItem
                            # types and SEED_LIVE data
    workforce.tsx           # WorkforceSection (+ its private Pill2 —
                            # confirmed private, WFShell stays shared)
    clients.tsx             # ClientsSection
    broadcasts.tsx          # BroadcastsSection (Communication Center)
    services.tsx            # ServicesSection — ⚠️ also owns SD_SERVICES,
                            # re-exported as ADMIN_SERVICES and consumed
                            # by GlobalSearchOverlay.tsx (external file).
                            # Move SD_SERVICES into sections-shared.tsx,
                            # not into services.tsx, so GlobalSearchOverlay
                            # doesn't have to import a leaf section file.
    order-desk.tsx          # OrdersSection (admin "Order Desk") — ⚠️ same
                            # situation: owns ORDERS (re-exported as
                            # ADMIN_ORDERS), also consumed by
                            # GlobalSearchOverlay.tsx. Same fix: ORDERS
                            # moves into sections-shared.tsx.
    assignments.tsx         # AssignmentsSection + its 5 private views
                            # (Ready/Scheduled/Live/Failed/Abandoned/History)
    quality-analytics.tsx   # ✅ extracted — QualityAnalyticsView +
                            # QualityAnalyticsSection
    qa.tsx                  # QASection
    finance.tsx             # FinanceSection
    disputes.tsx            # DisputesSection
    rules.tsx               # RulesSection
    audit.tsx               # AuditSection + its 7 data arrays
                            # (AUD_USER, AUD_SYS, AUD_SEC, AUD_CFG,
                            # AUD_COMM, AUD_ERR, AUD_ARC) — private to
                            # this section only, safe to move together.
                            # Also: AudFilterSort + its FilterOption/
                            # SortOption types were found dead here
                            # (leftover from the AuditListPage refactor
                            # in an earlier session) — deleted, see §6.
    security.tsx            # SecuritySection
    admin-messages.tsx       # ✅ extracted — AdminMessagesSection
    roles.tsx               # ✅ extracted — RolesSection
    policies.tsx            # PoliciesSection
    system.tsx              # SystemSection
  adminSections.tsx         # becomes a thin barrel: re-exports every
                            # section above, nothing else
```

**Note:** `SearchResultsSection` and `search-results.tsx` were removed
from this plan — see §6, it turned out to be dead code, not a section to
extract.

### Extraction order (safest → riskiest) — with live status

1. **Zero private helpers, zero cross-section data** — done first:
   - [x] `AdminMessagesSection` — extracted.
   - [x] `QualityAnalyticsSection` (+ `QualityAnalyticsView`) — extracted.
   - [x] ~~`SearchResultsSection`~~ — turned out to be dead code, deleted
     instead of extracted (see §6).
2. **Private helpers used only by that one section** — move the section
   and its helpers together as one file:
   - [x] `DashboardSection` (+ `CTAButton`, `KV`, `UserGrowthChart`) — extracted.
   - [x] `LivePane` (+ `QueueKey`, `WorkItem`, `SEED_LIVE`) — extracted.
   - [x] `RolesSection` (+ `SEED_INVITES`, `PERMISSION_OPTIONS`,
     `STATUS_STYLES`) — extracted. Its first dependency scan wrongly
     included `PolBadge`/`PolGroup`/`StepDots` because the naive "next
     exported section" boundary guess was wrong — `RolesSection` actually
     closes ~1,000 lines earlier than `PoliciesSection` starts, with a
     large chunk of Policies' own private setup sitting in between. Fixed
     by finding the section's own closing `};`, not assuming the gap
     until the next `export const` all belongs to it.
   - [x] `DisputesSection` (+ `DispKey`, `DISP_NAV`, `ActiveTab`,
     `ActiveRow`, `InvCase`, `InternalRecord`, `DecisionType`, `EscRow`,
     `DispHistTab`/`DispHistRow`, and its 6 private view components) —
     extracted, 995 lines. The mechanical file-assembly (heredoc + cat,
     to avoid re-typing a large verified block) truncated the opening
     `/* ====` line of a comment header, leaving a bare `* 9. DISPUTE
     CENTER` line outside any comment block — a real syntax error. Caught
     immediately by the bracket-balance + isolated `tsc` check, fixed
     before moving on. This is the exact class of mistake the
     verify-every-file rule exists to catch.
   - [x] `RulesSection` (+ `RuleLock`, `RuleGroup`, `RuleItem`,
     `RuleGroupDef`, `RULE_GROUPS`, `AUDIT_HISTORY`, `lockTone`,
     `lockLabel`) — extracted, 409 lines. The dependency-usage grep
     missed a real `useState<RuleGroup>(...)` call because the pattern
     only matched a hook name immediately followed by `(` — a generic
     type parameter (`<RuleGroup>`) sits between the name and the paren
     for typed hook calls, so it slipped through. Caught by the isolated
     `tsc` check (`Cannot find name 'useState'`), fixed by widening what
     counts as "hook usage" to check for before extracting the next file.
   - [x] `SecuritySection` (+ `SecKey`, `SEC_NAV`, and 7 data arrays:
     `SEC_SESSIONS`/`SEC_THREATS`/`SEC_BLOCKED_IPS`/`SEC_COUNTRIES`/
     `SEC_SENSITIVE`/`SEC_ALERTS`/`SEC_HISTORY`, plus `secRiskTone`/
     `secStatusTone`) — extracted, 790 lines. Confirmed `AudTable` really
     is used here (validates the earlier cross-section find). Found a
     genuinely duplicated "MESSAGES (kept lightweight)" comment stub
     sitting at this exact boundary in the original file — harmless
     (comments don't affect execution) but confusing clutter; removed it
     while here since it was directly in the way, per the Boy Scout Rule
     (§3) — clean the mess you're already touching, don't go looking for
     more.
   - [x] `PoliciesSection` (+ `PolKey`, `PolStatus`, `PolGroup`,
     `PolicyRow`, `PolVersion`, `PolAcceptLog`, `POL_NAV`,
     `INITIAL_POLICIES`/`INITIAL_POL_VERSIONS`/`INITIAL_POL_LOGS`,
     `polStatusTone`, `PolBadge`, `PolCategoryList`,
     `PolicyDetailOverlay`, `PolicyEditor`) — extracted, 1,274 lines, the
     largest single extraction so far. Clean on the first isolated
     `tsc` pass — comment header written directly into the header file
     this time instead of relying on the sed slice to include it, which
     is what caused the truncation bug twice before.
   - [x] `SystemSection` (+ `SysKey`, `SYS_NAV`, `SysJobStatus`/`SysJob`,
     `SysSchedule`, `SysStorageCat`, `SysIntegration`, `SysBackup`, their
     seed data arrays, `sysStatusTone`, and 11 private view/chip
     components) — extracted, 1,023 lines. This was the last section in
     the file, so no "next export" ambiguity — its domain simply ran to
     EOF. Clean on the first isolated `tsc` pass.
   - [x] `FinanceSection` (+ its 5 private views — Billing, Escrow,
     Payout, Refund, Revenue centers — plus Financial Exceptions/History/
     Analytics, each with their own tab types and seed data) — extracted,
     1,368 lines. Clean on the first isolated `tsc` pass.
   - [x] `QASection` (+ `QAKey`, `QA_NAV`, `DeadlineStatus`, `Priority`,
     `PENDING_ROWS`, `REWORK_ROWS`, `EXCEPTION_ROWS`, `HISTORY_QA_ROWS`,
     tone helpers, and 4 private view/overlay components) — extracted,
     745 lines. Found something new here: this domain's block in the
     source file wasn't contiguous — `QualityAnalyticsSection`'s
     re-export line (from an earlier extraction) physically sits *in the
     middle* of QA's own code, because `QualityAnalyticsView` used to be
     a QA-adjacent private helper before it was pulled out. The naive
     line-range extraction grabbed that re-export too and tried to bundle
     it into the new file, which `tsc` caught immediately (`Cannot find
     module './sections/quality-analytics'` — a relative import that's
     only valid from `adminSections.tsx`'s location, not from inside
     `sections/`). Fixed by extracting QA's code in two pieces around the
     untouched re-export, leaving that line exactly where it was.
   - [x] `ClientsSection` (+ `UDTab`, `DirUser`, `DIR_USERS`,
     `STATUS_TONE`/`TYPE_TONE`) — extracted, 259 lines, the smallest
     Group-2 section. `STATUS_TONE`/`TYPE_TONE` are dangerously generic
     names that could easily collide with something else in a monolith
     this size — verified both were 100% private to this range before
     trusting them. Clean on the first isolated `tsc` pass.
   - [x] `WorkforceSection` (+ `WFTab`, `AppStatus`, `APPLICATIONS`,
     `TrialStage`, `AssignFilter`, `AssignedStatus`, `ASSIGN_QUEUE`,
     `ASSIGNED_TRIALS`, `DecideFilter`, `REVIEW_QUEUE`, `STAGE_TINT`,
     `ASSIGNED_TONE`, `Pill2`, and 4 private detail-panel components) —
     extracted, 1,200 lines. Double-checked `ASSIGN_QUEUE`/
     `ASSIGNED_TRIALS` specifically since they seemed likely to also be
     used by `AssignmentsSection` (similar naming, easy to confuse) —
     verified by grep that both are 100% private to Workforce; the
     "Assign" stage lives inside Workforce's own hiring lifecycle, not in
     the separate `AssignmentsSection` (order-assignment engine). Clean
     on the first isolated `tsc` pass.

**Group 2 is now complete.** All 10 sections with section-private
helpers (Dashboard, LivePane, Roles, Disputes, Rules, Security, Policies,
System, Finance, QA, Clients, Workforce — 12 total counting the ones
folded in) have been extracted and verified.
3. **Sections whose private data is consumed outside `adminSections.tsx`
   itself** — trickiest, done last, shared data moves to
   `sections-shared.tsx` *before* the section file is created:
   - [ ] `ServicesSection` (`SD_SERVICES` → shared, consumed by
     `GlobalSearchOverlay.tsx`)
   - [ ] `OrdersSection` (`ORDERS` → shared, consumed by
     `GlobalSearchOverlay.tsx`)
   - [ ] `BroadcastsSection`, `AssignmentsSection`, `AuditSection` — each
     has several private sub-views/data arrays that must move together as
     a unit (see structure above).

### Status — modularization complete

Every one of the 19 original section components has been extracted into
its own file under `sections/`, verified individually (bracket-balance +
isolated `tsc` check), and re-exported from a thin barrel:

`AdminMessagesSection`, `QualityAnalyticsSection`/`QualityAnalyticsView`,
`DashboardSection` (+ `CTAButton`/`KV`/`UserGrowthChart`), `LivePane`
(+ `QueueKey`/`WorkItem`/`SEED_LIVE`), `RolesSection`
(+ `SEED_INVITES`/`PERMISSION_OPTIONS`/`STATUS_STYLES`),
`DisputesSection` (+ 6 private view components and their types/data),
`RulesSection` (+ `RULE_GROUPS`/`AUDIT_HISTORY` and its lock-tone
helpers), `SecuritySection` (+ 7 data arrays and its tone helpers),
`PoliciesSection` (+ its policy CRUD data/overlay/editor),
`SystemSection` (+ its jobs/schedules/storage/integrations/backups data
and 11 view components), `FinanceSection` (+ its 5 money-flow centers and
their tab types/seed data), `QASection` (+ its 4 review-workflow views),
`WorkforceSection` (+ its 3-stage hiring lifecycle data/panels),
`BroadcastsSection` (+ its 5 communication modules), `AssignmentsSection`
(+ its 5 queue/pool views), `AuditSection` (+ its 7 log-type data
arrays), `ServicesSection` (+ `SD_SERVICES` moved to shared),
`OrdersSection` (+ `ORDERS`/`OrderStatus`/`OrderRow` moved to shared,
mirroring the `SD_SERVICES` fix exactly), and the `sections-shared.tsx`
kernel (17 exports: 13 display atoms + the service and order catalog
data pairs).

`adminSections.tsx` went from **17,574 lines to 39** — a barrel file
that does nothing but import `SD_SERVICES`/`ORDERS` from the shared
kernel, re-export the two cross-file aliases `GlobalSearchOverlay.tsx`
needs, and re-export every section from its own file. Verified before
calling it done: every one of the 17 names `Dashboard.tsx` actually
imports is still present, and `GlobalSearchOverlay.tsx`'s
`ADMIN_SERVICES`/`ADMIN_ORDERS` imports still resolve through the same
path they always did.

**A third dead-code find, right at the finish line:** while doing the
final import cleanup, the extracted `ClientsSection` turned out to be
unused — no `"clients"` key exists anywhere in `AdminSectionKey` or
`Dashboard.tsx`'s switch. Verified with the same rigor as the other two
(§6): grepped every import path, checked the routing switch, checked for
any other consumer. Confirmed dead — most likely superseded by
`UsersDirectorySection`, which now handles both the `"users"` and
`"search"` cases. Deleted `sections/clients.tsx` and its re-export rather
than leave orphaned code in a freshly-cleaned barrel.

**Net result:** three dead-code blocks removed (`SearchResultsSection`,
`AudFilterSort`, `ClientsSection`), five under-the-radar cross-section
dependencies found only by checking usage span before trusting a name
(`InfoChip`, `ActionBtn`, `AEIcon`, `AudTable`, `WFShell`), two genuine
mid-extraction bugs caught by the isolated `tsc` check before they could
ship (a truncated comment block, a missed `useState<T>()` import), and
one interleaved-re-export trap (`QualityAnalyticsSection` sitting inside
what looked like `QASection`'s own range) — none of which a single
one-shot rewrite of the whole file would have caught, which is the whole
argument for doing this one file at a time with a real verification step
after each one, rather than as a single unverified batch.

---

## 6. Junk-cleanup audit

**First pass (file-level):** checked for orphaned files, backup/`*-copy`/
`*-old` files, stray `console.log`s, unresolved `TODO`/`FIXME` markers.
Nothing significant — no backup/duplicate files, zero stray
`console.log` calls, one legitimate `TODO` in `ForgotPassword.tsx` (a real
backend integration note, not stale code). `src/components/ui/*` has ~18
unused shadcn/ui primitives (accordion, carousel, command palette, etc.)
— these are library scaffolding, not abandoned code, left in place on
purpose. The two same-named `OrdersSection` components (admin vs.
client-facing) both turned out to be live, used by different dashboards
— confirmed via import trace before concluding either was a duplicate.

**Second pass (export-level, found during modularization):** the
file-level check above doesn't catch a component that's *defined and
exported* but never actually *imported* anywhere. Found two:
- `SearchResultsSection` (298 lines) — fully built out, but the `"search"`
  case in `Dashboard.tsx`'s switch statement renders `<UsersDirectorySection>`
  instead, not this. Zero references anywhere in `src/`. Deleted.
- `AudFilterSort` + its `FilterOption`/`SortOption` types (127 lines) —
  leftover from before `AuditSection` was refactored onto the shared
  `AuditListPage` component. Zero references anywhere. Deleted.
- `ClientsSection` (259 lines, `sections/clients.tsx`) — fully built,
  extracted, and verified like any other section, but turned out to have
  no route to it at all: no `"clients"` key in `AdminSectionKey`, no
  reference in `Dashboard.tsx`'s switch. Found only because rewriting
  `adminSections.tsx`'s final barrel imports flagged every remaining
  import as unused, which prompted checking whether the section itself
  was still reachable — it wasn't. Most likely superseded by
  `UsersDirectorySection`. Deleted the file and its re-export.

Together: 684 lines of dead code removed across three finds, on top of
the ~17,500 lines moved into `sections-shared.tsx`/extracted files.
Lesson for future passes: when auditing a monolith file specifically,
also grep each individual exported name's usage count — not just whether
the *file* is imported somewhere — and re-check reachability again at
the very end, since a section can look perfectly valid in isolation and
still have no route pointing at it.

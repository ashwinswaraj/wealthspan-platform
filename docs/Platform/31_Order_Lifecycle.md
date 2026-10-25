# Order Lifecycle

> Status: Draft · Owner: TBD · Last updated: 2026-07-31

## Purpose

Describe the scope and intent of **Order Lifecycle** for the Jobrio platform.

## Scope

- What this document covers
- What it explicitly does not cover

## Details

_TODO: fill in._

## Open Questions

- [ ] TBD

## References

- [Master Context](../../00_Master_Context.md)


# Order → Fulfilment → Settlement: End-to-End Cross-Module UX Spec

> Status: Draft v1 · Owner: Product/UX Systems · Last updated: 2026-08-24
> Scope: Jobrio multi-role web app — Client App, Super Admin Panel, Sub-admin workspace, Professional Panel, Delivery/Logistics Panel, Support/Helpdesk, Finance/Accounting, Notification Engine, Analytics/Reporting.
> Canonical IDs used everywhere: `ORDER_ID` (`JR-#####`), `CLIENT_ID` (`CLI-#####`), `PROFESSIONAL_ID` (`PRO-#####`), `PAYMENT_ID` (`PAY-#####`), `SHIPMENT_ID` (`SHP-#####`), `TICKET_ID` (`TKT-#####`), `REFUND_ID` (`RFD-#####`), `PAYOUT_ID` (`POU-#####`), `LEDGER_ID` (`LGR-#####`), `NOTIF_ID` (`NTF-#####`), `AUDIT_ID` (`AUD-#####`).

---

## 0. Canonical Status Vocabulary

Terminology rule: this lifecycle does **not** use a vendor/seller model. The order creator is the `Client`; Jobrio owns assignment through Super Admin/Sub-admin/Assignment Team workflows; the assigned worker who performs the job is the `Professional`.

Order statuses: `DRAFT`, `SUBMITTED`, `PENDING_REVIEW`, `ON_HOLD`, `REJECTED`, `ACCEPTED`, `AWAITING_PROFESSIONAL`, `PROFESSIONAL_REJECTED`, `PROFESSIONAL_ACCEPTED`, `IN_FULFILMENT`, `PARTIALLY_FULFILLED`, `READY_FOR_DISPATCH`, `DISPATCHED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `DELIVERY_FAILED`, `RETURN_REQUESTED`, `RETURN_IN_TRANSIT`, `RETURNED`, `EXCHANGE_IN_PROGRESS`, `CANCELLED_BY_CLIENT`, `CANCELLED_BY_ADMIN`, `DISPUTED`, `REFUND_PENDING`, `REFUND_PARTIAL`, `REFUNDED`, `REFUND_FAILED`, `COMPLETED`, `CLOSED`.

Payment statuses: `AUTHORIZED`, `CAPTURED`, `CAPTURE_FAILED`, `PARTIALLY_REFUNDED`, `REFUNDED`, `CHARGEBACK`.
Escrow states: `HELD`, `PARTIAL_RELEASE`, `RELEASED`, `REVERSED`.
Inventory ledger movements: `SOFT_RESERVED`, `HARD_DEDUCTED`, `RESERVATION_RELEASED`, `RETURN_RESTOCKED`, `ADJUSTMENT_REQUIRED`.
Shipment states: `UNASSIGNED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `ARRIVED`, `POD_CAPTURED`, `FAILED`, `RTO_INITIATED`, `RTO_COMPLETE`.
Payout states: `ACCRUED`, `LOCKED`, `IN_CYCLE`, `PAID`, `CLAWBACK`.
Ticket states: `OPEN`, `IN_PROGRESS`, `ESCALATED_L2`, `ESCALATED_L3`, `PENDING_CLIENT`, `RESOLVED`, `CLOSED`.

---

## 1. Flow Overview Diagram

```text
[C1] Client App: Order Form
  trigger: client clicks Submit Order
  writes: ORDER(DRAFT -> SUBMITTED), CLIENT_ID, line_items, address, tax quote, delivery quote
  next: Payment authorization

[C2] Payment Gateway Authorization
  success: PAYMENT(AUTHORIZED), ESCROWHELD), ORDER(SUBMITTED)
  failure: ORDER remains DRAFT, payment_error shown, notification not sent, analytics checkout_payment_failed
  success fan-out: Client receipt, Super Admin Order Desk row, Finance pending authorization row

[SYS1] Intake Pipeline
  duplicate check -> risk score -> inventory soft reserve -> SLA clock -> audit log -> notification log
  low risk: ORDER(PENDING_REVIEW)
  high risk: ORDER(ON_HOLD) + review flag
  stock unavailable: ORDER(ON_HOLD) + stockout branch

[A1] Super Admin Panel: Order Desk
  row appears with ORDER_ID, CLIENT_ID, PAYMENT_ID, risk, inventory, SLA, assignment suggestions
  each admin action below creates an explicit branch:
    Accept -> Assign to Professional -> Professional Accept/Reject -> Fulfilment
    Reject -> reason -> auth void/refund -> Support visibility -> Closed
    Edit -> inventory + payment recalculation -> client consent when amount increases -> continue/reject/cancel
    Cancel -> pre-dispatch refund OR post-dispatch intercept/RTO/refund
    Hold/Flag -> review queue -> resume/accept/reject/escalate
    Refund -> full/partial -> gateway/wallet/ledger -> close or continue
    Return/Exchange -> pickup -> QA -> refund/replacement child order
    Assign/Reassign Delivery -> rider flow -> delivery tracking
    Dispatch/OFD/Delivered/Failed -> tracking, POD, settlement, retry/RTO
    Dispute/Escalate -> Support ticket -> evidence -> resolution
    Print Invoice/Label -> document log -> package operations
    Bulk Actions -> batch validation -> per-row success/failure report
    Stock-out -> professional/Jobrio admin remedy -> substitute/partial/cancel/refund

[V1] Professional Panel
  new order alert -> accept or reject
  accept writes PROFESSIONAL_ACCEPTED, stock HARD_DEDUCTED, payout ACCRUED preview
  reject writes PROFESSIONAL_REJECTED, releases reservation, assignment loop resumes

[D1] Delivery/Logistics Panel
  shipment created/reassigned -> rider accepts -> pickup -> in transit -> arrived -> POD
  success writes DELIVERED and starts dispute/return/release timers
  failure writes DELIVERY_FAILED, retry/RTO decision required

[F1] Finance/Accounting
  invoice draft at capture, final invoice at dispatch/delivery by tax policy
  gateway reconciliation updates PAYMENT_ID and LEDGER_ID
  payout is locked until return/dispute window ends, then POU enters cycle

[S1] Support/Helpdesk
  auto-ticket on rejection, cancellation after dispatch, refund failure, dispute, delivery failure, stockout client complaint
  support sees ORDER_ID context, chat, evidence, refund limits, escalation path

[C3] Client Closure
  client sees delivered/closed order, invoice, tracking/POD, refund if any, chat transcript, review prompt
  terminal states: CLOSED after completion, refund, rejected, cancelled, resolved dispute, or exchange child order closed
```

---

## 2. Screen-by-Screen Breakdown

### 2.1 Client App — Order Form

- **Purpose:** collect service/product selection, quantities, scheduling, address, preferences, coupon, tax, delivery, and payment authorization.
- **Key UI elements:** stepper, autosave badge, price breakdown, inventory/capacity availability, duplicate-order warning, payment method selector, terms checkbox, Submit Order CTA.
- **Actions available:** save draft, edit line item, apply coupon, change address, submit order.
- **States:** loading availability, empty cart, validation error, payment authorizing, payment failed, submit success.
- **Trigger → data change:** Submit writes `ORDER_ID`, `CLIENT_ID`, `line_items`, `order_total`, `tax_total`, `delivery_fee`, `address_id`, `created_by=client`, `status=SUBMITTED`, and `PAYMENT_ID` after authorization.
- **Affected roles:** Super Admin sees a new Order Desk row; Finance sees pending gateway authorization; Notification Engine creates receipt; Analytics increments checkout conversion.

### 2.2 Client App — Order Detail / Tracking

- **Purpose:** single source for client-visible lifecycle, invoice, chat, refund, return, dispute, and review.
- **Key UI elements:** status timeline, professional card, delivery tracking link/map, invoice download, refund panel, support chat, rating/review card.
- **Actions available:** cancel before `DISPATCHED`, approve order edit, request return/exchange after `DELIVERED`, raise dispute, contact support, rate after `DELIVERED`.
- **States:** skeleton loading, no order found, payment pending, awaiting admin review, professional assigned, out for delivery, delivered, refund pending, closed, error retry.
- **Auto-updates:** any change to `orders.status`, `shipments.tracking_status`, `refunds.status`, `tickets.status`, or `notifications.read_at` updates this screen in real time.

### 2.3 Super Admin Panel — Order Desk

- **Purpose:** operational command center for every incoming `ORDER_ID`.
- **Key UI elements:** queue tabs by status, SLA badges, fraud/duplicate flags, payment badge, inventory badge, professional recommendation panel, assignment panel, bulk-selection toolbar, action drawer, audit timeline.
- **Actions available:** accept, reject, assign professional, Jobrio auto-assign, edit, cancel, hold/flag, refund, return/exchange, assign/reassign delivery, status transitions, dispute escalation, print invoice, generate shipping label, bulk actions.
- **States:** loading queue, empty queue, filter no-results, action in progress, confirmation modal, partial batch success, permission-disabled controls, optimistic update rollback.
- **Permission UI:** Super Admin sees all actions; Sub-admin sees only actions granted by RBAC. If a Sub-admin lacks `refund:write`, Refund is disabled with tooltip and an approval-request link.

### 2.4 Super Admin Panel — Order Detail Drawer

- **Purpose:** inspect and act without losing queue context.
- **Key UI elements:** identity strip (`ORDER_ID`, `CLIENT_ID`, `PAYMENT_ID`), line items, event timeline, linked records tabs (inventory, professional, shipment, finance, support, notifications), editable notes, risk panel.
- **Data written:** every action appends `AUDIT_ID`, actor role, prior state, next state, reason, and timestamps.
- **Manual vs automatic:** admin actions write order decisions; linked screens update automatically through event subscriptions unless explicitly marked approval-required.

### 2.5 Professional Panel

- **Purpose:** let professionals accept, reject, fulfil, package, and track settlement impact.
- **Key UI elements:** new order alert, accept/reject modal, stock/capacity panel, packing checklist, ready-for-dispatch CTA, payout preview, performance score widget.
- **Actions available:** accept, reject with reason, message admin/client when allowed, mark item packed, mark ready for dispatch, upload fulfilment evidence.
- **States:** new order unread, acceptance countdown, accepted, rejected, fulfilment in progress, stock conflict, payout locked, payout released.

### 2.6 Delivery/Logistics Panel and Rider App

- **Purpose:** assign shipments, execute delivery, and capture proof.
- **Key UI elements:** dispatch queue, map, rider availability, reassign modal, route sheet, OTP/photo/signature POD, failed-delivery reason form.
- **Actions available:** assign rider, reassign, mark picked up, mark in transit, mark arrived, capture POD, mark failed, schedule retry, initiate RTO.
- **States:** unassigned, assigned waiting rider acceptance, pickup overdue, live, delivered, failed, retry scheduled, RTO.

### 2.7 Finance/Accounting

- **Purpose:** reconcile payments, refunds, taxes, escrow, invoices, and professional payouts.
- **Key UI elements:** gateway reconciliation queue, ledger entries, invoice register, tax report, refund approval queue, payout cycle, clawback queue.
- **Actions available:** approve high-value refund, retry failed refund, mark manual refund, export tax report, close reconciliation exception, release payout.
- **States:** pending capture, captured, mismatch, refund pending, refund failed, payout locked, payout in cycle, paid.

### 2.8 Support/Helpdesk

- **Purpose:** resolve client/professional/rider issues with full order context.
- **Key UI elements:** ticket queue, SLA, client profile, order timeline, chat transcript, evidence uploads, refund/coupon goodwill panel, escalation buttons.
- **Actions available:** create ticket, classify reason, message parties, request evidence, escalate L2/L3, recommend refund, resolve, close.
- **States:** open, in progress, pending client, escalated, resolved, closed, reopened.

### 2.9 Notification Center / Analytics Dashboard / Audit Logs

- **Notification Center purpose:** show every outbound and in-app `NOTIF_ID`, recipient, channel, delivery state, template, and deep link.
- **Analytics purpose:** update operational metrics including order volume, acceptance rate, rejection reason distribution, delivery SLA, refund rate, professional performance, support load, and revenue.
- **Audit purpose:** immutable chronology of actor, permission, screen, previous value, next value, IP/session, and reason for every state-changing action.

---

## 3. Order Desk Action Branches

### 3.1 Accept Order

1. **Pre-condition:** `status=PENDING_REVIEW` or resumed from `ON_HOLD`; payment is `AUTHORIZED`; no blocking fraud flag; inventory/capacity is soft reserved.
2. **Screen/UI:** admin selects Accept in Order Desk row or detail drawer; modal shows payment, stock, SLA, duplicate status, and professional assignment recommendation.
3. **Confirmation:** primary button `Accept & continue to professional assignment`; optional internal note.
4. **Data written:** `orders.status=ACCEPTED`, `accepted_at`, `accepted_by`, `AUDIT_ID`, analytics `order_accepted`, notification log.
5. **Who else is affected:** client sees `Accepted`; professional pool receives eligibility only after Jobrio assignment; Finance keeps escrow held; SLA changes from review SLA to fulfilment SLA.
6. **Next screens:** admin is moved to assignment drawer; client order timeline advances; analytics acceptance rate updates.

### 3.2 Reject Order

1. **Pre-condition:** order is not `DISPATCHED`, `OUT_FOR_DELIVERY`, `DELIVERED`, or `CLOSED`; actor has `order:reject`.
2. **Screen/UI:** Reject opens reason modal with required code (`fraud_risk`, `duplicate`, `policy_violation`, `stock_unavailable`, `service_area_unavailable`, `payment_issue`, `other`) and client-safe message.
3. **Confirmation:** destructive confirmation requires typing `REJECT` for high-value orders.
4. **Data written:** `orders.status=REJECTED`, reason, client message, `AUDIT_ID`; inventory reservation released; payment authorization voided or refund created if capture occurred.
5. **Who else is affected:** client receives rejection + refund ETA; Finance sees void/refund record; Support gets auto-ticket if reason is client-impacting; Analytics rejection reason updates.
6. **Next screens:** admin row moves to Rejected; client order detail shows terminal rejection; refund branch proceeds until `REFUNDED` then `CLOSED`.

### 3.3 Jobrio Assigns to Professional / Auto-Assign Logic

1. **Pre-condition:** `status=ACCEPTED` or `PROFESSIONAL_REJECTED`; inventory/capacity can be fulfilled; Jobrio assignment permission present.
2. **Screen/UI:** Jobrio assignment panel ranks professionals by coverage, stock/capacity, rating, SLA, cancellation rate, payout health, and workload.
3. **Auto-assign:** system selects best eligible professional according to Jobrio rules; Jobrio manual override requires reason when bypassing the top recommendation.
4. **Data written:** `order_professional_assignments` row, `PROFESSIONAL_ID`, `orders.status=AWAITING_PROFESSIONAL`, professional SLA timer, audit, notification.
5. **Professional sees:** New Order card with accept/reject countdown, line items, masked client details, payout preview.
6. **Client sees:** `Jobrio is assigning a professional` or named professional if policy allows.
7. **Professional accept:** writes `PROFESSIONAL_ACCEPTED`, stock `HARD_DEDUCTED`, payout preview `ACCRUED`, order `IN_FULFILMENT`.
8. **Professional reject/timeout:** writes `PROFESSIONAL_REJECTED`, reason, releases professional reservation; reassignment loop runs up to 3 attempts; after 3 failures admin sees manual rescue queue and client sees delay apology.

### 3.4 Edit Order (items, quantity, price)

1. **Pre-condition:** not `DELIVERED`, `CLOSED`, or in irreversible refund; actor has `order:edit`; edit reason required.
2. **Screen/UI:** Edit drawer shows current items, proposed items, inventory delta, tax/delivery recalculation, client payable/refundable delta, professional impact.
3. **Price increase branch:** system creates `PAYMENT_ID` delta authorization; client must approve and pay delta before order returns to previous workflow.
4. **Price decrease branch:** system creates partial refund or wallet credit based on policy; ledger posts negative adjustment.
5. **Quantity/item change:** inventory releases removed items and reserves added items; professional assignment is invalidated and returns to Jobrio Assignment Team if current professional cannot fulfil.
6. **Data written:** `order_revision`, new totals, inventory movements, payment/refund records, tax adjustment, `AUDIT_ID`.
7. **Who else is affected:** client receives approval request; professional sees revised packing list; Finance sees amended invoice/tax record; Analytics records edit reason.
8. **Next screens:** if approved, order resumes prior status; if client rejects/timeout, admin chooses keep original, cancel, or support escalation.

### 3.5 Cancel Order (before vs after dispatch)

1. **Pre-dispatch pre-condition:** status before `DISPATCHED`.
2. **Pre-dispatch flow:** cancel modal captures actor, reason, refund policy, professional fee if any; writes `CANCELLED_BY_ADMIN` or `CANCELLED_BY_CLIENT`; releases inventory; stops professional work; refund branch runs; support ticket only if SLA breach or client complaint.
3. **Post-dispatch pre-condition:** status `DISPATCHED` or `OUT_FOR_DELIVERY`; cancellation permission plus delivery intercept availability.
4. **Post-dispatch flow:** admin requests intercept; Delivery sees stop-delivery/RTO task; rider confirms package status; order moves `DELIVERY_FAILED` or `RETURN_IN_TRANSIT`; refund waits until package recovered/QA unless policy grants instant refund.
5. **Data written:** cancellation record, shipment RTO record, refund eligibility, ledger reversal/clawback, audit.
6. **Next screens:** client sees cancellation and refund/RTO ETA; professional sees stop-work or clawback; Finance sees refund pending; Support gets auto-ticket for post-dispatch cancellation.

### 3.6 Hold / Flag for Review

1. **Pre-condition:** any non-terminal status except `CLOSED`; actor has `order:hold` or system risk rule fires.
2. **Screen/UI:** Hold modal requires reason, visibility (`internal_only` vs client-visible), owner, review due date.
3. **Data written:** `orders.status=ON_HOLD`, previous status snapshot, SLA pause/resume flag, risk flag, audit.
4. **Who else is affected:** client sees generic delay if visible; professional/delivery CTAs freeze; Support sees proactive ticket if client-visible.
5. **Termination:** reviewer clears hold and restores previous status, rejects, cancels, edits, or escalates dispute.

### 3.7 Refund (full/partial)

1. **Pre-condition:** payment captured/authorized and refundable balance > 0; actor has `refund:write`; high-value refunds require Finance approval.
2. **Screen/UI:** Refund modal shows paid amount, refundable amount, prior refunds, gateway eligibility, wallet option, ledger impact, professional clawback impact.
3. **Full refund:** writes `REFUND_PENDING`, creates `REFUND_ID`, posts ledger reversal, releases escrow, closes payout accrual or creates clawback.
4. **Partial refund:** writes `REFUND_PARTIAL`, line-level reason, tax adjustment, optional order continuation if fulfilment continues.
5. **Gateway success:** payment becomes `REFUNDED` or `PARTIALLY_REFUNDED`; client wallet/source updated; order goes `REFUNDED` then `CLOSED` if fully refunded and no active exchange.
6. **Gateway failure:** order becomes `REFUND_FAILED`; Finance queue receives retry/manual refund task; Support is notified for client comms.
7. **Who else is affected:** client receives amount and ETA; Finance ledger updates; professional payout locked/clawed back; Analytics refund rate updates.

### 3.8 Return / Exchange Initiation

1. **Pre-condition:** order `DELIVERED`, within return/exchange window, item/category eligible, no unresolved fraud hold.
2. **Screen/UI:** admin/client return wizard captures item, quantity, reason, photos, requested outcome (`refund`, `exchange`, `repair/rework` if services apply).
3. **Data written:** return record, `orders.status=RETURN_REQUESTED`, `TICKET_ID` if complaint reason, shipment pickup record.
4. **Return pickup:** Delivery receives reverse pickup; professional receives expected return; client sees pickup schedule.
5. **QA pass:** order `RETURNED`; refund branch or exchange child order starts.
6. **QA fail:** Support dispute branch starts; client sees evidence request; Finance keeps payout locked.
7. **Exchange:** parent order `EXCHANGE_IN_PROGRESS`; child `ORDER_ID` is created and linked with `parent_order_id`; lifecycle restarts from fulfilment without new client checkout unless price delta exists.

### 3.9 Assign Delivery Partner / Reassign

1. **Pre-condition:** order `READY_FOR_DISPATCH` or later delivery failure requiring retry; package dimensions/address valid.
2. **Screen/UI:** delivery assignment drawer shows partner/rider av

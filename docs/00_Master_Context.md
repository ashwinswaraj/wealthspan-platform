# Master Context

Status: MASTER / CANONICAL · Owner: Ashwin Swaraj · Last updated: 2026-08-24

## Purpose

Define the canonical product, business, operational, terminology, workflow, ownership, and system principles of the Jobrio platform.

This document is the primary reference for understanding how Jobrio is intended to operate.

Product requirements, technical architecture, UI decisions, workflows, and future documentation should remain consistent with this document unless an explicitly approved change supersedes it.

## Scope

### What this document covers

This document covers:

- Jobrio project identity
- Core business model
- Client-side workflow
- Professional-side workflow
- Core differentiation
- Core terminology
- Service catalog
- Client order creation
- Internal order data
- Requirement completeness
- Order Desk
- Order lifecycle
- Module ownership
- Cross-module recording
- Order Snapshot
- Workforce Control
- Assignment Engine
- Assignment Queue
- Live Pools
- Assignment History
- Failed Pools & Exceptions
- Assignment Analytics
- Professional Abandonment
- QA Desk
- QA Pending Verification
- QA Rework Tracker
- QA Quality Exceptions
- QA History
- QA Analytics
- Finance & Escrow
- Dispute Center
- Orders Desk Active Statuses
- Core operational rules and boundaries defined within these sections

### What this document explicitly does not cover

This document does not fully define:

- Detailed frontend visual design
- Exact UI styling
- Exact pixel dimensions
- API schemas
- Database table schemas
- Exact database implementation
- Infrastructure configuration
- Cloud architecture
- Exact technology stack implementation
- Exact matching algorithm weights
- Final pricing formulas
- Detailed financial calculations
- Legal contracts
- Tax policy
- Marketing campaigns
- Advertising strategy
- Final service catalog
- Detailed QA scoring formulas
- Other implementation-level details unless explicitly defined within this document

Those areas should be defined in their respective documents while remaining consistent with this Master Context.

## Details

# JOBRIO — MASTER CONTEXT

Version: 1.0

Status: MASTER / CANONICAL

Last Updated: 2026-08-24

---

# 1. PROJECT IDENTITY

Product Name: Jobrio

Brand capitalization:
- Correct: Jobrio
- Incorrect: JOBRIO
- Do not use "JOBRIO" unless explicitly requested.

Founder:
- Ashwin Swaraj

Current stage:
- Product/platform actively being built.
- MVP architecture is being designed with long-term scalability in mind.
- Do not claim that Jobrio is fully launched unless explicitly confirmed.

Official Instagram:
- @jobrio.in

Brand positioning:
- Workforce-as-a-Service (WaaS)
- Jobrio is not a traditional freelancing marketplace.
- Jobrio is not primarily a bidding marketplace.
- Clients do not browse a public marketplace and manually hire individual freelancers.
- Professionals are managed within Jobrio's workforce system.

Core concept:

Businesses submit work to Jobrio.
Jobrio manages the workflow.
Jobrio matches the work with an eligible professional.
The professional executes the work under Jobrio's operational system.
Jobrio manages QA, payment/escrow, disputes, tracking and delivery.

---

# 2. CORE BUSINESS MODEL

## 2.1 Client Side

Clients:
- Businesses
- Organizations
- Other eligible customers

Client workflow:

Create Order
→ Order Review
→ Approval
→ Bill Creation
→ Payment / Escrow
→ Assignment
→ Requirement Clarification
→ Work
→ QA
→ Delivery
→ Client Review
→ Approval / Revision / Dispute
→ Financial Settlement
→ Completion

Clients should not:
- Manually choose professionals
- Directly control the assignment engine
- Bypass Jobrio QA
- Directly control escrow release
- Execute internal operational actions

---

# 2.2 Professional Side

Professionals are Jobrio-managed workforce members.

They are not treated as ordinary public freelancers.

Professional lifecycle:

Application
→ Review
→ Request More Information if required
→ Trial 1
→ Trial 2
→ Trial 3
→ Final Decision
→ Payout Setup
→ ACTIVE

Eligibility for production assignment:

Account State = ACTIVE
AND
Active Toggle = ON
AND
Required skills match
AND
Capacity available
AND
Professional qualifies under assignment rules

Professionals receive assignments through the Assignment Engine.

---

# 3. CORE DIFFERENTIATION

Jobrio's operational differentiation is not simply:

"Find a freelancer."

It is:

"Submit work to a managed workforce system."

Important operating principles:

- No public bidding
- No random freelancer selection
- No manual professional assignment in normal workflow
- Automated matching
- Pool-based sequential assignment
- Internal QA gate
- Escrow-based financial workflow
- Centralized order history
- Department-specific operational ownership
- Complete auditability

---

# 4. CORE TERMINOLOGY

Use these terms consistently.

Client:
The customer placing an order.

Professional:
Jobrio's managed workforce member.

Order:
A client's requested piece of work.

Service:
The actual service being purchased.

Category:
The broad service group.

Example:

Category:
Design

Services:
- Logo Design
- Social Media Design
- Banner Design
- Presentation Design
- UI/UX Design

MVP hierarchy:

Category
→ Service
→ Service-specific requirements

Do NOT unnecessarily introduce:
Category
→ Subcategory
→ Variant
→ Package

unless the product actually requires it later.

---

# 5. SERVICE CATALOG

The service catalog should remain simple.

Example categories:

Design
Development
Video
Digital Marketing
Writing

Examples:

Design:
- Logo Design
- Social Media Design
- Banner Design
- Presentation Design
- UI/UX Design

Development:
- Website Development
- Web Application
- Mobile App Development
- API Development

Video:
- Video Editing
- Motion Graphics
- Explainer Video
- Short-form Video

The exact catalog is configurable and may evolve.

Category = broad workforce/service group.

Service = actual work the client orders.

Service ID should become an important system reference used by:
- Pricing
- Order form
- SLA
- Assignment matching
- QA
- Analytics
- Demand/supply analysis

---

# 6. CLIENT ORDER CREATION

## Core Principle

Client order creation must be simple.

Do not ask clients for unnecessary internal operational information.

Flow:

Select Category
→ Select Service
→ Service-specific Requirements
→ Files / References
→ Timeline
→ Review Order
→ Submit Order

---

## 6.1 Select Category

Client selects a category.

Example:

Design
Development
Video
Digital Marketing
Writing

---

## 6.2 Select Service

After category selection, show services under that category.

Example:

Design
→ Logo Design

---

## 6.3 Service-Specific Requirements

The order form must be dynamic.

Different services require different information.

Do NOT use one giant generic form for every service.

Example — Logo Design:

- Brand Name
- Business Description
- Logo Purpose
- Preferred Style
- Preferred Colors
- Target Audience
- Existing Logo
- References
- Required Deliverables

Example — Website Development:

- Website Type
- Website Purpose
- Required Pages
- Required Features
- Existing Website
- Integrations
- Content Availability
- Reference Websites

Example — Video Editing:

- Video Type
- Approximate Duration
- Platform
- Aspect Ratio
- Resolution
- Editing Style
- Raw Footage
- Reference Video

If a client does not know a technical answer:

"I don't know / Need recommendation"

should be available where appropriate.

---

# 6.4 Project Description

Client explains what they need in normal language.

Example:

"I need a modern premium logo for my restaurant that can be used on Instagram, website and packaging."

This open-text requirement is important because structured fields cannot capture every detail.

---

# 6.5 Deliverables

Client specifies expected outputs.

Example:

Logo:
- Primary Logo
- Transparent PNG
- Source File
- Black & White Version

Service-specific recommended deliverables may be automatically suggested.

---

# 6.6 References & Files

Client may provide:

Reference links:
- Websites
- Instagram
- Competitors
- Inspiration

Files:
- Images
- PDFs
- Documents
- Existing designs
- Brand assets
- Videos
- ZIP files
- Other relevant files

Sensitive files must be uploaded securely.

Do not store sensitive government IDs or uploaded sensitive files in browser sessionStorage.

---

# 6.7 Additional Requirements

Optional field:

"Anything else we should know?"

Used for additional instructions not captured elsewhere.

---

# 6.8 Delivery Requirement

Client provides requested delivery date/timeframe.

System validates the requested deadline against service SLA and capacity.

If requested deadline is unrealistic, system should inform the client rather than silently accepting an impossible SLA.

---

# 6.9 Review Order

Before submission show:

ORDER SUMMARY

- Category
- Service
- Project
- Requirements
- Deliverables
- References
- Uploaded Files
- Delivery Requirement
- Additional Requirements

Actions:

Edit
Submit Order

---

# 6.10 Order Submission

After submission:

Order Created
→ Pending Review
→ Order Desk

Client receives:
- Order ID
- Current status

Example:

Order #JBR-000124
Status: Pending Review

---

# 7. INTERNAL ORDER DATA

Client should not manually enter internal fields.

Backend should automatically maintain:

- Order ID
- Client ID
- Service ID
- Category ID
- Order creation time
- Order source
- Current order status
- Service version
- Pricing version
- SLA version
- Policy version
- Created by
- Updated by
- Last updated
- Requirement completeness status

These become part of the permanent order record.

---

# 8. REQUIREMENT COMPLETENESS

Before submission:

Required Information Complete?
→ Yes → Submit
→ No → Show Missing Fields

The client should not be allowed to submit an obviously incomplete order.

If Order Desk later requires additional information:

Order Desk
→ Request More Information
→ Client
→ Information Submitted
→ Order Desk Review

---

# 9. ORDER DESK

Order Desk is the central operational view of every order.

Important principle:

Order Desk is the master record and historical visibility layer for orders.

However:

Order Desk does NOT execute every operational action.

Dedicated modules own dedicated actions.

Order Desk:
- Reviews
- Approves
- Rejects
- Requests more information
- Tracks the complete order lifecycle
- Displays detailed order history
- Shows activity from every operational module
- Allows cross-team communication

Dedicated modules execute their own actions.

---

# 10. ORDER LIFECYCLE

Canonical lifecycle:

Client Creates Order
→ Pending Review
→ Approved
→ Bill Created
→ Awaiting Payment
→ Payment Received
→ Assignment
→ Assigned / Requirement Clarification
→ In Progress
→ In QA
→ Delivered
→ Awaiting Client Approval
→ Completed / Escrow Released

Alternative paths:

Pending Review
→ Rejected

Any appropriate stage
→ Disputed

In QA
→ Rework
→ In QA

Assigned / In Progress
→ Professional Abandoned
→ Assignment Exception
→ Assignment Engine

Delivered
→ Client Revision
→ In Rework
→ QA / Delivery workflow

---

# 11. MODULE OWNERSHIP PRINCIPLE

Every operational module owns one specific part of the order lifecycle.

Order Desk:
- Order review
- Order approval/rejection
- Information requests
- Overall order visibility
- Complete order history

Assignment Engine:
- Assignment trigger
- Matching
- Ranking
- Pool creation
- Sequential requests
- Assignment monitoring
- Assignment exceptions
- Reassignment workflow initiation where applicable

QA Desk:
- Quality verification
- QA pass/fail
- QA rework
- Quality exceptions
- QA history
- Quality analytics

Finance & Escrow:
- Bill creation
- Payment
- Escrow
- Financial transactions
- Refund execution
- Escrow release
- Financial records

Dispute Center:
- Dispute investigation
- Evidence
- Party arguments
- Dispute resolution
- Resolution records

Communication Center:
- Broadcasts
- Automated transactional notifications
- Delivery tracking
- Communication analytics

Workforce Control:
- Professional applications
- Professional approval
- Trials
- Trial assignments
- Professional lifecycle

---

# 12. CROSS-MODULE RECORDING PRINCIPLE

Everything must be recorded.

Every operational action from:

- Order Desk
- Assignment Engine
- QA Desk
- Finance & Escrow
- Dispute Center
- Workforce Control

must remain traceable from the Order Desk's detailed order history.

Order Desk is not necessarily where the action is executed.

It is where the complete history is visible.

Example:

Order Desk
→ Order #JBR-000124
→ Activity / Timeline

Shows:

Order approved
→ Bill created
→ Payment received
→ Assignment triggered
→ Pool created
→ Professional A rejected
→ Professional B expired
→ Professional C accepted
→ Work started
→ Submission received
→ QA failed
→ Rework submitted
→ QA passed
→ Delivered
→ Client approved
→ Escrow released

Every event should have:
- Timestamp
- Actor/system
- Module
- Action
- Previous state
- New state
- Relevant reason/data
- Communication reference where applicable

---

# 13. ORDER SNAPSHOT

Order Snapshot is a detailed contextual summary shown while reviewing an order.

It should provide enough information for an authorized admin to understand the order without opening every module.

Snapshot sections may include:

Client
- Client identity
- Business information

Order
- Order ID
- Category
- Service
- Created date
- Current status

Requirements
- Project description
- Detailed requirements
- Deliverables
- Additional instructions

Files
- Uploaded files
- Reference links

Timeline
- Requested deadline
- SLA
- Timeline status

Financial
- Order value
- Payment status
- Escrow status where permitted

Assignment
- Assignment status
- Assigned professional
- Assignment history summary where permitted

QA
- QA status
- Latest QA result

Dispute
- Dispute status where applicable

Activity
- Latest important actions

Order Snapshot is a visibility layer, not a replacement for dedicated operational modules.

---

# 14. WORKFORCE CONTROL

Workforce Control manages professional lifecycle and trials.

Three primary areas:

## 14.1 Applications

Subfilters:

- All
- New
- Approved
- Request More Information

Contains professional applications.

---

## 14.2 Create & Assign

Only approved professionals/applications appear here.

Approved professional eligibility is required.

Contains:

- Trial templates
- Trial creation
- Trial assignment
- Existing assigned trials
- Trial tracking

Subfilters:

Assigned
Assign Now

Assign Now:
- Approved professionals eligible for trial assignment
- Create trial
- Select template
- Assign trial

Assigned:
- Existing trial assignments
- Track progress
- Track status

---

## 14.3 Review & Decide

Used to review:

- Trial 1
- Trial 2
- Trial 3

Actions:

After Trial 1/2:
- Approve for next trial
- Feedback
- Other permitted decision

After Trial 3:
- Final decision
- Approve professional
- Reject professional
- Feedback

---

# 15. ASSIGNMENT ENGINE

## Core Philosophy

Jobrio does not manually assign professionals during normal operation.

Admin role:

- Trigger
- Monitor
- Track
- Resolve exceptions

System role:

- Match
- Rank
- Create pool
- Send sequential requests
- Process acceptance
- Assign

---

## Assignment Flow

Payment Received
→ Assignment Queue
→ Assign Now / Scheduled Assignment
→ Pool Creation
→ Professional Matching
→ Sequential Requests
→ Professional Accepts
→ Order Assigned
→ Orders Desk / Requirement Clarity

---

# 16. ASSIGNMENT QUEUE

Two tabs:

## Ready For Assignment

Orders whose payment has been received and assignment has not yet started.

Display:

- Order ID
- Service
- Category
- Escrow value
- Payment received time
- Assignment readiness
- Capacity snapshot
- Category demand
- Category supply

Actions:

Assign Now
Schedule Assignment

---

## Scheduled Assignments

Future assignment schedules.

Display:

- Order ID
- Category
- Scheduled date
- Scheduled time
- Countdown
- Assignment status

Actions:

Launch Now
Edit Schedule
Cancel Schedule

---

# 17. LIVE POOLS

Real-time assignment monitoring.

Pool overview:

- Order ID
- Service
- Category
- Pool status
- Current professional

Matching results:

- Total matches found
- Pool limit
- Included professionals
- Excluded professionals

Example:

Matches Found: 42
Pool Limit: 15
Included: 15
Excluded: 27

Ranking:

- Rank
- Professional
- Match Score
- Quality Tier
- Availability
- Capacity
- Reliability

Only one professional receives an active request at a time.

Others remain waiting.

States:

- Pending
- Accepted
- Rejected
- Expired
- Skipped

Actions:

Skip Current Professional
Pause Pool
Resume Pool
Force Stop Pool

---

# 18. ASSIGNMENT HISTORY

Permanent assignment record.

Fields:

- Order ID
- Service
- Category
- Assignment time
- Total matches
- Pool size used
- Total declines
- Total timeouts
- Final result
- Assignment Source

Assignment Source must identify how the assignment cycle originated.

Examples:

- Payment Received Trigger
- Scheduled Assignment
- Retry
- Expanded Pool Retry
- Exception Recovery

---

# 19. FAILED POOLS & EXCEPTIONS

Assignment failures include:

## Pool Exhausted

Pool professionals rejected or timed out.

## No Match Found

No professional qualifies above the matching threshold.

## Capacity Shortage

Professionals exist but are unavailable/full/busy.

## Assignment Timeout

Pool expiry time reached.

## Professional Abandoned

An already assigned professional leaves/abandons the work before completion or otherwise exits the assignment unexpectedly.

This is an Assignment Engine exception.

Order Desk also displays the order under an Abandoned section for visibility, but operational assignment action belongs to Assignment Engine.

Failed Pool records must include:

- Order ID
- Category
- Failure Type
- Failure Reason
- Total matches
- Declines
- Timeouts
- Pool Expiry Time
- Assignment duration

Actions:

- Retry Assignment
- Expand Pool & Retry
- Escalate Hiring Need
- Hold Assignment
- Refund Recommendation
- View Failure Details

Important:

Refund Recommendation only sends the case into the Finance & Escrow workflow.

Assignment Engine does not execute the refund.

---

# 20. ASSIGNMENT ANALYTICS

Metrics:

- Assignment Success Rate
- Assignment Failure Rate
- Average Assignment Time
- Pool Exhaustion Rate

Capacity insights:

- High Demand Categories
- Shortage Categories
- Surplus Categories

Rejection intelligence:

- Too Busy
- Low Budget
- Skills Don't Match
- Timeline Too Tight
- Personal Reason

Insights:

- Most common rejection reason
- Category rejection trends
- Frequent decline categories
- Average response time
- Acceptance trends

Assignment configuration shown here is read-only.

Rules are managed elsewhere under Platform Rules.

---

# 21. PROFESSIONAL ABANDONMENT

Professional abandonment is an Assignment Engine exception.

Example:

Assigned Professional
→ Starts Work
→ Leaves / Abandons Order
→ Professional Abandoned
→ Assignment Exception

Assignment Engine handles:
- Exception creation
- Assignment recovery
- Reassignment process
- Escalation

Order Desk:
- Displays abandoned order
- Shows complete history
- Shows that Assignment Engine action is required
- Does not execute assignment actions

---

# 22. QA DESK

QA Desk exists only for quality operations.

It does not own the master order record.

It does not manually select professionals.

---

## QA Sidebar

QA Desk

├── Pending Verification
├── Rework Tracker
├── Quality Exceptions
├── QA History
└── Quality Analytics

---

# 23. QA PENDING VERIFICATION

Professional submits work.

Submission enters:

Pending Verification

Display:

- Order ID
- Category
- Professional
- Submission time
- Deadline status

Verification workspace:

Left:
- Original client brief
- Requirements
- References

Right:
- Professional submission
- Files
- Links
- Code
- Deliverables

Checklist:
- Current Platform Rules checklist
- Read-only configuration
- QA reviewer checks criteria

Actions:

Pass QA & Deliver

or

Fail QA & Send Back

---

# 24. QA REWORK TRACKER

Internal QA rework.

Client does not see this as a normal customer-facing workflow.

Display:

- Order ID
- Professional
- QA rejection reason
- Rework timer
- Latest feedback

Professional resubmits:

Rework
→ Pending Verification

---

# 25. QA QUALITY EXCEPTIONS

Critical cases:

- Repeated QA failures
- SLA breach
- No response
- Policy violations
- Plagiarism detection
- Fake/empty deliverables
- Corrupted files

Action:

Escalate Exception

This creates an Assignment Exception Request.

QA does not directly choose another professional.

Assignment Engine handles assignment recovery.

---

# 26. QA HISTORY

Permanent quality audit record.

Track:

- Order ID
- Category
- Professional
- Submission
- QA result
- Failure reason
- Rework attempts
- Final result
- Escalation

History is read-only.

---

# 27. QA ANALYTICS

Metrics:

- First-Time Pass Rate
- Rework Frequency
- QA SLA adherence
- Category quality performance
- Common rejection reasons
- Professional quality trends

Quality data can feed assignment ranking logic.

---

# 28. FINANCE & ESCROW

Exact navigation name:

Finance & Escrow

Order Desk does not create the bill.

Flow:

Order Desk
→ Approve Order
→ Finance & Escrow
→ Bill Created
→ Awaiting Payment
→ Payment Received
→ Escrow

Finance & Escrow owns:

- Bill creation
- Payment tracking
- Escrow
- Refund processing
- Escrow release
- Financial records

Order Desk only shows financial state/history.

---

# 29. DISPUTE CENTER

Dispute Center owns dispute operations.

Possible flow:

Client Dispute
→ Dispute Center
→ Evidence
→ Client Position
→ Professional Position
→ Investigation
→ Resolution

Possible outcomes:

- Refund Client
- Release Professional
- Split Settlement
- Other approved resolution

The actual financial transaction is executed through Finance & Escrow.

Dispute Center records the decision and reasoning.

---

# 30. ORDERS DESK ACTIVE STATUSES

Active order statuses:

1. Pending Review
2. Awaiting Payment
3. Payment

## Open Questions

- The complete active-order-status list after `Payment` is not yet defined in the supplied canonical content.
- No additional assumptions are introduced here.

## References

- Master Context
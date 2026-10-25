/* ------------------------------------------------------------------
 * Shared order data — moved here from apps/admin so the platform app
 * (client Order Create) can construct OrderRow-shaped records when a
 * client submits an order, and the admin Order Desk can read the same
 * live registry (see orderRegistry.ts).
 * ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending" // 1. Pending Review (Naya Order)
  | "info_requested" // 1b. Awaiting Client Info (admin asked for more details)
  | "rejected" // 1c. Rejected (Archived — admin declined with a reason)
  | "awaiting_payment" // 2. Awaiting Payment (Bill Sent)
  | "payment_received" // 3. Payment Received (Assign Now)
  | "assigned" // 4. Assigned (Requirement Clarity)
  | "progress" // 5. In Progress
  | "abandoned" // 5b. Abandoned (no professional response / dropped)
  | "qa" // 6. In QA
  | "delivered" // 7. Delivered
  | "awaiting_approval" // 8. Awaiting Client Approval
  | "rework" // 9. In Rework
  | "disputed" // 10. Disputed
  | "released" // 11. Escrow Released (Archived)
  | "cancelled" // 12. Cancelled & Refunded (Archived)
  | "resolved"; // 13. Resolved Disputes (Archived)

export type OrderRow = {
  id: string;
  c: string; // client display
  clientEmail: string;
  clientId?: string;
  a: string; // amount display
  amountNum: number;
  s: OrderStatus;
  when: string;
  service: string;
  category: string;
  pro?: string;
  proEmail?: string;
  deadline: string;
  createdAt: string;
  description: string;
  files: string[];
  invoiceNo?: string;
  invoiceDate?: string;
  paymentDue?: string;
  poolSize?: number;
  startedAt?: string;
  remaining?: string;
  lastUpdate?: string;
  deliveredAt?: string;
  reviewDeadline?: string;
  revisionNote?: string;
  disputeReason?: string;
  refundAmount?: string;
  payoutAmount?: string;
  platformFee?: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentReference?: string;
  escrowId?: string;
  assignmentId?: string;
  submissionId?: string;
  qaReviewId?: string;
  deliveryId?: string;
  assignmentMethod?: string;
  assignedAt?: string;
  resolutionNote?: string;
  resolvedBy?: string;
  // Pending Review decision trail (Approve / Reject / Request More Info)
  approvedForBilling?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  infoRequestNote?: string;
  infoRequestedAt?: string;
  infoRequestedBy?: string;
};

export const ORDERS: OrderRow[] = [
  {
    id: "JR-1042",
    c: "Acme Co. · Sarah Lin",
    clientEmail: "sarah@acme.com",
    a: "₹480",
    amountNum: 480,
    s: "pending",
    when: "5m ago",
    service: "Logo Design",
    category: "Design",
    deadline: "2026-06-25",
    createdAt: "2026-06-18 14:05",
    description: "Minimal modern logo for SaaS launch. 2 concept rounds.",
    files: ["brief.pdf", "moodboard.png"],
  },
  {
    id: "JR-1043",
    c: "Globex · Mark D.",
    clientEmail: "mark@globex.io",
    a: "₹1,200",
    amountNum: 1200,
    s: "awaiting_payment",
    when: "1h ago",
    service: "Landing Page",
    category: "Development",
    deadline: "2026-06-28",
    createdAt: "2026-06-18 12:30",
    description: "Single-page marketing site with CMS.",
    files: ["spec.pdf"],
    invoiceNo: "INV-2026-1043",
    invoiceDate: "2026-06-18",
    paymentDue: "2026-06-20",
  },
  {
    id: "JR-1044",
    c: "Initech · Ravi P.",
    clientEmail: "ravi@initech.com",
    a: "₹320",
    amountNum: 320,
    s: "payment_received",
    when: "30m ago",
    service: "SEO Audit",
    category: "Marketing",
    deadline: "2026-06-24",
    createdAt: "2026-06-18 11:00",
    description: "Full technical SEO audit + report.",
    files: ["site-list.csv"],
    invoiceNo: "INV-2026-1044",
    invoiceDate: "2026-06-17",
    poolSize: 18,
  },
  {
    id: "JR-1045",
    c: "Soylent · Anita K.",
    clientEmail: "anita@soylent.in",
    a: "₹760",
    amountNum: 760,
    s: "assigned",
    when: "2h ago",
    service: "Brand Guidelines",
    category: "Design",
    pro: "Ravi K.",
    proEmail: "ravi.k@jobrio.pro",
    deadline: "2026-06-30",
    createdAt: "2026-06-18 09:10",
    description: "Brand book v1 with typography & color tokens.",
    files: ["logo.svg"],
  },
  {
    id: "JR-1041",
    c: "Globex · Mark D.",
    clientEmail: "mark@globex.io",
    a: "₹1,200",
    amountNum: 1200,
    s: "progress",
    when: "2h ago",
    service: "Mobile App UI",
    category: "Design",
    pro: "Pooja D.",
    proEmail: "pooja.d@jobrio.pro",
    deadline: "2026-06-26",
    createdAt: "2026-06-15 10:00",
    startedAt: "2026-06-16 09:00",
    remaining: "3d 6h",
    lastUpdate: "Wireframes shared",
    description: "iOS + Android UI for 8 screens.",
    files: ["wireframes.fig"],
  },
  {
    id: "JR-2041",
    c: "Wayne Ent. · B.W.",
    clientEmail: "bw@wayne.co",
    a: "₹520",
    amountNum: 520,
    s: "abandoned",
    when: "2h ago",
    service: "Logo Design",
    category: "Design",
    pro: "Ravi K.",
    proEmail: "ravi.k@jobrio.pro",
    deadline: "2026-06-24",
    createdAt: "2026-06-16 11:20",
    startedAt: "2026-06-17 09:00",
    remaining: "—",
    lastUpdate: "Professional unresponsive after acceptance",
    description: "Minimal brand mark for fintech launch.",
    files: ["brief.pdf", "moodboard.png"],
  },
  {
    id: "JR-2039",
    c: "Pied Piper · R. Hendricks",
    clientEmail: "rh@piedpiper.io",
    a: "₹860",
    amountNum: 860,
    s: "abandoned",
    when: "5h ago",
    service: "Article Writing",
    category: "Writing",
    pro: "Suresh M.",
    proEmail: "suresh.m@jobrio.pro",
    deadline: "2026-06-25",
    createdAt: "2026-06-15 08:10",
    startedAt: "2026-06-16 10:00",
    remaining: "—",
    lastUpdate: "Dropped mid-progress, no status update",
    description: "Long-form blog post — 2,500 words, SEO optimised.",
    files: ["outline.docx"],
  },
  {
    id: "JR-1040",
    c: "Initech · Ravi P.",
    clientEmail: "ravi@initech.com",
    a: "₹320",
    amountNum: 320,
    s: "qa",
    when: "4h ago",
    service: "Copywriting",
    category: "Writing",
    pro: "Suresh M.",
    proEmail: "suresh.m@jobrio.pro",
    deadline: "2026-06-22",
    createdAt: "2026-06-14",
    startedAt: "2026-06-15",
    description: "Website copy — 5 pages.",
    files: ["draft-v2.docx"],
  },
  {
    id: "JR-1039",
    c: "Soylent · Anita K.",
    clientEmail: "anita@soylent.in",
    a: "₹95",
    amountNum: 95,
    s: "delivered",
    when: "1d ago",
    service: "Logo Touch-up",
    category: "Design",
    pro: "Anita S.",
    proEmail: "anita.s@jobrio.pro",
    deadline: "2026-06-17",
    createdAt: "2026-06-14",
    deliveredAt: "2026-06-17 18:20",
    reviewDeadline: "2026-06-20",
    description: "Color & spacing fixes on existing logo.",
    files: ["logo-final.svg", "logo-final.png"],
  },
  {
    id: "JR-1037",
    c: "Umbrella · Lee",
    clientEmail: "lee@umbrella.co",
    a: "₹540",
    amountNum: 540,
    s: "awaiting_approval",
    when: "1d ago",
    service: "Pitch Deck",
    category: "Design",
    pro: "Ravi K.",
    proEmail: "ravi.k@jobrio.pro",
    deadline: "2026-06-19",
    createdAt: "2026-06-12",
    deliveredAt: "2026-06-17 09:00",
    reviewDeadline: "2026-06-20",
    description: "12-slide investor deck.",
    files: ["deck-v1.pdf"],
  },
  {
    id: "JR-1035",
    c: "Stark Ind. · Tony",
    clientEmail: "tony@stark.co",
    a: "₹420",
    amountNum: 420,
    s: "rework",
    when: "1d ago",
    service: "Social Banners",
    category: "Design",
    pro: "Pooja D.",
    proEmail: "pooja.d@jobrio.pro",
    deadline: "2026-06-23",
    createdAt: "2026-06-12",
    description: "5 banners across 3 platforms.",
    files: ["banners-v1.zip"],
    revisionNote: "Change CTA color, swap hero image, tighten margins.",
  },
  {
    id: "JR-1031",
    c: "Stark Ind. · Tony",
    clientEmail: "tony@stark.co",
    a: "₹1,800",
    amountNum: 1800,
    s: "disputed",
    when: "3d ago",
    service: "Full-home Painting Brief",
    category: "Operations",
    pro: "Suresh M.",
    proEmail: "suresh.m@jobrio.pro",
    deadline: "2026-06-15",
    createdAt: "2026-06-08",
    description: "Coordination & scope brief for full-home paint.",
    files: ["scope.pdf"],
    disputeReason: "Client claims scope mismatch; professional claims complete delivery.",
  },
  // Archived
  {
    id: "JR-1038",
    c: "Umbrella · Lee",
    clientEmail: "lee@umbrella.co",
    a: "₹640",
    amountNum: 640,
    s: "released",
    when: "2d ago",
    service: "Email Templates",
    category: "Design",
    pro: "Anita S.",
    proEmail: "anita.s@jobrio.pro",
    deadline: "2026-06-14",
    createdAt: "2026-06-08",
    deliveredAt: "2026-06-13",
    description: "3 responsive email templates.",
    files: ["templates.zip"],
    payoutAmount: "₹512",
    platformFee: "₹128",
  },
  {
    id: "JR-1029",
    c: "Initech · Ravi P.",
    clientEmail: "ravi@initech.com",
    a: "₹95",
    amountNum: 95,
    s: "cancelled",
    when: "5d ago",
    service: "Deep Cleaning Brief",
    category: "Operations",
    deadline: "—",
    createdAt: "2026-06-10",
    description: "Cancelled after review — out of service zone.",
    files: [],
    refundAmount: "₹95",
  },
  {
    id: "JR-1010",
    c: "Wayne Ent. · B.W.",
    clientEmail: "bw@wayne.co",
    a: "₹2,400",
    amountNum: 2400,
    s: "resolved",
    when: "12d ago",
    service: "Brand Refresh",
    category: "Design",
    pro: "Ravi K.",
    proEmail: "ravi.k@jobrio.pro",
    deadline: "2026-06-01",
    createdAt: "2026-05-20",
    description: "Brand refresh dispute — partial scope delivered.",
    files: ["evidence.zip"],
    disputeReason: "Scope ambiguity on iconography set.",
    resolutionNote: "Split settlement — 60% to professional, 40% refund to client.",
    resolvedBy: "Admin · N. Mehta",
    refundAmount: "₹960",
    payoutAmount: "₹1,440",
  },
];

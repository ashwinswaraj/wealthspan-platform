/* ------------------------------------------------------------------
 * Shared notification data — moved here from apps/web so the
 * Super Admin app can push a real notification (order rejected, more
 * info requested, invoice sent, etc.) into the same feed the client
 * sees on their Notifications page. See notificationRegistry.ts.
 * ------------------------------------------------------------------ */

export type NotifType = "message" | "order" | "invoice" | "system" | "review";

export interface NotifItem {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  clientId?: string;
  orderId?: string;
}

export const DEMO_NOTIFS: NotifItem[] = [
  {
    id: "1",
    type: "message",
    title: "New message from Aarav Sharma",
    body: "Hey! I've shared the first draft of the logo. Let me know your thoughts.",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    type: "order",
    title: "Order #JR-1042 is now Active",
    body: "Your professional has accepted the order and started working.",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    type: "invoice",
    title: "Invoice #INV-2210 paid",
    body: "Payment of ₹480 has been received and held in escrow.",
    time: "3h ago",
    read: false,
  },
  {
    id: "4",
    type: "review",
    title: "Leave a review for Priya Mehta",
    body: "Your order #JR-1031 is completed. Share your experience.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "Profile verification complete",
    body: "Your KYC documents have been verified successfully.",
    time: "2d ago",
    read: true,
  },
  {
    id: "6",
    type: "order",
    title: "Revision requested on #JR-1029",
    body: "The client has requested a small revision on the deliverable.",
    time: "3d ago",
    read: true,
  },
  {
    id: "7",
    type: "message",
    title: "New message from Support",
    body: "We've replied to your ticket #SP-882. Please check.",
    time: "4d ago",
    read: true,
  },
];

import { MessagesInbox, type MessageThread } from "@jobrio/ui/design-system";

const THREADS: MessageThread[] = [
  {
    id: "#JR-1042",
    name: "Ravi K.",
    meta: "Professional",
    orderTitle: "Bathroom leak repair",
    last: "On my way, ETA 20 min.",
    time: "2m",
    unread: 2,
    status: "In Progress",
    deadline: "18 Aug",
    online: true,
    messages: [
      {
        id: "s1",
        from: "system",
        text: "Professional assigned to this order.",
        time: "09:00",
        daySeparator: "TODAY",
      },
      {
        id: "m1",
        from: "them",
        text: "Hi! I've been assigned to your bathroom leak repair.",
        time: "09:02 AM",
      },
      {
        id: "m2",
        from: "me",
        text: "Great — what time can you reach?",
        time: "09:04 AM",
        state: "read",
      },
      { id: "m3", from: "them", text: "On my way, ETA 20 min.", time: "09:20 AM" },
      {
        id: "s2",
        from: "system",
        text: "Order moved to In Progress.",
        time: "09:21",
      },
    ],
  },
  {
    id: "#JR-1038",
    name: "Suresh M.",
    meta: "Professional",
    orderTitle: "Split AC deep service",
    last: "Service completed, please review.",
    time: "1h",
    unread: 0,
    status: "Awaiting review",
    deadline: "12 Aug",
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Servicing done, gas pressure is normal.",
        time: "11:40 AM",
        daySeparator: "TODAY",
      },
      {
        id: "m2",
        from: "them",
        text: "Service completed, please review.",
        time: "11:42 AM",
        attachment: { name: "service-report.pdf", size: "4.8 MB", kind: "document" },
      },
      {
        id: "s1",
        from: "system",
        text: "Delivery submitted for QA review.",
        time: "11:45",
      },
      { id: "m3", from: "me", text: "Thanks, checking now.", time: "11:55 AM", state: "delivered" },
    ],
  },
  {
    id: "#JR-1031",
    name: "Pooja D.",
    meta: "Professional",
    orderTitle: "2BHK interior painting",
    last: "Sharing updated quote.",
    time: "1d",
    unread: 1,
    status: "Quote sent",
    deadline: "24 Aug",
    messages: [
      {
        id: "m1",
        from: "me",
        text: "Can you include the ceiling as well?",
        time: "05:20 PM",
        state: "read",
        daySeparator: "YESTERDAY",
      },
      {
        id: "m2",
        from: "them",
        text: "Sharing updated quote.",
        time: "06:02 PM",
        attachment: { name: "quote-v2.pdf", size: "1.2 MB", kind: "document" },
      },
    ],
  },
];

export const MessagesSection = () => (
  <MessagesInbox
    title="Messages"
    description="One chat per order with your assigned pro."
    threads={THREADS}
    counterpartyLabel="professional"
  />
);

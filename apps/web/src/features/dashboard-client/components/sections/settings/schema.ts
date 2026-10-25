import type { AccountSettings } from "../../../lib/account-settings";

export type SettingsRole = "client" | "professional";

export type Field =
  | { kind: "text"; path: string; label: string; placeholder?: string; hint?: string }
  | { kind: "number"; path: string; label: string; suffix?: string; hint?: string }
  | { kind: "toggle"; path: string; label: string; hint?: string }
  | { kind: "select"; path: string; label: string; options: { value: string; label: string }[] }
  | { kind: "tags"; path: string; label: string; hint?: string };

export type SettingsItem = {
  key: string;
  icon: string;
  label: string;
  desc: string;
  /** Special screens that are not plain field forms. */
  custom?: "profile" | "password" | "sessions" | "payment-methods" | "export" | "delete";
  fields?: Field[];
  value?: (s: AccountSettings) => string;
};

export type SettingsGroup = { title: string; items: SettingsItem[] };

const ACCOUNT: SettingsGroup = {
  title: "Account",
  items: [
    {
      key: "personal",
      icon: "person",
      label: "Personal information",
      desc: "Name, email, phone",
      custom: "profile",
      value: () => "View",
    },
    {
      key: "password",
      icon: "lock",
      label: "Password",
      desc: "Change your password",
      custom: "password",
      value: (s) =>
        s.security.passwordUpdatedAt
          ? `Updated ${new Date(s.security.passwordUpdatedAt).toLocaleDateString("en-IN")}`
          : "Not changed yet",
    },
    {
      key: "2fa",
      icon: "verified_user",
      label: "Two-factor authentication",
      desc: "Extra login security",
      fields: [
        { kind: "toggle", path: "security.twoFactor", label: "Enable two-factor login" },
        {
          kind: "select",
          path: "security.twoFactorMethod",
          label: "Verification method",
          options: [
            { value: "app", label: "Authenticator app" },
            { value: "sms", label: "SMS code" },
            { value: "email", label: "Email code" },
          ],
        },
        {
          kind: "toggle",
          path: "security.loginAlerts",
          label: "Alert me about new logins",
        },
      ],
      value: (s) => (s.security.twoFactor ? "Enabled" : "Disabled"),
    },
    {
      key: "sessions",
      icon: "devices",
      label: "Active sessions",
      desc: "Devices signed in",
      custom: "sessions",
      value: (s) => `${s.sessions.length} active`,
    },
  ],
};

const PREFERENCES: SettingsGroup = {
  title: "Preferences",
  items: [
    {
      key: "language",
      icon: "language",
      label: "Language",
      desc: "Interface language",
      fields: [
        {
          kind: "select",
          path: "language",
          label: "Language",
          options: [
            { value: "English (IN)", label: "English (India)" },
            { value: "English (US)", label: "English (US)" },
            { value: "हिन्दी", label: "हिन्दी" },
            { value: "मराठी", label: "मराठी" },
            { value: "தமிழ்", label: "தமிழ்" },
          ],
        },
      ],
      value: (s) => s.language,
    },
    {
      key: "timezone",
      icon: "schedule",
      label: "Time zone",
      desc: "Used for schedules",
      fields: [
        {
          kind: "select",
          path: "timezone",
          label: "Time zone",
          options: [
            { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
            { value: "Asia/Dubai", label: "Asia/Dubai" },
            { value: "Europe/London", label: "Europe/London" },
            { value: "America/New_York", label: "America/New_York" },
          ],
        },
      ],
      value: (s) => s.timezone,
    },
    {
      key: "appearance",
      icon: "dark_mode",
      label: "Appearance",
      desc: "Theme and density",
      fields: [
        {
          kind: "select",
          path: "appearance",
          label: "Theme",
          options: [
            { value: "system", label: "Match system" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ],
        },
        {
          kind: "select",
          path: "density",
          label: "Density",
          options: [
            { value: "comfortable", label: "Comfortable" },
            { value: "compact", label: "Compact" },
          ],
        },
      ],
      value: (s) => s.appearance.charAt(0).toUpperCase() + s.appearance.slice(1),
    },
    {
      key: "notifications",
      icon: "notifications",
      label: "Notifications",
      desc: "Email, SMS and push",
      fields: [
        { kind: "toggle", path: "notifications.email", label: "Email updates" },
        { kind: "toggle", path: "notifications.sms", label: "SMS alerts" },
        { kind: "toggle", path: "notifications.push", label: "Push notifications" },
        { kind: "toggle", path: "notifications.marketing", label: "Offers and tips" },
      ],
      value: (s) => {
        const on = Object.values(s.notifications).filter(Boolean).length;
        return `${on} of 4 on`;
      },
    },
  ],
};

const CLIENT_GROUP: SettingsGroup = {
  title: "Billing & Orders",
  items: [
    {
      key: "payment-methods",
      icon: "credit_card",
      label: "Payment methods",
      desc: "Cards and UPI",
      custom: "payment-methods",
      value: (s) => `${s.paymentMethods.length} saved`,
    },
    {
      key: "billing",
      icon: "receipt_long",
      label: "Billing details",
      desc: "GSTIN and address",
      fields: [
        { kind: "text", path: "billing.legalName", label: "Legal / billing name" },
        { kind: "text", path: "billing.gstin", label: "GSTIN", placeholder: "22AAAAA0000A1Z5" },
        { kind: "text", path: "billing.address", label: "Billing address" },
        { kind: "text", path: "billing.city", label: "City" },
        { kind: "text", path: "billing.pincode", label: "PIN code" },
      ],
      value: (s) => (s.billing.gstin || s.billing.address ? "Added" : "Not added"),
    },
    {
      key: "wallet",
      icon: "account_balance_wallet",
      label: "Wallet & auto top-up",
      desc: "Balance rules",
      fields: [
        { kind: "toggle", path: "wallet.autoTopUp", label: "Auto top-up wallet" },
        {
          kind: "number",
          path: "wallet.threshold",
          label: "Top up when balance falls below",
          suffix: "₹",
        },
        { kind: "number", path: "wallet.topUpAmount", label: "Top-up amount", suffix: "₹" },
      ],
      value: (s) => (s.wallet.autoTopUp ? `On · ₹${s.wallet.topUpAmount}` : "Off"),
    },
    {
      key: "order-defaults",
      icon: "assignment",
      label: "Order defaults",
      desc: "Budget, SLA, categories",
      fields: [
        { kind: "number", path: "orderDefaults.budget", label: "Default budget", suffix: "₹" },
        {
          kind: "select",
          path: "orderDefaults.sla",
          label: "Expected turnaround",
          options: [
            { value: "24h", label: "Within 24 hours" },
            { value: "48h", label: "Within 48 hours" },
            { value: "3d", label: "Within 3 days" },
            { value: "7d", label: "Within 7 days" },
          ],
        },
        {
          kind: "text",
          path: "orderDefaults.category",
          label: "Preferred category",
          placeholder: "e.g. Electrical",
        },
        {
          kind: "toggle",
          path: "orderDefaults.autoAssign",
          label: "Auto-assign best matched professional",
        },
      ],
      value: (s) => `₹${s.orderDefaults.budget} · ${s.orderDefaults.sla}`,
    },
  ],
};

const PRO_GROUP: SettingsGroup = {
  title: "Work & Payouts",
  items: [
    {
      key: "kyc",
      icon: "badge",
      label: "KYC & verification",
      desc: "Identity documents",
      custom: "profile",
      value: () => "View",
    },
    {
      key: "payout",
      icon: "account_balance",
      label: "Payout account",
      desc: "Bank / UPI for earnings",
      fields: [
        {
          kind: "select",
          path: "payout.method",
          label: "Payout method",
          options: [
            { value: "bank", label: "Bank transfer" },
            { value: "upi", label: "UPI" },
          ],
        },
        { kind: "text", path: "payout.accountName", label: "Account holder name" },
        { kind: "text", path: "payout.accountNumber", label: "Account number" },
        { kind: "text", path: "payout.ifsc", label: "IFSC code" },
        { kind: "text", path: "payout.upiId", label: "UPI ID", placeholder: "name@bank" },
        {
          kind: "select",
          path: "payout.schedule",
          label: "Payout schedule",
          options: [
            { value: "weekly", label: "Weekly" },
            { value: "biweekly", label: "Every 2 weeks" },
            { value: "monthly", label: "Monthly" },
          ],
        },
      ],
      value: (s) =>
        s.payout.method === "upi"
          ? s.payout.upiId || "Not added"
          : s.payout.accountNumber
            ? `••${s.payout.accountNumber.slice(-4)}`
            : "Not added",
    },
    {
      key: "availability",
      icon: "work_history",
      label: "Availability",
      desc: "Working hours and load",
      fields: [
        {
          kind: "select",
          path: "availability.type",
          label: "Availability",
          options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "weekends", label: "Weekends only" },
          ],
        },
        { kind: "number", path: "availability.hoursPerWeek", label: "Hours per week" },
        { kind: "number", path: "availability.maxActiveJobs", label: "Max active jobs" },
        { kind: "toggle", path: "availability.acceptUrgent", label: "Accept urgent jobs" },
        { kind: "number", path: "serviceRadiusKm", label: "Service radius", suffix: "km" },
      ],
      value: (s) => `${s.availability.type} · ${s.availability.hoursPerWeek}h`,
    },
    {
      key: "skills",
      icon: "category",
      label: "Skills & categories",
      desc: "Job matching preferences",
      fields: [
        {
          kind: "tags",
          path: "skills",
          label: "Skills",
          hint: "Press Enter to add a skill.",
        },
      ],
      value: (s) => `${s.skills.length} selected`,
    },
  ],
};

const PRIVACY: SettingsGroup = {
  title: "Privacy & Data",
  items: [
    {
      key: "privacy",
      icon: "shield",
      label: "Privacy controls",
      desc: "Who can see your activity",
      fields: [
        {
          kind: "select",
          path: "privacy.profileVisibility",
          label: "Profile visibility",
          options: [
            { value: "public", label: "Everyone" },
            { value: "contacts", label: "People I work with" },
            { value: "private", label: "Only me" },
          ],
        },
        { kind: "toggle", path: "privacy.showActivity", label: "Show my activity status" },
        { kind: "toggle", path: "privacy.allowSearch", label: "Allow search by name" },
      ],
      value: (s) => s.privacy.profileVisibility,
    },
    {
      key: "export",
      icon: "download",
      label: "Export data",
      desc: "Download a copy of your data",
      custom: "export",
    },
    {
      key: "delete",
      icon: "delete",
      label: "Delete account",
      desc: "Permanently remove your account",
      custom: "delete",
    },
  ],
};

export const settingsGroups = (role: SettingsRole): SettingsGroup[] => [
  ACCOUNT,
  role === "client" ? CLIENT_GROUP : PRO_GROUP,
  PREFERENCES,
  PRIVACY,
];

export const findSettingsItem = (role: SettingsRole, key: string) =>
  settingsGroups(role)
    .flatMap((g) => g.items)
    .find((i) => i.key === key);

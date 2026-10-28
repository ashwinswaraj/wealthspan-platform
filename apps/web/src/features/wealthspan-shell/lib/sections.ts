import { Briefcase, Download, MessageCircle, Settings, Wallet } from "lucide-react";

export const SECTIONS = [
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "accounts", label: "Accounts", icon: Wallet },
  { key: "chat", label: "Accountant", icon: MessageCircle },
  { key: "exports", label: "Export", icon: Download },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export interface ClientCardData {
  name: string;
  companyName?: string;
  clientType: "Individual" | "Company";
  id: string;
  img: string;
  status: "ACTIVE" | "INACTIVE" | "FLAGGED";
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  disputeRate: number;
  paymentReliability: "High" | "Medium" | "Low";
  trustState: "High Trust Client" | "Regular Client" | "New Client";
  trustScore: number;
  mostUsedCategories: string[];
  avgOrderValue: string;
  repeatRate: number;
  joinedDate: string;
  totalActiveMonths: number;
  badges: string[];
}

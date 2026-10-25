export interface ProfessionalCardData {
  name: string;
  role: string;
  category: string;
  secondarySkills: string[];
  id: string;
  qualityScore: number;
  tier: "Standard" | "Premium" | "Elite";
  img: string;
  status: "ACTIVE" | "IDLE" | "BUSY" | "OFFLINE";
  acceptanceRate: number;
  ordersCompleted: number;
  onTimeRate: number;
  responseSpeed: "Fast" | "Medium" | "Slow";
  avgRating: number;
  experience: number;
  joinedYear: number;
  totalActiveDays: number;
  tierProgress: number;
  badges: string[];
  activeOrders?: number;
}

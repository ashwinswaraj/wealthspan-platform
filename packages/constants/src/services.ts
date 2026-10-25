import type { LucideIcon } from "lucide-react";
import {
  Search,
  Globe,
  PenTool,
  Layout,
  Share2,
  Smartphone,
  ShoppingCart,
  Database,
  Video,
  BarChart3,
  Code,
  Cpu,
  Shield,
  Zap,
  Cloud,
  Mail,
  FileText,
  Headphones,
  Users,
  Target,
  Megaphone,
  Camera,
  Palette,
  Layers,
  Monitor,
  Wifi,
  Lock,
  Settings,
  Briefcase,
  TrendingUp,
  Award,
  BookOpen,
  Map,
  MessageSquare,
  Clock,
  DollarSign,
  Heart,
  Star,
  Compass,
  Lightbulb,
  Rocket,
  Cog,
  Package,
  Truck,
  Home,
  Music,
  Mic,
  Radio,
  Tv,
  Printer,
  Phone,
  Tablet,
  Watch,
  HardDrive,
  Server,
  Terminal,
  GitBranch,
  Figma,
  Chrome,
  Feather,
  Edit,
  Scissors,
  PenLine,
  Type,
  Image,
  Film,
  Volume2,
  Speaker,
  Bluetooth,
  Battery,
  Thermometer,
  Droplet,
  Wind,
  Sun,
  Moon,
  Umbrella,
  Key,
  Gift,
  Tag,
  Bookmark,
  Flag,
  Bell,
  Send,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  Grid,
  List,
  AlignCenter,
  Bold,
} from "lucide-react";

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const allServices: ServiceItem[] = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "High-performance, conversion-optimized web architectures that turn visitors into loyal customers.",
  },
  {
    icon: PenTool,
    title: "UI/UX Design (Web & App)",
    desc: "Premium, intuitive user experiences that simplify complex journeys and elevate your platform.",
  },
  {
    icon: Layout,
    title: "Landing Page Development",
    desc: "High-impact, results-driven landing pages designed to trigger action and maximize advertising ROI.",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    desc: "Strategic content creation to community engagement, building a powerful and influential brand voice.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Native and cross-platform applications with seamless performance and stunning interfaces.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    desc: "Data-driven strategies that boost organic rankings and drive qualified traffic to your domain.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Solutions",
    desc: "Scalable, secure e-commerce platforms with optimized checkout flows and payment integrations.",
  },
  {
    icon: Database,
    title: "Backend & API Development",
    desc: "Secure, high-performance APIs and server architectures that handle millions of requests.",
  },
  {
    icon: Video,
    title: "Video & Motion Graphics",
    desc: "Cinematic video content and motion graphics that tell your brand story with impact.",
  },
  {
    icon: BarChart3,
    title: "Data Analytics & BI",
    desc: "Transform raw data into actionable business intelligence with custom dashboards and predictive models.",
  },
  {
    icon: Code,
    title: "Custom Software Development",
    desc: "Tailored software solutions built from scratch to address your unique business challenges.",
  },
  {
    icon: Cpu,
    title: "AI & Machine Learning",
    desc: "Intelligent AI models and ML pipelines that automate processes and unlock predictive capabilities.",
  },
  {
    icon: Shield,
    title: "Cybersecurity Services",
    desc: "Comprehensive security audits, penetration testing, and threat monitoring for your digital assets.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    desc: "Scalable cloud architecture on AWS, Azure, or GCP with automated deployment pipelines.",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    desc: "Speed up your applications with advanced caching, lazy loading, and code splitting techniques.",
  },
  {
    icon: Mail,
    title: "Email Marketing Automation",
    desc: "Automated email campaigns with segmentation, A/B testing, and conversion tracking.",
  },
  {
    icon: FileText,
    title: "Content Writing & Strategy",
    desc: "SEO-optimized content creation including blogs, whitepapers, and thought leadership articles.",
  },
  {
    icon: Headphones,
    title: "Customer Support Systems",
    desc: "End-to-end customer support infrastructure with ticketing, live chat, and knowledge bases.",
  },
  {
    icon: Users,
    title: "Team Augmentation",
    desc: "On-demand access to pre-vetted professionals to scale your team without hiring overhead.",
  },
  {
    icon: Target,
    title: "Digital Advertising (PPC)",
    desc: "Data-driven paid campaigns across Google, Meta, and LinkedIn to maximize your ad spend ROI.",
  },
  {
    icon: Megaphone,
    title: "Brand Identity & Strategy",
    desc: "Complete brand development including logo design, guidelines, messaging, and positioning.",
  },
  {
    icon: Camera,
    title: "Product Photography",
    desc: "Professional product shots and lifestyle imagery that elevate your catalog and marketing.",
  },
  {
    icon: Palette,
    title: "Graphic Design Services",
    desc: "Eye-catching visuals for print, digital, social media, and marketing collateral.",
  },
  {
    icon: Layers,
    title: "Design System Creation",
    desc: "Scalable component libraries and design tokens that ensure consistency across your product.",
  },
  {
    icon: Monitor,
    title: "Desktop Application Dev",
    desc: "Cross-platform desktop applications using Electron, Tauri, or native frameworks.",
  },
  {
    icon: Wifi,
    title: "IoT Solutions",
    desc: "Connected device ecosystems with real-time monitoring, data collection, and remote control.",
  },
  {
    icon: Lock,
    title: "Compliance & GDPR",
    desc: "Ensure your platforms meet regulatory requirements including GDPR, HIPAA, and SOC2.",
  },
  {
    icon: Settings,
    title: "DevOps & CI/CD",
    desc: "Automated build, test, and deployment pipelines that accelerate your development lifecycle.",
  },
  {
    icon: Briefcase,
    title: "Business Process Automation",
    desc: "Streamline repetitive workflows with intelligent automation tools and integrations.",
  },
  {
    icon: TrendingUp,
    title: "Growth Hacking",
    desc: "Rapid experimentation across marketing channels to identify the most efficient growth strategies.",
  },
  {
    icon: Award,
    title: "Quality Assurance & Testing",
    desc: "Comprehensive QA including manual testing, automation, performance, and security testing.",
  },
  {
    icon: BookOpen,
    title: "Technical Documentation",
    desc: "Clear, structured documentation for APIs, SDKs, user guides, and internal knowledge bases.",
  },
  {
    icon: Map,
    title: "Location-Based Services",
    desc: "Geo-aware applications with mapping, routing, geofencing, and spatial analytics.",
  },
  {
    icon: MessageSquare,
    title: "Chatbot Development",
    desc: "AI-powered conversational bots for customer service, lead generation, and engagement.",
  },
  {
    icon: Clock,
    title: "Real-Time Applications",
    desc: "WebSocket-powered applications for live chat, dashboards, notifications, and collaboration.",
  },
  {
    icon: DollarSign,
    title: "Payment Integration",
    desc: "Secure payment gateway integration with Stripe, PayPal, Razorpay, and custom solutions.",
  },
  {
    icon: Heart,
    title: "Healthcare Tech Solutions",
    desc: "HIPAA-compliant healthcare platforms including telemedicine, EHR, and patient portals.",
  },
  {
    icon: Star,
    title: "Review & Reputation Mgmt",
    desc: "Automated review collection, monitoring, and response systems to protect your brand.",
  },
  {
    icon: Compass,
    title: "Product Strategy Consulting",
    desc: "Expert guidance on product roadmap, market fit, user research, and go-to-market strategy.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Workshops",
    desc: "Facilitated design thinking and ideation sessions to unlock creative solutions for your team.",
  },
  {
    icon: Rocket,
    title: "MVP Development",
    desc: "Rapid prototyping and minimum viable product builds to validate your idea in weeks, not months.",
  },
  {
    icon: Cog,
    title: "System Integration",
    desc: "Connect disparate systems with middleware, APIs, and data synchronization solutions.",
  },
  {
    icon: Package,
    title: "SaaS Product Development",
    desc: "End-to-end SaaS platform development with multi-tenancy, billing, and analytics.",
  },
  {
    icon: Truck,
    title: "Logistics & Supply Chain Tech",
    desc: "Digital solutions for fleet management, inventory tracking, and supply chain optimization.",
  },
  {
    icon: Home,
    title: "Real Estate Tech (PropTech)",
    desc: "Property listing platforms, virtual tours, CRM systems, and investment analytics tools.",
  },
  {
    icon: Music,
    title: "Audio Production",
    desc: "Professional audio editing, mixing, mastering, and podcast production services.",
  },
  {
    icon: Mic,
    title: "Podcast Production",
    desc: "End-to-end podcast setup including recording, editing, distribution, and show notes.",
  },
  {
    icon: Radio,
    title: "Streaming Solutions",
    desc: "Live streaming infrastructure for webinars, virtual events, and broadcast platforms.",
  },
  {
    icon: Tv,
    title: "OTT Platform Development",
    desc: "Video-on-demand and live streaming platforms with subscription management and DRM.",
  },
  {
    icon: Printer,
    title: "Print Design & Production",
    desc: "Professional print materials including brochures, business cards, packaging, and signage.",
  },
  {
    icon: Phone,
    title: "VoIP & Communication Systems",
    desc: "Enterprise communication solutions with VoIP, video conferencing, and unified messaging.",
  },
  {
    icon: Tablet,
    title: "Tablet & Kiosk Applications",
    desc: "Interactive kiosk and tablet apps for retail, hospitality, and information display.",
  },
  {
    icon: Watch,
    title: "Wearable App Development",
    desc: "Applications for smartwatches, fitness trackers, and other wearable devices.",
  },
  {
    icon: HardDrive,
    title: "Data Migration Services",
    desc: "Seamless data transfer between platforms, databases, and cloud environments.",
  },
  {
    icon: Server,
    title: "Dedicated Server Management",
    desc: "24/7 server monitoring, maintenance, security patching, and performance optimization.",
  },
  {
    icon: Terminal,
    title: "Script & Automation Dev",
    desc: "Custom scripts and automation tools to streamline your development and operations workflows.",
  },
  {
    icon: GitBranch,
    title: "Version Control & Code Review",
    desc: "Git workflow setup, code review processes, and collaborative development best practices.",
  },
  {
    icon: Figma,
    title: "Figma to Code Conversion",
    desc: "Pixel-perfect translation of Figma designs into production-ready frontend code.",
  },
  {
    icon: Chrome,
    title: "Browser Extension Dev",
    desc: "Custom browser extensions for Chrome, Firefox, and Edge to enhance user productivity.",
  },
  {
    icon: Feather,
    title: "Copywriting & Editing",
    desc: "Compelling copy for websites, ads, email campaigns, and marketing materials.",
  },
  {
    icon: Edit,
    title: "Video Editing & Post-Production",
    desc: "Professional video editing, color grading, sound design, and visual effects.",
  },
  {
    icon: Scissors,
    title: "Photo Retouching",
    desc: "Advanced photo editing, retouching, background removal, and image enhancement.",
  },
  {
    icon: PenLine,
    title: "Illustration & Icon Design",
    desc: "Custom illustrations, icon sets, and visual assets tailored to your brand identity.",
  },
  {
    icon: Type,
    title: "Typography & Font Design",
    desc: "Custom typeface creation and typography consulting for distinctive brand identity.",
  },
  {
    icon: Image,
    title: "Infographic Design",
    desc: "Data-driven infographics that communicate complex information visually and engagingly.",
  },
  {
    icon: Film,
    title: "Animation & Explainer Videos",
    desc: "2D/3D animations and explainer videos that simplify complex concepts for your audience.",
  },
  {
    icon: Volume2,
    title: "Sound Design & SFX",
    desc: "Custom sound effects, ambient audio, and sonic branding for apps, videos, and games.",
  },
  {
    icon: Speaker,
    title: "Voice-Over Services",
    desc: "Professional voice-over recording in multiple languages for ads, tutorials, and IVR.",
  },
  {
    icon: Bluetooth,
    title: "Bluetooth & NFC Solutions",
    desc: "Proximity-based solutions for contactless payments, access control, and asset tracking.",
  },
  {
    icon: Battery,
    title: "Green Tech & Sustainability",
    desc: "Technology solutions for energy management, carbon tracking, and sustainability reporting.",
  },
  {
    icon: Thermometer,
    title: "Climate Tech Solutions",
    desc: "Environmental monitoring, weather data integration, and climate risk analysis platforms.",
  },
  {
    icon: Droplet,
    title: "Water & Utility Management",
    desc: "Smart utility monitoring and management systems for water, gas, and electricity.",
  },
  {
    icon: Wind,
    title: "Renewable Energy Platforms",
    desc: "Digital platforms for solar, wind, and renewable energy management and optimization.",
  },
  {
    icon: Sun,
    title: "EdTech Solutions",
    desc: "Learning management systems, online course platforms, and educational technology tools.",
  },
  {
    icon: Moon,
    title: "Sleep & Wellness Apps",
    desc: "Health and wellness applications for sleep tracking, meditation, and mental health.",
  },
  {
    icon: Umbrella,
    title: "InsurTech Solutions",
    desc: "Digital insurance platforms with automated underwriting, claims, and policy management.",
  },
  {
    icon: Key,
    title: "Identity & Access Management",
    desc: "Secure authentication systems with SSO, MFA, role-based access, and user provisioning.",
  },
  {
    icon: Gift,
    title: "Loyalty & Rewards Programs",
    desc: "Digital loyalty platforms with points systems, gamification, and customer retention tools.",
  },
  {
    icon: Tag,
    title: "Pricing & Revenue Optimization",
    desc: "Dynamic pricing engines, subscription management, and revenue analytics dashboards.",
  },
  {
    icon: Bookmark,
    title: "Knowledge Management",
    desc: "Internal wikis, documentation portals, and knowledge sharing platforms for teams.",
  },
  {
    icon: Flag,
    title: "Feature Flag Management",
    desc: "Progressive rollout systems for safe feature deployment and A/B testing at scale.",
  },
  {
    icon: Bell,
    title: "Push Notification Systems",
    desc: "Multi-channel notification infrastructure for mobile, web, email, and SMS alerts.",
  },
  {
    icon: Send,
    title: "Marketing Automation",
    desc: "End-to-end marketing automation with lead scoring, nurture sequences, and analytics.",
  },
  {
    icon: Download,
    title: "ETL & Data Pipelines",
    desc: "Automated data extraction, transformation, and loading pipelines for analytics workflows.",
  },
  {
    icon: Upload,
    title: "Cloud Migration Services",
    desc: "Seamless migration of on-premise infrastructure to cloud with zero downtime strategy.",
  },
  {
    icon: RefreshCw,
    title: "Legacy System Modernization",
    desc: "Transform outdated legacy systems into modern, scalable, and maintainable architectures.",
  },
  {
    icon: RotateCcw,
    title: "Disaster Recovery Planning",
    desc: "Business continuity and disaster recovery solutions with automated failover and backups.",
  },
  {
    icon: Repeat,
    title: "Subscription & Billing Mgmt",
    desc: "Recurring billing platforms with usage-based pricing, invoicing, and revenue recognition.",
  },
  {
    icon: Shuffle,
    title: "A/B Testing & Experimentation",
    desc: "Scientific experimentation platforms for optimizing conversion rates and user engagement.",
  },
  {
    icon: Maximize,
    title: "Scalability Architecture",
    desc: "Design and implement horizontally scalable systems that grow with your user base.",
  },
  {
    icon: Minimize,
    title: "Cost Optimization",
    desc: "Cloud cost analysis, resource right-sizing, and infrastructure spend optimization.",
  },
  {
    icon: Grid,
    title: "Microservices Architecture",
    desc: "Decompose monolithic applications into scalable, independently deployable microservices.",
  },
  {
    icon: List,
    title: "Project Management Tools",
    desc: "Custom project management platforms with task tracking, timelines, and team collaboration.",
  },
  {
    icon: AlignCenter,
    title: "CMS Development",
    desc: "Custom content management systems with flexible authoring, versioning, and publishing.",
  },
  {
    icon: Bold,
    title: "Digital PR & Outreach",
    desc: "Strategic digital PR campaigns with media outreach, press releases, and influencer partnerships.",
  },
  {
    icon: Rocket,
    title: "Startup Tech Advisory",
    desc: "Technical advisory for startups including architecture review, tech stack selection, and CTO-as-a-service.",
  },
  {
    icon: TrendingUp,
    title: "Conversion Rate Optimization",
    desc: "Systematic analysis and optimization of user funnels to maximize conversion rates.",
  },
  {
    icon: Users,
    title: "HR Tech Solutions",
    desc: "Employee management platforms with recruitment, onboarding, payroll, and performance tracking.",
  },
  {
    icon: DollarSign,
    title: "FinTech Solutions",
    desc: "Financial technology platforms including neobanking, lending, and wealth management systems.",
  },
  {
    icon: Globe,
    title: "Localization & Translation",
    desc: "Multi-language support with professional translation, cultural adaptation, and i18n implementation.",
  },
  {
    icon: Shield,
    title: "Blockchain & Web3",
    desc: "Decentralized applications, smart contracts, NFT platforms, and blockchain integration services.",
  },
];

/* ============================================================
 * Admin catalog view of the same services (Services Desk)
 * Single source of truth: `allServices` above. Admin-only
 * operational fields are derived deterministically so the
 * landing page and the admin desk never drift apart.
 * ============================================================ */

export type SDCategory = "Design" | "Video Editing" | "Development" | "Marketing" | "Writing";

export interface SDService {
  id: string;
  name: string;
  category: SDCategory;
  subcategory: string;
  status: "Active" | "Inactive";
  visibility: "Public" | "Hidden";
  activeOrders: number;
  demand: "Growing" | "Stable" | "Declining";
  shortDesc: string;
  fullDesc: string;
}

const CATEGORY_RULES: { category: SDCategory; subcategory: string; match: RegExp }[] = [
  { category: "Video Editing", subcategory: "Short Form", match: /reel|short|tiktok/i },
  { category: "Video Editing", subcategory: "YouTube", match: /youtube/i },
  { category: "Video Editing", subcategory: "Ads", match: /ad creative|advertis/i },
  {
    category: "Video Editing",
    subcategory: "Long Form",
    match: /video|motion|animation|film|3d|vfx|podcast|audio|voice|sound|music/i,
  },
  { category: "Design", subcategory: "Logo Design", match: /logo/i },
  { category: "Design", subcategory: "Brand Identity", match: /brand|packaging|print/i },
  { category: "Design", subcategory: "Illustration", match: /illustrat|graphic|art|3d model/i },
  {
    category: "Design",
    subcategory: "UI/UX Design",
    match: /ui\/ux|ux|ui |design system|prototyp|wireframe|design/i,
  },
  { category: "Marketing", subcategory: "SEO", match: /seo|search engine|rank/i },
  { category: "Marketing", subcategory: "Social Media", match: /social|community|influencer/i },
  { category: "Marketing", subcategory: "Paid Ads", match: /ads|ppc|campaign|growth|conversion/i },
  {
    category: "Marketing",
    subcategory: "Email Marketing",
    match: /email|newsletter|crm|lifecycle/i,
  },
  { category: "Marketing", subcategory: "Paid Ads", match: /marketing|analytics|market research/i },
  { category: "Writing", subcategory: "Blog Writing", match: /blog|article|content writing/i },
  { category: "Writing", subcategory: "Copywriting", match: /copy|localization|translation/i },
  {
    category: "Writing",
    subcategory: "Technical Writing",
    match: /technical writing|documentation|whitepaper|resume|proposal/i,
  },
  { category: "Writing", subcategory: "Scripts", match: /script|storyboard|screenplay/i },
  { category: "Development", subcategory: "Mobile App", match: /mobile|ios|android|app dev/i },
  {
    category: "Development",
    subcategory: "E-Commerce",
    match: /e-commerce|ecommerce|shopify|marketplace|payment/i,
  },
  {
    category: "Development",
    subcategory: "Backend / API",
    match:
      /api|backend|server|database|cloud|devops|infrastructure|migration|integration|microservice|security|blockchain|ai|machine learning|data|automation|qa|testing/i,
  },
  {
    category: "Development",
    subcategory: "Website",
    match: /website|web|landing|cms|wordpress|saas|portal|platform/i,
  },
];

export const classifyService = (
  title: string,
  desc: string,
): { category: SDCategory; subcategory: string } => {
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(title)) return { category: rule.category, subcategory: rule.subcategory };
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(desc)) return { category: rule.category, subcategory: rule.subcategory };
  }
  return { category: "Development", subcategory: "Website" };
};

const shorten = (desc: string) => {
  const firstClause = desc.split(/[,.]/)[0].trim();
  return firstClause.length > 58 ? `${firstClause.slice(0, 55).trim()}…` : `${firstClause}.`;
};

const DEMANDS: SDService["demand"][] = ["Growing", "Stable", "Growing", "Stable", "Declining"];

export const SD_SERVICES: SDService[] = allServices.map((service, i) => {
  const { category, subcategory } = classifyService(service.title, service.desc);
  return {
    id: `SRV-${1001 + i}`,
    name: service.title,
    category,
    subcategory,
    status: i % 17 === 16 ? "Inactive" : "Active",
    visibility: i % 23 === 22 ? "Hidden" : "Public",
    activeOrders: Math.max(0, 148 - i * 2 - ((i * 7) % 19)),
    demand: DEMANDS[i % DEMANDS.length],
    shortDesc: shorten(service.desc),
    fullDesc: service.desc,
  };
});

const CATEGORY_ORDER: SDCategory[] = [
  "Design",
  "Video Editing",
  "Development",
  "Marketing",
  "Writing",
];

export const SD_CATEGORIES: { name: SDCategory; subs: string[] }[] = CATEGORY_ORDER.map((name) => ({
  name,
  subs: Array.from(
    new Set(SD_SERVICES.filter((s) => s.category === name).map((s) => s.subcategory)),
  ),
}));

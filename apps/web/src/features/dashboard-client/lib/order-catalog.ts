/**
 * Jobrio — Client Order Creation catalog.
 *
 * Architecture: Category → Service → Dynamic Service Requirements.
 * No subcategory layer, no generic 30-field form. Every service declares its
 * own requirement fields, recommended deliverables and SLA so the wizard can
 * render only what is relevant for the selected service.
 *
 * The catalog itself is built live from the shared service registry
 * (`@jobrio/constants`) — the same registry that backs the Services Desk and
 * the landing Services page — so every service that exists anywhere in the
 * platform is orderable here, grouped by its category. Services that match
 * one of the original hand-curated definitions keep their detailed,
 * service-specific requirement form; every other service gets a generic
 * (but complete) requirement form so nothing is ever left un-orderable.
 */

import {
  getServiceRegistrySnapshot,
  subscribeServiceRegistry,
  type RegisteredService,
  type SDCategory,
} from "@jobrio/constants";

export type RequirementFieldType = "text" | "textarea" | "select" | "multiselect" | "number";

export interface RequirementField {
  id: string;
  label: string;
  type: RequirementFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  hint?: string;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  /** Standard delivery SLA in days, used to validate the requested date. */
  slaDays: number;
  /** Service-specific requirement questions (step 3). */
  requirements: RequirementField[];
  /** Jobrio recommended deliverables (step 5). */
  deliverables: string[];
  /** Versioning captured automatically in the backend snapshot. */
  serviceVersion: string;
  pricingVersion: string;
  slaVersion: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: ServiceDefinition[];
}

const v = { serviceVersion: "v1", pricingVersion: "v1", slaVersion: "v1" };

/** Hand-curated, rich per-service catalog — the original 13 services with
 *  detailed requirement forms. Used as the template for any live service
 *  whose name matches one of these; everything else gets the generic
 *  requirement form built below. */
const CURATED_CATALOG: CategoryDefinition[] = [
  {
    id: "design",
    name: "Design",
    description: "Brand, product and marketing design work.",
    icon: "palette",
    services: [
      {
        id: "logo-design",
        name: "Logo Design",
        slaDays: 5,
        ...v,
        requirements: [
          {
            id: "brandName",
            label: "Brand Name",
            type: "text",
            required: true,
            placeholder: "ABC Restaurant",
          },
          {
            id: "businessDescription",
            label: "Business Description",
            type: "textarea",
            required: true,
            placeholder: "What does your business do?",
          },
          {
            id: "logoPurpose",
            label: "Logo kis purpose ke liye hai?",
            type: "select",
            required: true,
            options: [
              "New brand launch",
              "Rebranding",
              "Sub-brand / product line",
              "Social media presence",
              "Packaging & print",
            ],
          },
          {
            id: "preferredStyle",
            label: "Preferred Style",
            type: "multiselect",
            required: true,
            options: [
              "Minimal",
              "Modern",
              "Premium / Luxury",
              "Playful",
              "Classic",
              "Handmade",
              "Geometric",
            ],
          },
          {
            id: "preferredColors",
            label: "Preferred Colors",
            type: "text",
            required: false,
            placeholder: "e.g. deep green + gold, or 'open to suggestions'",
          },
          {
            id: "targetAudience",
            label: "Target Audience",
            type: "text",
            required: true,
            placeholder: "Who are your customers?",
          },
          {
            id: "existingLogo",
            label: "Existing Logo, if any",
            type: "select",
            required: false,
            options: ["No existing logo", "Yes — needs refresh", "Yes — full redesign"],
          },
          {
            id: "inspiration",
            label: "Reference / Inspiration",
            type: "textarea",
            required: false,
            placeholder: "Brands or logos you admire and why",
          },
          {
            id: "requiredDeliverablesNote",
            label: "Required Deliverables (notes)",
            type: "textarea",
            required: false,
            placeholder: "Anything specific about formats or usage",
          },
        ],
        deliverables: [
          "Primary Logo",
          "Transparent PNG",
          "Source File",
          "Black & White Version",
          "Favicon / App Icon",
          "Brand Usage Guide",
        ],
      },
      {
        id: "social-media-design",
        name: "Social Media Design",
        slaDays: 4,
        ...v,
        requirements: [
          { id: "brandName", label: "Brand Name", type: "text", required: true },
          {
            id: "platforms",
            label: "Platforms",
            type: "multiselect",
            required: true,
            options: ["Instagram", "LinkedIn", "Facebook", "X (Twitter)", "YouTube", "Pinterest"],
          },
          {
            id: "postCount",
            label: "Number of posts required",
            type: "number",
            required: true,
            placeholder: "10",
          },
          {
            id: "contentTheme",
            label: "Content theme / campaign",
            type: "textarea",
            required: true,
          },
          {
            id: "brandAssets",
            label: "Brand assets available?",
            type: "select",
            required: true,
            options: ["Full brand kit", "Logo only", "Nothing yet"],
          },
          { id: "inspiration", label: "Reference / Inspiration", type: "textarea" },
        ],
        deliverables: [
          "Post Designs (PNG/JPG)",
          "Story Variants",
          "Source Files",
          "Editable Templates",
        ],
      },
      {
        id: "banner-design",
        name: "Banner Design",
        slaDays: 3,
        ...v,
        requirements: [
          { id: "brandName", label: "Brand Name", type: "text", required: true },
          {
            id: "bannerPlacement",
            label: "Where will the banner be used?",
            type: "multiselect",
            required: true,
            options: ["Website hero", "Google Ads", "Meta Ads", "Print / Flex", "Email header"],
          },
          {
            id: "sizes",
            label: "Required sizes",
            type: "text",
            required: true,
            placeholder: "1920x600, 1080x1080",
          },
          { id: "headline", label: "Headline / copy", type: "textarea", required: true },
          { id: "inspiration", label: "Reference / Inspiration", type: "textarea" },
        ],
        deliverables: [
          "Banner Set (Web)",
          "Source File",
          "Retina Export",
          "Static + Animated Variant",
        ],
      },
      {
        id: "presentation-design",
        name: "Presentation Design",
        slaDays: 5,
        ...v,
        requirements: [
          {
            id: "deckPurpose",
            label: "Deck purpose",
            type: "select",
            required: true,
            options: [
              "Investor pitch",
              "Sales deck",
              "Internal report",
              "Conference talk",
              "Training",
            ],
          },
          {
            id: "slideCount",
            label: "Approximate slide count",
            type: "number",
            required: true,
            placeholder: "18",
          },
          {
            id: "contentReady",
            label: "Content available hai ya nahi?",
            type: "select",
            required: true,
            options: ["Yes — final copy ready", "Partially ready", "No — need help writing"],
          },
          {
            id: "toolPreference",
            label: "Preferred tool",
            type: "select",
            required: true,
            options: ["PowerPoint", "Google Slides", "Keynote", "Figma / PDF"],
          },
          { id: "inspiration", label: "Reference / Inspiration", type: "textarea" },
        ],
        deliverables: ["Designed Deck", "Editable Source", "PDF Export", "Icon & Chart Library"],
      },
      {
        id: "ui-ux-design",
        name: "UI/UX Design",
        slaDays: 10,
        ...v,
        requirements: [
          {
            id: "productType",
            label: "Product type",
            type: "select",
            required: true,
            options: ["Web app", "Mobile app", "Website", "Dashboard", "Design system"],
          },
          {
            id: "screens",
            label: "Number of screens",
            type: "number",
            required: true,
            placeholder: "12",
          },
          { id: "userFlows", label: "Key user flows", type: "textarea", required: true },
          {
            id: "existingProduct",
            label: "Existing product?",
            type: "select",
            required: true,
            options: ["New product", "Redesign of existing", "Adding new module"],
          },
          {
            id: "designSystem",
            label: "Design system required?",
            type: "select",
            options: ["Yes", "No", "Not sure"],
          },
          { id: "inspiration", label: "Reference / Inspiration", type: "textarea" },
        ],
        deliverables: [
          "Wireframes",
          "High-Fidelity UI",
          "Prototype",
          "Figma Source",
          "Design System / Components",
        ],
      },
    ],
  },
  {
    id: "development",
    name: "Development",
    description: "Websites, apps and technical builds.",
    icon: "code",
    services: [
      {
        id: "website-development",
        name: "Website Development",
        slaDays: 14,
        ...v,
        requirements: [
          {
            id: "websiteType",
            label: "Website kis type ki hai?",
            type: "select",
            required: true,
            options: [
              "Business / Corporate",
              "E-commerce",
              "Portfolio",
              "Landing page",
              "Blog / Publication",
              "Web application",
            ],
          },
          { id: "websitePurpose", label: "Website ka purpose", type: "textarea", required: true },
          {
            id: "pages",
            label: "Required pages",
            type: "multiselect",
            required: true,
            options: [
              "Home",
              "About",
              "Services",
              "Pricing",
              "Blog",
              "Contact",
              "Careers",
              "Custom pages",
            ],
          },
          {
            id: "features",
            label: "Required features",
            type: "multiselect",
            required: true,
            options: [
              "Contact forms",
              "Booking",
              "Payments",
              "User accounts",
              "Multi-language",
              "Blog CMS",
              "Live chat",
              "Analytics",
            ],
          },
          {
            id: "existingWebsite",
            label: "Existing website, if any",
            type: "text",
            placeholder: "https://",
          },
          {
            id: "integrations",
            label: "Required integrations",
            type: "multiselect",
            options: [
              "Stripe / Payments",
              "CRM",
              "Email marketing",
              "WhatsApp",
              "Google Analytics",
              "ERP",
              "None",
            ],
          },
          {
            id: "contentReady",
            label: "Content available hai ya nahi?",
            type: "select",
            required: true,
            options: ["Yes — ready", "Partially ready", "No — need copywriting"],
          },
          {
            id: "referenceWebsites",
            label: "Reference websites",
            type: "textarea",
            placeholder: "One URL per line",
          },
        ],
        deliverables: [
          "Deployed Website",
          "Source Code Repository",
          "CMS Access",
          "Responsive QA Report",
          "Basic SEO Setup",
        ],
      },
      {
        id: "mobile-app-development",
        name: "Mobile App Development",
        slaDays: 21,
        ...v,
        requirements: [
          {
            id: "platforms",
            label: "Platforms",
            type: "multiselect",
            required: true,
            options: ["iOS", "Android", "Cross-platform"],
          },
          { id: "appPurpose", label: "App ka purpose", type: "textarea", required: true },
          {
            id: "features",
            label: "Required features",
            type: "multiselect",
            required: true,
            options: [
              "Auth / login",
              "Payments",
              "Push notifications",
              "Chat",
              "Maps",
              "Offline mode",
              "Admin panel",
            ],
          },
          {
            id: "designReady",
            label: "Design ready hai?",
            type: "select",
            required: true,
            options: ["Yes — Figma ready", "Partially", "No — needs design"],
          },
          {
            id: "backendNeeded",
            label: "Backend required?",
            type: "select",
            required: true,
            options: ["Yes — build new", "Existing backend", "Not sure"],
          },
          { id: "referenceApps", label: "Reference apps", type: "textarea" },
        ],
        deliverables: [
          "Build (APK / TestFlight)",
          "Source Code",
          "Store Listing Assets",
          "Release Documentation",
        ],
      },
      {
        id: "api-integration",
        name: "API & Integrations",
        slaDays: 7,
        ...v,
        requirements: [
          { id: "systems", label: "Systems to integrate", type: "textarea", required: true },
          {
            id: "direction",
            label: "Data direction",
            type: "select",
            required: true,
            options: ["One-way sync", "Two-way sync", "Webhook events only"],
          },
          {
            id: "docsAvailable",
            label: "API documentation available?",
            type: "select",
            required: true,
            options: ["Yes", "Partially", "No"],
          },
          {
            id: "volume",
            label: "Expected request volume",
            type: "text",
            placeholder: "e.g. 10k/day",
          },
        ],
        deliverables: [
          "Integration Code",
          "Environment Config",
          "Test Suite",
          "Integration Documentation",
        ],
      },
    ],
  },
  {
    id: "video",
    name: "Video",
    description: "Editing, motion graphics and production.",
    icon: "movie",
    services: [
      {
        id: "video-editing",
        name: "Video Editing",
        slaDays: 4,
        ...v,
        requirements: [
          {
            id: "videoType",
            label: "Video type",
            type: "select",
            required: true,
            options: [
              "Reel / Short",
              "YouTube long-form",
              "Ad / Commercial",
              "Corporate",
              "Event recap",
              "Podcast",
            ],
          },
          {
            id: "duration",
            label: "Approximate duration",
            type: "text",
            required: true,
            placeholder: "e.g. 60 seconds",
          },
          {
            id: "platform",
            label: "Platform",
            type: "multiselect",
            required: true,
            options: ["Instagram", "YouTube", "TikTok", "LinkedIn", "Website", "TV / Broadcast"],
          },
          {
            id: "aspectRatio",
            label: "Aspect ratio",
            type: "select",
            required: true,
            options: ["16:9", "9:16", "1:1", "4:5", "21:9"],
          },
          {
            id: "resolution",
            label: "Required resolution",
            type: "select",
            required: true,
            options: ["1080p", "2K", "4K"],
          },
          {
            id: "editingStyle",
            label: "Editing style",
            type: "multiselect",
            required: true,
            options: [
              "Fast-paced",
              "Cinematic",
              "Documentary",
              "Talking head",
              "Motion-graphics heavy",
              "Minimal cuts",
            ],
          },
          {
            id: "rawFootage",
            label: "Raw footage available",
            type: "select",
            required: true,
            options: ["Yes — uploaded", "Yes — will share link", "No — need stock footage"],
          },
          {
            id: "referenceVideo",
            label: "Reference video",
            type: "textarea",
            placeholder: "Links to videos you like",
          },
        ],
        deliverables: [
          "Final Edited Video",
          "Vertical Cut",
          "Thumbnail Frame",
          "Project File",
          "Subtitles / SRT",
        ],
      },
      {
        id: "motion-graphics",
        name: "Motion Graphics",
        slaDays: 6,
        ...v,
        requirements: [
          {
            id: "animationType",
            label: "Animation type",
            type: "select",
            required: true,
            options: [
              "Logo animation",
              "Explainer",
              "Lower thirds",
              "Product animation",
              "Kinetic typography",
            ],
          },
          { id: "duration", label: "Approximate duration", type: "text", required: true },
          {
            id: "scriptReady",
            label: "Script / storyboard ready?",
            type: "select",
            required: true,
            options: ["Yes", "Partially", "No"],
          },
          {
            id: "brandAssets",
            label: "Brand assets available?",
            type: "select",
            required: true,
            options: ["Full brand kit", "Logo only", "Nothing yet"],
          },
          { id: "referenceVideo", label: "Reference video", type: "textarea" },
        ],
        deliverables: ["Animated Video", "Transparent Render", "Source Project", "Sound Design"],
      },
    ],
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    description: "Performance, SEO and lifecycle marketing.",
    icon: "campaign",
    services: [
      {
        id: "seo",
        name: "SEO",
        slaDays: 10,
        ...v,
        requirements: [
          {
            id: "websiteUrl",
            label: "Website URL",
            type: "text",
            required: true,
            placeholder: "https://",
          },
          {
            id: "targetMarkets",
            label: "Target markets / geographies",
            type: "text",
            required: true,
          },
          { id: "targetKeywords", label: "Target keywords", type: "textarea", required: true },
          {
            id: "currentRankings",
            label: "Current rankings known?",
            type: "select",
            required: true,
            options: ["Yes — will share", "No — need audit"],
          },
          { id: "competitors", label: "Competitors", type: "textarea" },
        ],
        deliverables: [
          "SEO Audit",
          "Keyword Map",
          "On-page Fixes",
          "Content Plan",
          "Monthly Report",
        ],
      },
      {
        id: "paid-ads",
        name: "Paid Ads Management",
        slaDays: 7,
        ...v,
        requirements: [
          {
            id: "channels",
            label: "Channels",
            type: "multiselect",
            required: true,
            options: ["Google Ads", "Meta Ads", "LinkedIn Ads", "YouTube", "Programmatic"],
          },
          {
            id: "monthlyBudget",
            label: "Monthly ad budget",
            type: "text",
            required: true,
            placeholder: "e.g. $2,000",
          },
          {
            id: "campaignGoal",
            label: "Campaign goal",
            type: "select",
            required: true,
            options: ["Leads", "Sales", "App installs", "Awareness", "Retargeting"],
          },
          {
            id: "creativesReady",
            label: "Creatives ready?",
            type: "select",
            required: true,
            options: ["Yes", "Partially", "No — need creatives"],
          },
          {
            id: "trackingSetup",
            label: "Conversion tracking set up?",
            type: "select",
            required: true,
            options: ["Yes", "No", "Not sure"],
          },
        ],
        deliverables: [
          "Campaign Setup",
          "Ad Creatives",
          "Tracking Configuration",
          "Performance Dashboard",
        ],
      },
    ],
  },
  {
    id: "writing",
    name: "Writing",
    description: "Content, copy and documentation.",
    icon: "edit_note",
    services: [
      {
        id: "content-writing",
        name: "Content Writing",
        slaDays: 5,
        ...v,
        requirements: [
          {
            id: "contentType",
            label: "Content type",
            type: "select",
            required: true,
            options: [
              "Blog articles",
              "Website copy",
              "Product descriptions",
              "Newsletter",
              "Whitepaper",
            ],
          },
          {
            id: "wordCount",
            label: "Approximate word count",
            type: "number",
            required: true,
            placeholder: "1200",
          },
          { id: "topics", label: "Topics / titles", type: "textarea", required: true },
          {
            id: "tone",
            label: "Tone of voice",
            type: "multiselect",
            required: true,
            options: ["Professional", "Conversational", "Technical", "Persuasive", "Playful"],
          },
          {
            id: "seoRequired",
            label: "SEO optimisation required?",
            type: "select",
            required: true,
            options: ["Yes", "No"],
          },
          { id: "references", label: "Reference content", type: "textarea" },
        ],
        deliverables: [
          "Final Draft (Doc)",
          "SEO Meta Titles & Descriptions",
          "Plagiarism Report",
          "One Revision Round",
        ],
      },
      {
        id: "technical-documentation",
        name: "Technical Documentation",
        slaDays: 8,
        ...v,
        requirements: [
          {
            id: "docType",
            label: "Documentation type",
            type: "select",
            required: true,
            options: ["API reference", "User guide", "Onboarding docs", "Internal runbook"],
          },
          {
            id: "audience",
            label: "Audience",
            type: "select",
            required: true,
            options: ["Developers", "End users", "Internal team", "Support agents"],
          },
          {
            id: "sourceMaterial",
            label: "Source material available?",
            type: "select",
            required: true,
            options: ["Yes — complete", "Partially", "No — needs discovery"],
          },
          { id: "scope", label: "Scope / modules to cover", type: "textarea", required: true },
        ],
        deliverables: [
          "Structured Documentation",
          "Diagrams",
          "Publishable Markdown/HTML",
          "Maintenance Guide",
        ],
      },
    ],
  },
];

/* ============================================================
 * Live catalog — built from the shared service registry.
 *
 * Every category grouping mirrors the Services Desk taxonomy exactly
 * (Design / Development / Video Editing / Marketing / Writing) so a
 * service filed under a category in the Services Desk lands in the same
 * category here.
 * ============================================================ */

/** Flatten the curated catalog into a name → definition lookup so any live
 *  service with a matching title reuses its detailed requirement form. */
const CURATED_BY_NAME = new Map<string, ServiceDefinition>();
for (const cat of CURATED_CATALOG) {
  for (const svc of cat.services) {
    CURATED_BY_NAME.set(svc.name.trim().toLowerCase(), svc);
  }
}

/** Category shell (id/name/description/icon) per Services Desk category —
 *  identical ids to the original curated catalog so any previously-saved
 *  draft/order categoryId keeps resolving correctly. */
const CATEGORY_META: Record<
  SDCategory,
  { id: string; name: string; description: string; icon: string }
> = {
  Design: {
    id: "design",
    name: "Design",
    description: "Brand, product and marketing design work.",
    icon: "palette",
  },
  Development: {
    id: "development",
    name: "Development",
    description: "Websites, apps and technical builds.",
    icon: "code",
  },
  "Video Editing": {
    id: "video",
    name: "Video",
    description: "Editing, motion graphics and production.",
    icon: "movie",
  },
  Marketing: {
    id: "digital-marketing",
    name: "Digital Marketing",
    description: "Performance, SEO and lifecycle marketing.",
    icon: "campaign",
  },
  Writing: {
    id: "writing",
    name: "Writing",
    description: "Content, copy and documentation.",
    icon: "edit_note",
  },
};

const CATEGORY_ORDER: SDCategory[] = [
  "Design",
  "Development",
  "Video Editing",
  "Marketing",
  "Writing",
];

/** Generic — but complete — requirement form for any service that doesn't
 *  have a hand-curated one, so every service in the registry is orderable. */
const genericServiceDefinition = (svc: RegisteredService): ServiceDefinition => ({
  id: svc.id.toLowerCase(),
  name: svc.title,
  slaDays: 7,
  ...v,
  requirements: [
    {
      id: "projectBrief",
      label: "Project Brief",
      type: "textarea",
      required: true,
      placeholder: "Describe exactly what you need, scope and any constraints.",
    },
    {
      id: "references",
      label: "Reference / Inspiration",
      type: "textarea",
      required: false,
      placeholder: "Links or examples you'd like us to match or avoid.",
    },
    {
      id: "timelinePreference",
      label: "Preferred Timeline",
      type: "select",
      required: true,
      options: ["Standard", "Urgent (rush fee may apply)", "Flexible"],
    },
    {
      id: "additionalNotes",
      label: "Additional Notes",
      type: "textarea",
      required: false,
    },
  ],
  deliverables: ["Final Deliverable Files", "Source Files", "One Revision Round"],
});

const toServiceDefinition = (svc: RegisteredService): ServiceDefinition => {
  const curated = CURATED_BY_NAME.get(svc.title.trim().toLowerCase());
  if (curated) return { ...curated, id: svc.id.toLowerCase(), name: svc.title };
  return genericServiceDefinition(svc);
};

const buildOrderCatalog = (): CategoryDefinition[] => {
  const services = getServiceRegistrySnapshot();
  const byCategory: Record<SDCategory, ServiceDefinition[]> = {
    Design: [],
    Development: [],
    "Video Editing": [],
    Marketing: [],
    Writing: [],
  };
  for (const svc of services) {
    byCategory[svc.category].push(toServiceDefinition(svc));
  }
  return CATEGORY_ORDER.map((cat) => ({ ...CATEGORY_META[cat], services: byCategory[cat] }));
};

/** Every service that exists anywhere in the platform, grouped by category —
 *  stays in sync with the Services Desk and the landing Services page.
 *  Kept as a stable array reference (mutated in place on refresh) so
 *  existing `ORDER_CATALOG.map(...)` call sites keep working unchanged. */
export const ORDER_CATALOG: CategoryDefinition[] = buildOrderCatalog();

const refreshOrderCatalog = () => {
  const next = buildOrderCatalog();
  ORDER_CATALOG.length = 0;
  ORDER_CATALOG.push(...next);
};

subscribeServiceRegistry(refreshOrderCatalog);

/** Subscribe a component to catalog changes (new services from Services
 *  Desk) so it can force a re-render; `ORDER_CATALOG` itself is always kept
 *  fresh via the registry subscription above. */
export const subscribeOrderCatalog = subscribeServiceRegistry;

export const findCategory = (id?: string) => ORDER_CATALOG.find((c) => c.id === id);
export const findService = (categoryId?: string, serviceId?: string) =>
  findCategory(categoryId)?.services.find((s) => s.id === serviceId);

/** Standard delivery date for a service, based on its configured SLA. */
export const standardDeliveryDate = (slaDays: number, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + slaDays);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (isoDate: string, from = new Date()) => {
  const target = new Date(`${isoDate}T00:00:00`);
  const start = new Date(from.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
};

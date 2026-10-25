import {
  ArrowRight,
  TrendingUp,
  Users,
  Briefcase,
  Star,
  BarChart3,
  Zap,
  Activity,
  MapPin,
  DollarSign,
  Layers,
  Brain,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "@/lib/react-router-dom";
import { useState, useEffect, type ComponentType } from "react";

const allSections = [
  {
    title: "Platform Overview",
    icon: Briefcase,
    items: [
      { label: "Projects Completed", value: "12,540+", color: "primary" },
      { label: "Active Professionals", value: "3,200+", color: "tertiary" },
      { label: "Happy Clients", value: "8,900+", color: "tertiary-container" },
      { label: "Earnings Paid", value: "₹10.6M+", color: "primary-container" },
    ],
  },
  {
    title: "Performance Metrics",
    icon: Activity,
    items: [
      { label: "Avg Delivery Time", value: "2.4 Days", color: "primary", pct: 34 },
      { label: "On-Time Delivery", value: "96.8%", color: "tertiary", pct: 97 },
      { label: "Client Satisfaction", value: "98.2%", color: "tertiary-container", pct: 98 },
      { label: "Rework Rate", value: "1.8%", color: "primary", pct: 2 },
    ],
  },
  {
    title: "Category-wise Work",
    icon: Layers,
    items: [
      { label: "Design", value: "32%", color: "primary", pct: 32 },
      { label: "Development", value: "38%", color: "tertiary", pct: 38 },
      { label: "Marketing", value: "18%", color: "tertiary-container", pct: 18 },
      { label: "Writing", value: "12%", color: "primary-container", pct: 12 },
    ],
  },
  {
    title: "Top Skills in Demand",
    icon: Zap,
    items: [
      { label: "UI/UX Design", value: "92%", color: "tertiary", pct: 92 },
      { label: "Web Development", value: "88%", color: "tertiary", pct: 88 },
      { label: "Video Editing", value: "76%", color: "primary", pct: 76 },
      { label: "Mobile App Dev", value: "72%", color: "primary", pct: 72 },
      { label: "SEO Optimization", value: "65%", color: "tertiary-container", pct: 65 },
      { label: "Content Writing", value: "58%", color: "primary-container", pct: 58 },
    ],
  },
  {
    title: "Earnings Insights",
    icon: DollarSign,
    items: [
      { label: "Avg Earning / Project", value: "₹850", color: "primary" },
      { label: "Highest Category", value: "Development", color: "tertiary" },
      { label: "Quarterly Growth", value: "+32%", color: "tertiary-container" },
    ],
  },
  {
    title: "Growth Graph",
    icon: TrendingUp,
    graph: true,
    items: [],
  },
  {
    title: "AI Insights",
    icon: Brain,
    gradient: true,
    items: [
      {
        label: "Most demand is in UI/UX this month — up 24%",
        value: "",
        color: "tertiary",
        icon: Brain,
      },
      {
        label: "Projects increased 32% in last 30 days",
        value: "",
        color: "tertiary",
        icon: TrendingUp,
      },
      {
        label: "Evening orders (6–10 PM) highest converting",
        value: "",
        color: "tertiary",
        icon: Clock,
      },
      { label: "Client retention is 87.3%", value: "", color: "tertiary", icon: Star },
    ],
  },
  {
    title: "Location Insights",
    icon: MapPin,
    items: [
      { label: "Mumbai", value: "2,840", color: "primary" },
      { label: "Delhi NCR", value: "2,210", color: "tertiary" },
      { label: "Bangalore", value: "1,950", color: "tertiary-container" },
      { label: "Hyderabad", value: "1,420", color: "primary-container" },
      { label: "Pune", value: "1,180", color: "primary" },
      { label: "Chennai", value: "980", color: "tertiary" },
    ],
  },
  {
    title: "Live Activity Feed",
    icon: CheckCircle,
    live: true,
    items: [],
  },
];

const liveActivities = [
  "Ravi hired a UI/UX designer",
  "Project completed in 2 hours",
  "Priya joined as a Video Editor",
  "New project posted: Landing Page",
  "Arjun delivered a mobile app",
];

const MiniProgress = ({ color, value }: { color: string; value: number }) => (
  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
    <div
      className="h-full rounded-full"
      style={{ width: `${value}%`, backgroundColor: `hsl(var(--${color}))` }}
    />
  </div>
);

const MiniLine = ({ color }: { color: string }) => (
  <svg className="w-full h-10" preserveAspectRatio="none" viewBox="0 0 100 40">
    <path
      d="M0 36 Q 20 28, 40 22 T 70 12 T 100 4"
      fill="none"
      stroke={`hsl(var(--${color}))`}
      strokeWidth="2.5"
    />
    <path
      d="M0 36 Q 20 28, 40 22 T 70 12 T 100 4 V 40 H 0 Z"
      fill={`hsl(var(--${color}))`}
      opacity="0.08"
    />
  </svg>
);

const MiniBar = ({ color }: { color: string }) => (
  <div className="h-10 w-full flex items-end gap-1">
    {[25, 40, 55, 70, 85, 100].map((h, i) => (
      <div
        key={i}
        className="w-full rounded-sm"
        style={{ height: `${h}%`, backgroundColor: `hsl(var(--${color}) / ${0.2 + i * 0.13})` }}
      />
    ))}
  </div>
);

/* Renders items in a 2-column, 2-row grid (max 4 visible), scrollable */
const TwoRowGrid = ({
  items,
  section,
}: {
  items: (typeof allSections)[0]["items"];
  section: (typeof allSections)[0];
}) => {
  // Split items into pairs of 4 (2x2 blocks)
  const chunks: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += 4) {
    chunks.push(items.slice(i, i + 4));
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
      {chunks.map((chunk, ci) => (
        <div
          key={ci}
          className="grid grid-cols-2 grid-rows-2 gap-2 min-w-[320px] snap-start shrink-0"
        >
          {chunk.map((item) => (
            <div
              key={item.label}
              className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20"
            >
              <div className="text-secondary font-bold text-[8px] uppercase tracking-widest mb-1">
                {item.label}
              </div>
              <div
                className="text-lg font-black mb-2"
                style={{ color: `hsl(var(--${item.color}))` }}
              >
                {item.value}
              </div>
              {(item as { pct?: number }).pct !== undefined ? (
                <MiniProgress color={item.color} value={(item as { pct: number }).pct} />
              ) : section.title === "Location Insights" ? (
                <MiniBar color={item.color} />
              ) : (
                <MiniLine color={item.color} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const AnalyticsSection = () => {
  const navigate = useNavigate();
  const [activeActivity, setActiveActivity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivity((prev) => (prev + 1) % liveActivities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="analytics" className="px-8 md:px-20 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-left">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface mb-2">Our Analytics</h2>
          <p className="text-on-surface-variant text-lg">
            Real-time performance metrics of the Jobrio ecosystem.
          </p>
        </div>
        <button
          onClick={() => navigate("/analytics")}
          className="px-2 py-3 font-headline font-bold text-primary hover:text-primary-container hover:scale-[1.04] active:scale-[0.95] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
        >
          Explore More <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>

      {/* All sections in one horizontal scrollable row */}
      <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
        {allSections.map((section) => (
          <div
            key={section.title}
            onClick={() => navigate("/analytics")}
            className="cursor-pointer group min-w-[340px] max-w-[380px] snap-start shrink-0"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              {section.live ? (
                <span className="relative flex h-3 w-3 shrink-0 ml-1 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
                </span>
              ) : (
                <span
                  className={`w-7 h-7 ${section.gradient ? "vision-gradient" : "primary-gradient"} rounded-lg flex items-center justify-center shrink-0`}
                >
                  <section.icon className="w-3.5 h-3.5 text-white" />
                </span>
              )}
              <h3 className="font-headline font-extrabold text-base text-on-surface">
                {section.title}
              </h3>
            </div>

            {/* Growth Graph */}
            {section.graph && (
              <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/20 group-hover:border-primary/30 transition-colors">
                <div className="flex flex-wrap gap-3 mb-3">
                  {[
                    { label: "Projects", color: "primary" },
                    { label: "Revenue", color: "tertiary" },
                    { label: "Users", color: "tertiary-container" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: `hsl(var(--${l.color}))` }}
                      />
                      <span className="text-[10px] font-bold text-secondary">{l.label}</span>
                    </div>
                  ))}
                </div>
                <svg className="w-full h-28" preserveAspectRatio="none" viewBox="0 0 400 120">
                  {[0, 30, 60, 90, 120].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="400"
                      y2={y}
                      stroke="hsl(var(--outline-variant))"
                      strokeWidth="0.5"
                      opacity="0.2"
                    />
                  ))}
                  <path
                    d="M0 105 Q50 95 100 80 T200 55 T300 30 T400 10"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M0 105 Q50 95 100 80 T200 55 T300 30 T400 10 V120 H0 Z"
                    fill="hsl(var(--primary))"
                    opacity="0.05"
                  />
                  <path
                    d="M0 110 Q50 100 100 88 T200 65 T300 40 T400 18"
                    fill="none"
                    stroke="hsl(var(--tertiary))"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M0 112 Q50 104 100 92 T200 72 T300 48 T400 24"
                    fill="none"
                    stroke="hsl(var(--tertiary-container))"
                    strokeWidth="2.5"
                  />
                </svg>
                <div className="flex justify-between text-[9px] text-on-surface-variant font-bold mt-1">
                  {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Live Activity Feed with blinking green dot */}
            {section.live && (
              <div className="bg-surface-container-low rounded-3xl border border-outline-variant/20 overflow-hidden group-hover:border-primary/30 transition-colors">
                {liveActivities.map((text, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-5 py-3 border-b border-outline-variant/10 transition-all duration-500 ${i === activeActivity ? "bg-primary/5" : ""}`}
                  >
                    <CheckCircle
                      className={`w-3.5 h-3.5 shrink-0 ${i === activeActivity ? "text-tertiary" : "text-on-surface-variant/40"}`}
                    />
                    <span
                      className={`text-xs font-medium ${i === activeActivity ? "text-on-surface" : "text-on-surface-variant"}`}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Insights — list items with per-item icon (matches Analytics page) */}
            {section.title === "AI Insights" && (
              <div className="grid grid-cols-1 gap-2">
                {section.items.map(
                  (item: { icon?: ComponentType<{ className?: string }>; label: string }, i) => {
                    const ItemIcon = item.icon || Brain;
                    return (
                      <div
                        key={i}
                        className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 flex items-start gap-3 group-hover:border-tertiary/30 transition-colors"
                      >
                        <div className="w-8 h-8 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary shrink-0">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed font-medium">
                          "{item.label}"
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            {/* Regular items: 2-column, 2-row grid */}
            {!section.graph && !section.live && section.title !== "AI Insights" && (
              <TwoRowGrid items={section.items} section={section} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AnalyticsSection;

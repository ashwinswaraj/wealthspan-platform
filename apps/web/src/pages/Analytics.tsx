import { Navbar, CTASection, Footer } from "@/features/marketing";
import { useSkeleton, AnalyticsBodySkeleton, FooterSkeleton } from "@jobrio/ui/design-system";
import { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Zap,
  BarChart3,
  Activity,
  CheckCircle,
  Brain,
  MapPin,
  Layers,
  DollarSign,
  Clock,
} from "lucide-react";

const liveActivities = [
  { text: "Ravi hired a UI/UX designer", time: "2 min ago" },
  { text: "Project completed in 2 hours", time: "5 min ago" },
  { text: "Priya joined as a Video Editor", time: "8 min ago" },
  { text: "New project posted: Landing Page", time: "12 min ago" },
  { text: "Arjun delivered a mobile app", time: "15 min ago" },
  { text: "Sneha hired a web developer", time: "18 min ago" },
  { text: "3 new professionals joined from Mumbai", time: "22 min ago" },
  { text: "Project completed: E-commerce Store", time: "25 min ago" },
  { text: "Ankit hired a content writer", time: "30 min ago" },
  { text: "Project completed: Brand Identity", time: "35 min ago" },
];

const aiInsights = [
  { icon: Brain, text: "Most demand is in UI/UX this month — up 24% from last month" },
  { icon: TrendingUp, text: "Projects increased 32% in last 30 days" },
  { icon: Clock, text: "Evening orders (6–10 PM) are the highest converting time slot" },
  { icon: Star, text: "Client retention is 87.3% — well above the industry average of 62%" },
];

const categoryData = [
  { name: "Design", pct: 32, popular: "UI/UX Design, Graphic Design" },
  { name: "Development", pct: 38, popular: "Web Dev, Mobile Apps" },
  { name: "Marketing", pct: 18, popular: "Social Media, SEO" },
  { name: "Writing", pct: 12, popular: "Content Writing, Copywriting" },
];

const topSkills = [
  { name: "UI/UX Design", demand: 92 },
  { name: "Web Development", demand: 88 },
  { name: "Video Editing", demand: 76 },
  { name: "Mobile App Dev", demand: 72 },
  { name: "SEO Optimization", demand: 65 },
  { name: "Content Writing", demand: 58 },
];

const topCities = [
  { name: "Mumbai", projects: 2840 },
  { name: "Delhi NCR", projects: 2210 },
  { name: "Bangalore", projects: 1950 },
  { name: "Hyderabad", projects: 1420 },
  { name: "Pune", projects: 1180 },
  { name: "Chennai", projects: 980 },
];

const sectionHeaders: { icon: typeof Briefcase; label: string; gradient?: boolean }[] = [
  { icon: Briefcase, label: "Platform Overview" },
  { icon: Activity, label: "Performance Metrics" },
  { icon: Layers, label: "Category-wise Work" },
  { icon: Zap, label: "Top Skills in Demand" },
  { icon: DollarSign, label: "Earnings Insights" },
  { icon: TrendingUp, label: "Growth Graph" },
  { icon: Brain, label: "AI Insights", gradient: true },
  { icon: MapPin, label: "Location Insights" },
];

const SectionTitle = ({
  icon: Icon,
  label,
  gradient,
}: {
  icon: typeof Briefcase;
  label: string;
  gradient?: boolean;
}) => (
  <h2 className="text-2xl font-extrabold font-headline mb-6 flex items-center gap-2">
    <span
      className={`w-8 h-8 ${gradient ? "vision-gradient" : "primary-gradient"} rounded-lg flex items-center justify-center shrink-0`}
    >
      <Icon className="w-4 h-4 text-white" />
    </span>
    {label}
  </h2>
);

const AnalyticsPage = () => {
  const [activeActivity, setActiveActivity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveActivity((prev) => (prev + 1) % liveActivities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />
      <main>
        <section className="px-8 md:px-20 py-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 font-headline tracking-tight">
              Our Analytics
            </h1>
            <p className="text-on-surface-variant text-lg">
              Transparent, real-time performance metrics that prove our platform works. No fluff —
              just facts.
            </p>
          </div>

          {/* 1. Platform Overview */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[0].icon} label={sectionHeaders[0].label} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Briefcase,
                  label: "Projects Completed",
                  value: "12,540+",
                  color: "primary",
                },
                { icon: Users, label: "Active Professionals", value: "3,200+", color: "tertiary" },
                {
                  icon: Star,
                  label: "Happy Clients",
                  value: "8,900+",
                  color: "tertiary-container",
                },
                {
                  icon: BarChart3,
                  label: "Earnings Paid",
                  value: "₹10.6M+",
                  color: "primary-container",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 text-center"
                >
                  <s.icon
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: `hsl(var(--${s.color}))` }}
                  />
                  <div
                    className="text-2xl md:text-3xl font-black mb-1"
                    style={{ color: `hsl(var(--${s.color}))` }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 2. Performance Metrics */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[1].icon} label={sectionHeaders[1].label} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Avg Delivery Time",
                  value: "2.4 Days",
                  sub: "Industry avg: 7 days",
                  pct: 34,
                  color: "primary",
                },
                {
                  label: "On-Time Delivery",
                  value: "96.8%",
                  sub: "Industry avg: 72%",
                  pct: 97,
                  color: "tertiary",
                },
                {
                  label: "Client Satisfaction",
                  value: "98.2%",
                  sub: "Based on 8.9k reviews",
                  pct: 98,
                  color: "tertiary-container",
                },
                {
                  label: "Rework Rate",
                  value: "1.8%",
                  sub: "Industry avg: 15%",
                  pct: 2,
                  color: "primary",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20"
                >
                  <div className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
                    {m.label}
                  </div>
                  <div
                    className="text-2xl font-black mb-1"
                    style={{ color: `hsl(var(--${m.color}))` }}
                  >
                    {m.value}
                  </div>
                  <div className="text-[9px] text-on-surface-variant mb-4">{m.sub}</div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${m.pct}%`, backgroundColor: `hsl(var(--${m.color}))` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 3. Category-wise Work */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[2].icon} label={sectionHeaders[2].label} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryData.map((c) => (
                <div
                  key={c.name}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-headline font-bold text-lg">{c.name}</span>
                    <span className="text-2xl font-black text-primary">{c.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    <span className="font-bold text-secondary">Popular: </span>
                    {c.popular}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 4. Top Skills in Demand */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[3].icon} label={sectionHeaders[3].label} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSkills.map((s, i) => (
                <div
                  key={s.name}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 flex items-center gap-4"
                >
                  <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center text-on-primary font-black text-sm shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-headline font-bold text-sm mb-2">{s.name}</div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.demand}%`,
                          backgroundColor: i < 3 ? `hsl(var(--tertiary))` : `hsl(var(--primary))`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-black text-on-surface-variant">{s.demand}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 5. Earnings Insights */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[4].icon} label={sectionHeaders[4].label} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Avg Earning / Project",
                  value: "₹850",
                  sub: "Across all categories",
                  color: "primary",
                },
                {
                  label: "Highest Category",
                  value: "Development",
                  sub: "Avg ₹1,200 per project",
                  color: "tertiary",
                },
                {
                  label: "Quarterly Growth",
                  value: "+32%",
                  sub: "Revenue growth trend",
                  color: "tertiary-container",
                },
              ].map((e) => (
                <div
                  key={e.label}
                  className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 text-center"
                >
                  <div className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
                    {e.label}
                  </div>
                  <div
                    className="text-3xl font-black mb-2"
                    style={{ color: `hsl(var(--${e.color}))` }}
                  >
                    {e.value}
                  </div>
                  <div className="text-xs text-on-surface-variant">{e.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 6. Growth Graph */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[5].icon} label={sectionHeaders[5].label} />
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20">
              <div className="flex flex-wrap gap-6 mb-6">
                {[
                  { label: "Monthly Projects", color: "primary" },
                  { label: "Revenue Growth", color: "tertiary" },
                  { label: "User Growth", color: "tertiary-container" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${l.color}))` }}
                    />
                    <span className="text-xs font-bold text-secondary">{l.label}</span>
                  </div>
                ))}
              </div>
              <svg className="w-full h-48" preserveAspectRatio="none" viewBox="0 0 400 150">
                {[0, 37.5, 75, 112.5, 150].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="hsl(var(--outline-variant))"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                ))}
                <path
                  d="M0 130 Q50 120 100 100 T200 70 T300 40 T400 15"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                />
                <path
                  d="M0 130 Q50 120 100 100 T200 70 T300 40 T400 15 V150 H0 Z"
                  fill="hsl(var(--primary))"
                  opacity="0.05"
                />
                <path
                  d="M0 135 Q50 125 100 110 T200 85 T300 55 T400 25"
                  fill="none"
                  stroke="hsl(var(--tertiary))"
                  strokeWidth="3"
                />
                <path
                  d="M0 135 Q50 125 100 110 T200 85 T300 55 T400 25 V150 H0 Z"
                  fill="hsl(var(--tertiary))"
                  opacity="0.05"
                />
                <path
                  d="M0 140 Q50 132 100 118 T200 90 T300 60 T400 30"
                  fill="none"
                  stroke="hsl(var(--tertiary-container))"
                  strokeWidth="3"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold mt-2">
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 7. AI Insights - Brain icon */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[6].icon} label={sectionHeaders[6].label} gradient />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 flex items-start gap-4 hover:border-tertiary/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shrink-0">
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed font-medium">
                    "{insight.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 8. Location Insights */}
          <div className="mb-16">
            <SectionTitle icon={sectionHeaders[7].icon} label={sectionHeaders[7].label} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCities.map((city, i) => (
                <div
                  key={city.name}
                  className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-headline font-bold text-sm">{city.name}</div>
                    <div className="text-[10px] text-on-surface-variant">
                      {city.projects.toLocaleString()} projects
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mb-16" />

          {/* 9. Live Activity Feed with blinking green dot */}
          <div className="mb-16">
            <h2 className="text-2xl font-extrabold font-headline mb-6 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
              </span>
              Live Activity Feed
            </h2>
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/20 overflow-hidden">
              {liveActivities.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 transition-all duration-500 ${i === activeActivity ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      className={`w-4 h-4 shrink-0 ${i === activeActivity ? "text-tertiary" : "text-on-surface-variant/40"}`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${i === activeActivity ? "text-on-surface" : "text-on-surface-variant"}`}
                    >
                      {a.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant shrink-0 ml-4">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

const AnalyticsPageWithSkeleton = () => {
  const booting = useSkeleton();
  if (booting) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <Navbar />
        <AnalyticsBodySkeleton />
        <FooterSkeleton />
      </div>
    );
  }
  return <AnalyticsPage />;
};

export default AnalyticsPageWithSkeleton;

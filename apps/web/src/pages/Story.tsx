import { Navbar, CTASection, Footer } from "@/features/marketing";
import { useSkeleton, StoryBodySkeleton, FooterSkeleton } from "@jobrio/ui/design-system";
import { useEffect } from "react";
import {
  Workflow,
  Cog,
  ShieldCheck,
  Sparkles,
  Clock,
  AlertTriangle,
  Repeat,
  Target,
} from "lucide-react";
import socialImage from "@/assets/story-social.jpg";

const clientPains = [
  {
    icon: Clock,
    title: "~40% Time Wasted",
    desc: "Searching, filtering and comparing talent instead of building.",
  },
  {
    icon: AlertTriangle,
    title: "Unreliable Outcomes",
    desc: "Delays, weak quality and zero accountability for results.",
  },
  {
    icon: ShieldCheck,
    title: "No Trust Layer",
    desc: "Payments, NDAs and quality have no guaranteed safety net.",
  },
];

const proPains = [
  {
    icon: Repeat,
    title: "Endless Bidding",
    desc: "Stuck in proposal cycles with no guaranteed conversion.",
  },
  {
    icon: AlertTriangle,
    title: "Unpaid Work",
    desc: "Delivering value with no protection on payment timelines.",
  },
  {
    icon: Target,
    title: "Unstructured Workflows",
    desc: "Inconsistent scope, shifting requirements and chaos.",
  },
];

const pillars = [
  {
    icon: Workflow,
    title: "Structured Workflow",
    desc: "Every task scoped, milestoned and tracked end-to-end — no ambiguity.",
  },
  {
    icon: Cog,
    title: "Automated Execution",
    desc: "Routing, matching and delivery handled by the platform, not by people.",
  },
  {
    icon: Sparkles,
    title: "Quality Assurance",
    desc: "Built-in QA layer reviews every outcome before it reaches the client.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Environment",
    desc: "Escrow, verified identities and dispute resolution baked in.",
  },
];

const timeline = [
  {
    tag: "TODAY",
    title: "Managed Marketplace",
    desc: "A verified network of professionals delivering structured outcomes through our managed system.",
  },
  {
    tag: "NEAR FUTURE",
    title: "Work-as-a-Service",
    desc: "Full WaaS layer — clients order outcomes, we orchestrate execution end-to-end.",
  },
  {
    tag: "LONG TERM",
    title: "Global Execution Infrastructure",
    desc: "Hiring becomes a utility. Instant, reliable, and outcome-driven at planetary scale.",
  },
];

const StoryPage = () => {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="px-8 md:px-20 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 font-headline tracking-tight">
              Our Story
            </h1>
            <p className="text-on-surface-variant text-lg mb-8">
              From a simple observation to a global execution infrastructure. Jobrio exists because
              hiring is broken — we're rebuilding it as managed, structured, outcome-driven
              infrastructure.
            </p>
          </div>
          <img
            src={socialImage}
            alt="The Jobrio team building a structured global work pipeline"
            width={1200}
            height={640}
            className="mx-auto aspect-[15/8] w-full max-w-6xl rounded-3xl object-cover"
          />
        </section>

        {/* The Origin */}
        <section
          id="origin"
          className="px-8 md:px-20 py-20 bg-surface border-b border-surface-container-high scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-3xl">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-4 block">
                THE ORIGIN
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 font-headline">
                Hiring today is broken.
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Clients lose nearly 40% of their time searching, filtering and comparing — yet still
                struggle to find reliable talent. Professionals stay trapped in endless bidding
                cycles, unpaid work and unstructured chaos. The system rewards effort, not outcomes.
                Jobrio was built to fix this — replacing uncertainty with trust, and friction with
                execution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Clients */}
              <div className="bg-surface-container-low p-8 md:p-10 rounded-3xl border border-outline-variant/30">
                <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">
                  For Clients
                </h3>
                <p className="text-on-surface-variant text-sm mb-8">What teams face every day.</p>
                <div className="space-y-5">
                  {clientPains.map((p) => (
                    <div key={p.title} className="flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <p.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface mb-1">{p.title}</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professionals */}
              <div className="bg-surface-container-low p-8 md:p-10 rounded-3xl border border-outline-variant/30">
                <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">
                  For Professionals
                </h3>
                <p className="text-on-surface-variant text-sm mb-8">What talent fights against.</p>
                <div className="space-y-5">
                  {proPains.map((p) => (
                    <div key={p.title} className="flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <p.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface mb-1">{p.title}</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Vision */}
        <section
          id="vision"
          className="px-8 md:px-20 py-20 bg-surface border-b border-surface-container-high scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-3xl">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-4 block">
                THE VISION
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 font-headline">
                Work-as-a-Service.
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Jobrio pioneers WaaS — a managed layer where execution runs like infrastructure.
                Structured workflows, automated delivery and built-in quality assurance give clients
                reliable outcomes without overhead, while professionals gain steady, secure work
                with guaranteed payments and zero chaos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="bg-surface-container-low p-7 rounded-3xl border border-outline-variant/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center mb-5 text-on-primary">
                    <p.icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-lg font-bold text-on-surface mb-2 font-headline">
                    {p.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap / Timeline */}
        <section className="px-8 md:px-20 py-20 bg-surface border-b border-surface-container-high">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-4 block">
                THE ROADMAP
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline">
                Where we're going.
              </h2>
            </div>

            <div className="relative space-y-8">
              {timeline.map((t, i) => (
                <div key={t.tag} className="relative pl-8 md:pl-12">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full primary-gradient ring-4 ring-surface" />
                  {i < timeline.length - 1 && (
                    <div className="absolute left-[5px] top-5 w-px h-[calc(100%+2rem)] bg-outline-variant/40" />
                  )}
                  <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/30">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] mb-2 block">
                      {t.tag}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-2 font-headline">
                      {t.title}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed">{t.desc}</p>
                  </div>
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

const StoryPageWithSkeleton = () => {
  const booting = useSkeleton();
  if (booting) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <Navbar />
        <StoryBodySkeleton />
        <FooterSkeleton />
      </div>
    );
  }
  return <StoryPage />;
};

export default StoryPageWithSkeleton;

import * as React from "react";
import { cn } from "@jobrio/utils/utils";
import { Skeleton, SkeletonText } from "../primitives/Skeleton";

/**
 * useSkeleton — shows a skeleton for `delay` ms whenever `key` changes.
 * Used for initial page loads and for in-dashboard navigation switches.
 */
export const useSkeleton = (delay = 550, key?: string | number) => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(t);
  }, [delay, key]);

  return loading;
};

/* ------------------------------------------------------------------ */
/* Marketing page building blocks — mirror the real section layouts. */
/* ------------------------------------------------------------------ */

const Divider = () => (
  <div className="px-8 md:px-20">
    <div className="" />
  </div>
);

/** Rounded search field used on catalog / directory pages. */
const SearchFieldSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("mx-auto", className)}>
    <Skeleton className="h-[58px] w-full rounded-2xl" />
  </div>
);

/**
 * Service card — mirrors the real card 1:1: same `p-8 rounded-3xl flex flex-col`
 * wrapper, 56px icon tile with `mb-6`, `text-xl` title line (h-7) with `mb-3`,
 * three `text-sm leading-relaxed` body lines (h-5) with `mb-8`, and the h-1 bar.
 */
const ServiceCardSkeleton = () => (
  <div className="p-8 rounded-3xl flex flex-col">
    <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
    <Skeleton className="h-7 w-2/3 mb-3 rounded-lg" />
    <div className="space-y-2 mb-8 flex-1">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
    </div>
    <Skeleton className="h-1 w-full rounded-full mt-auto" />
  </div>
);

const SectionTitleSkeleton = () => (
  <div className="flex items-center gap-3 mb-6">
    <Skeleton className="w-6 h-6 rounded-md" />
    <Skeleton className="h-4 w-40" />
  </div>
);

/**
 * CTA band — mirrors CTASection exactly: `py-24` section, `max-w-7xl` rounded
 * card with `p-8 md:p-12 lg:p-16`, left copy block and a right-hand stack of
 * two xl pill buttons (`min-w-[300px]`, full width on mobile).
 */
const CtaSkeleton = () => (
  <section className="px-8 md:px-20 py-24">
    <div className="rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 max-w-7xl mx-auto">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 md:h-12 w-4/5 rounded-xl" />
          <Skeleton className="h-10 md:h-12 w-2/3 rounded-xl" />
        </div>
        <div className="space-y-2 max-w-lg">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-11/12" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full sm:w-auto sm:min-w-[300px]">
        <Skeleton className="h-[70px] w-full rounded-full" />
        <Skeleton className="h-[70px] w-full rounded-full" />
      </div>
    </div>
  </section>
);

/** Top navigation bar placeholder (only used where the real Navbar is unavailable). */
export const NavbarSkeleton = () => (
  <div className="w-full px-8 md:px-20 py-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="hidden md:flex items-center gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-16" />
      ))}
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-20 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page body skeletons — rendered between the real Navbar and Footer. */
/* ------------------------------------------------------------------ */

/**
 * Rail heading — mirrors the landing rails exactly: `flex-col md:flex-row`,
 * `items-end mb-12 gap-6`, `text-4xl` h2 (h-10) with `mb-2` and a `text-lg`
 * lead (h-7), plus the right-hand "Explore More" action from md up.
 */
const RailHeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
    <div>
      <Skeleton className="h-10 w-56 sm:w-64 md:w-80 mb-2 rounded-xl" />
      <Skeleton className="h-7 w-48 sm:w-72 md:w-96 max-w-full" />
    </div>
    <Skeleton className="hidden md:block h-6 w-32 rounded-full" />
  </div>
);

/**
 * Horizontally scrolling rail of single solid card boxes — one box per card,
 * never a composition of inner sub-skeletons. Sizes follow the real cards at
 * each breakpoint (mobile → tablet → desktop).
 */
const CardRailSkeleton = ({
  count = 6,
  itemClassName,
  className,
}: {
  count?: number;
  itemClassName: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex gap-6 overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory",
      className,
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className={cn("shrink-0 snap-start rounded-3xl", itemClassName)} />
    ))}
  </div>
);

/**
 * Landing page body — mirrors Index.tsx section-for-section with the real
 * section paddings (`py-24` / `py-32`), the real hero height (`min-h-[700px]`),
 * the 12-col bento split (7/5) and the exact rail card sizes.
 */
export const LandingBodySkeleton = () => (
  <main>
    {/* Hero — min-h-[700px], left-aligned copy, two xl pill CTAs */}
    <section className="relative min-h-[700px] flex items-center px-8 md:px-20 py-10">
      <div className="z-10 max-w-4xl w-full px-4 sm:px-0">
        <Skeleton className="h-5 w-52 mb-4 rounded-full" />
        <div className="space-y-3 mb-8">
          <Skeleton className="h-[3.5rem] md:h-[5rem] w-full rounded-2xl" />
          <Skeleton className="h-[3.5rem] md:h-[5rem] w-5/6 rounded-2xl" />
        </div>
        <div className="space-y-2 max-w-2xl mb-12">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-2/3" />
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <Skeleton className="h-[70px] w-full sm:w-[279px] rounded-full" />
          <Skeleton className="h-[70px] w-full sm:w-[279px] rounded-full" />
        </div>
      </div>
    </section>
    <Divider />

    {/* Bento — real grid is 12-col with a 7/5 split and rounded-[2rem] tiles */}
    <section className="px-8 md:px-20 py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <Skeleton className="md:col-span-7 h-[420px] rounded-[2rem]" />
        <Skeleton className="md:col-span-5 h-[420px] rounded-[2rem]" />
      </div>
    </section>
    <Divider />

    {/* How it works — centered header + rail of 260px step cards */}
    <section className="px-8 md:px-20 py-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Skeleton className="h-10 w-80 max-w-full mx-auto mb-6 rounded-xl" />
        <Skeleton className="h-8 md:h-9 w-56 max-w-full mx-auto mb-6 rounded-xl" />
        <Skeleton className="h-7 w-full mx-auto" />
      </div>
      <CardRailSkeleton
        count={5}
        className="pb-8"
        itemClassName="w-[260px] h-[300px] rounded-[2rem]"
      />
    </section>
    <Divider />

    {/* Services — rail of 300/380px service cards */}
    <section className="px-8 md:px-20 py-24">
      <RailHeaderSkeleton />
      <CardRailSkeleton
        count={6}
        className="pb-8"
        itemClassName="w-[300px] md:w-[380px] h-[320px]"
      />
    </section>
    <Divider />

    {/* Professionals — rail of real 370x600 ID cards */}
    <section className="px-8 md:px-20 py-24">
      <RailHeaderSkeleton />
      <CardRailSkeleton count={6} itemClassName="w-[370px] h-[600px] rounded-2xl" />
    </section>
    <Divider />

    {/* Clients — rail of real 370x600 ID cards */}
    <section className="px-8 md:px-20 py-24">
      <RailHeaderSkeleton />
      <CardRailSkeleton count={6} itemClassName="w-[370px] h-[600px] rounded-2xl" />
    </section>
    <Divider />

    {/* Analytics — rail of 340–380px metric panels */}
    <section className="px-8 md:px-20 py-24">
      <RailHeaderSkeleton />
      <CardRailSkeleton
        count={5}
        className="pb-4"
        itemClassName="w-[340px] md:w-[380px] h-[340px]"
      />
    </section>
    <Divider />

    {/* Story — header + two min-h-[420px] rounded-[3.5rem] cards */}
    <section className="px-8 md:px-20 py-32">
      <RailHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[420px] rounded-[3.5rem]" />
        ))}
      </div>
    </section>
    <Divider />
    <CtaSkeleton />
  </main>
);

/** Footer skeleton — mirrors the real footer: brand block, link columns, trust strip, bottom bar. */
export const FooterSkeleton = () => (
  <footer className="bg-surface-container-low">
    <div className="border-t border-outline-variant/30" />
    <div className="px-8 md:px-20 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-12 mb-12 border-b border-outline-variant/20 pb-12">
        <div className="col-span-1 sm:col-span-2">
          <Skeleton className="h-7 w-32 mb-6 rounded-xl" />
          <div className="space-y-2 max-w-sm">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col}>
            <Skeleton className="h-4 w-24 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-28" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-12 pb-12 border-b border-outline-variant/20">
        <Skeleton className="h-3 w-40 mb-6" />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-sm" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Skeleton className="h-3 w-64 max-w-full" />
        <div className="flex gap-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  </footer>
);

/** Services catalog page body. */
export const ServicesBodySkeleton = () => (
  <main>
    <section className="px-8 md:px-20 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Skeleton className="h-10 md:h-12 w-64 max-w-full mx-auto mb-4 rounded-xl" />
        <div className="space-y-2 mb-8">
          <Skeleton className="h-4 w-full mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
        <SearchFieldSkeleton className="max-w-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </section>
    <CtaSkeleton />
  </main>
);

/**
 * Professionals / Clients directory page body — mirrors the real page:
 * same section padding, same header block, same search field width and the
 * exact ID-card grid (`sm:2 / lg:3 / xl:4`, `justify-items-center`) with
 * cards sized like the real 370x600 ID card at every breakpoint.
 */
export const DirectoryBodySkeleton = () => (
  <main>
    <section className="px-8 md:px-20 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Skeleton className="h-10 md:h-12 w-72 max-w-full mx-auto mb-4 rounded-xl" />
        <div className="space-y-2 mb-8">
          <Skeleton className="h-4 w-full mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
        <SearchFieldSkeleton className="max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full max-w-[370px] h-[600px] rounded-2xl" />
        ))}
      </div>
    </section>
    <CtaSkeleton />
  </main>
);

/** One analytics block: SectionTitle + a grid of solid card boxes. */
const AnalyticsBlockSkeleton = ({
  gridClassName,
  count,
  cardClassName = "h-[150px]",
  divider = true,
}: {
  gridClassName: string;
  count: number;
  cardClassName?: string;
  divider?: boolean;
}) => (
  <>
    <div className="mb-16">
      <SectionTitleSkeleton />
      <div className={cn("grid gap-4", gridClassName)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className={cn("w-full rounded-3xl", cardClassName)} />
        ))}
      </div>
    </div>
    {divider && <div className="mb-16" />}
  </>
);

/**
 * Analytics page body — mirrors all nine real blocks with their exact grids:
 * overview (2/4), performance (2/4), categories (1/2/4), skills (1/2/3),
 * earnings (1/3), growth chart, AI insights (1/2), cities (1/2/3), live feed.
 */
export const AnalyticsBodySkeleton = () => (
  <main>
    <section className="px-8 md:px-20 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Skeleton className="h-10 md:h-12 w-64 max-w-full mx-auto mb-4 rounded-xl" />
        <Skeleton className="h-5 w-full mx-auto mb-2" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
      </div>

      {/* 1. Platform overview */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-2 md:grid-cols-4"
        count={4}
        cardClassName="h-[148px]"
      />
      {/* 2. Performance metrics */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-2 md:grid-cols-4"
        count={4}
        cardClassName="h-[166px]"
      />
      {/* 3. Category-wise work */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        count={4}
        cardClassName="h-[142px]"
      />
      {/* 4. Top skills in demand */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        count={6}
        cardClassName="h-[90px]"
      />
      {/* 5. Earnings insights */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-1 md:grid-cols-3"
        count={3}
        cardClassName="h-[172px]"
      />

      {/* 6. Growth graph */}
      <div className="mb-16">
        <SectionTitleSkeleton />
        <Skeleton className="w-full h-[344px] rounded-3xl" />
      </div>
      <div className="mb-16" />

      {/* 7. AI insights */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-1 md:grid-cols-2"
        count={4}
        cardClassName="h-[104px]"
      />
      {/* 8. Location insights */}
      <AnalyticsBlockSkeleton
        gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        count={6}
        cardClassName="h-[90px]"
      />

      {/* 9. Live activity feed */}
      <div className="mb-16">
        <Skeleton className="h-8 w-56 mb-6 rounded-xl" />
        <Skeleton className="w-full h-[330px] rounded-3xl" />
      </div>
    </section>
    <CtaSkeleton />
  </main>
);

/**
 * Story page body — mirrors the real page: hero, two long-form sections
 * (`max-w-6xl`, header + 2-up cards / 4-up pillar cards) and the
 * `max-w-4xl` roadmap timeline with its left rail.
 */
export const StoryBodySkeleton = () => (
  <main>
    {/* Hero */}
    <section className="px-8 md:px-20 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Skeleton className="h-10 md:h-12 w-56 max-w-full mx-auto mb-4 rounded-xl" />
        <div className="space-y-2 mb-8">
          <Skeleton className="h-5 w-full mx-auto" />
          <Skeleton className="h-5 w-5/6 mx-auto" />
          <Skeleton className="h-5 w-2/3 mx-auto" />
        </div>
      </div>
    </section>

    {/* The origin — header + two tall cards */}
    <section className="px-8 md:px-20 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-3xl space-y-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-10 md:h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[420px] md:h-[460px] rounded-3xl" />
          ))}
        </div>
      </div>
    </section>

    {/* Pillars — header + 1/2/4 card grid */}
    <section className="px-8 md:px-20 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-3xl space-y-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-10 md:h-12 w-2/3 rounded-xl" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[220px] rounded-3xl" />
          ))}
        </div>
      </div>
    </section>

    {/* Roadmap timeline */}
    <section className="px-8 md:px-20 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center space-y-4">
          <Skeleton className="h-3 w-28 mx-auto rounded-full" />
          <Skeleton className="h-10 md:h-12 w-2/3 mx-auto rounded-xl" />
        </div>
        <div className="relative space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative pl-8 md:pl-12">
              <Skeleton className="absolute left-0 top-2 w-3 h-3 rounded-full" />
              <Skeleton className="w-full h-[168px] md:h-[180px] rounded-3xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
    <CtaSkeleton />
  </main>
);

/** Marketing page skeleton kept for callers without the real Navbar in scope. */
export const MarketingPageSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("min-h-screen bg-surface", className)}>
    <NavbarSkeleton />
    <ServicesBodySkeleton />
  </div>
);

/** Landing page skeleton (standalone variant, includes a navbar placeholder). */
export const LandingPageSkeleton = () => (
  <div className="min-h-screen bg-surface">
    <NavbarSkeleton />
    <LandingBodySkeleton />
  </div>
);

/** Auth (login / signup / forgot password) skeleton. */
export const AuthPageSkeleton = () => (
  <div className="min-h-screen flex flex-col bg-surface">
    <main className="flex-grow flex items-center justify-center p-6 md:p-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left brand / copy column */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <Skeleton className="h-5 w-24 mb-5" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[2.5rem] md:h-[3.5rem] w-full rounded-2xl" />
            <Skeleton className="h-[2.5rem] md:h-[3.5rem] w-3/4 rounded-2xl" />
            <div className="space-y-2 max-w-md pt-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          </div>
          <div className="hidden lg:block pt-8">
            <div className="flex -space-x-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
            <Skeleton className="mt-4 h-3 w-44" />
          </div>
        </div>

        {/* Right form card */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl p-8 md:p-10">
            <div className="mb-10 space-y-2">
              <Skeleton className="h-8 w-52 rounded-lg" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="flex items-center py-2 gap-4">
                <Skeleton className="h-px flex-grow" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-px flex-grow" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Skeleton className="h-4 w-24" />
                    {i === 1 && <Skeleton className="h-4 w-28" />}
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-4 w-56 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

/* ------------------------------------------------------------------ */
/* Dashboard section skeletons — pixel-mirrored per real section.      */
/* Every block below copies the exact grid/border/radius classes of    */
/* its real counterpart component so nothing shifts when real content  */
/* swaps in.                                                           */
/* ------------------------------------------------------------------ */

export type DashboardSectionVariant =
  | "home"
  | "orders"
  | "invoices"
  | "messages"
  | "wallet"
  | "notifications"
  | "form"
  | "profile"
  | "settings"
  | "list"
  | "stub"
  | "admin";

/** Mirrors shared.tsx's SectionHeader: h1 + optional subtitle, optional right-side action. */
const SectionHeaderSkeleton = ({ withAction = false }: { withAction?: boolean }) => (
  <div className="flex items-end justify-between gap-4">
    <div className="space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-3 w-72 max-w-full" />
    </div>
    {withAction && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
  </div>
);

/** Mirrors shared.tsx's Card wrapper: bg-surface-container-low rounded-3xl border p-5. */
const CardShell = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div
    className={cn(
      "bg-surface-container-low rounded-3xl border border-outline-variant/30 p-5",
      className,
    )}
  >
    {children}
  </div>
);

const StatRowSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
    ))}
  </div>
);

/* ---------- Home ---------- */

/** Mirrors HomeSection's MetricCard exactly: icon block on top, label, value pinned bottom. */
const MetricGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl flex flex-col justify-between min-h-[160px]"
      >
        <div>
          <Skeleton className="w-7 h-7 rounded-lg mb-4" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
    ))}
  </div>
);

/** Mirrors HomeSection's ActivityItem row: 64px icon, badge+meta, title, desc, actions. */
const ActivityRowSkeleton = () => (
  <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
    <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <div className="flex gap-2 sm:flex-shrink-0">
      <Skeleton className="h-9 w-24 rounded-full" />
      <Skeleton className="h-9 w-20 rounded-full" />
    </div>
  </div>
);

/** Mirrors HomeSection's exact 12-col split: 8-col activity card + 4-col stacked sidebar. */
const HomeMainSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <div className="lg:col-span-8 bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden">
      <div className="px-8 pt-8 pb-4 flex justify-between items-center">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="divide-y divide-outline-variant/20 px-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityRowSkeleton key={i} />
        ))}
      </div>
    </div>

    <div className="lg:col-span-4 space-y-6">
      {/* CTA card */}
      <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 space-y-4">
        <Skeleton className="h-5 w-40" />
        <SkeletonText lines={2} />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* Account manager card */}
      <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30 space-y-4">
        <Skeleton className="h-3 w-32" />
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        </div>
      </div>
      {/* Info card */}
      <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/30">
        <div className="flex gap-4">
          <Skeleton className="w-6 h-6 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <SkeletonText lines={2} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- Orders / Invoices (both AuditListPage-based, different rows) ---------- */

/** Mirrors AuditListPage's shell: title+desc, search icon, tab pills, sort/count row. */
const AuditShellHeaderSkeleton = ({ tabCount = 6 }: { tabCount?: number }) => (
  <div className="space-y-5">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-60 max-w-full" />
      </div>
      <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: tabCount }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-full" />
      ))}
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-32 rounded-full" />
    </div>
  </div>
);

/** Mirrors OrdersSection's Card row: 44px icon tile, title+badge, id/pro line, amount, button. */
const OrderRowSkeleton = () => (
  <div className="bg-surface-container-low rounded-3xl border border-outline-variant/30 p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-2.5 w-32" />
      </div>
      <Skeleton className="h-3.5 w-12 hidden sm:block" />
      <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
    </div>
  </div>
);

const OrdersBodySkeleton = () => (
  <div className="space-y-8">
    <AuditShellHeaderSkeleton tabCount={6} />
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

/** Mirrors InvoicesSection's row: id/meta block, amount, status pill, action button cluster. */
const InvoiceRowSkeleton = () => (
  <div className="p-4 flex flex-wrap items-center gap-4 border-b border-surface-container-high/60 last:border-b-0">
    <div className="flex-1 min-w-[180px] space-y-2">
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-2.5 w-40" />
    </div>
    <Skeleton className="h-3.5 w-12" />
    <Skeleton className="h-5 w-16 rounded-full" />
    <div className="flex items-center gap-2 ml-auto">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

const InvoicesBodySkeleton = () => (
  <div className="space-y-8">
    <AuditShellHeaderSkeleton tabCount={2} />
    <div className="bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <InvoiceRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

/* ---------- Messages ---------- */

/** Mirrors MessagesInbox's thread row: avatar, name/preview, time. */
const ThreadRowSkeleton = () => (
  <div className="p-4 flex items-center gap-3 border-b border-outline-variant/20 last:border-b-0">
    <Skeleton className="w-11 h-11 rounded-full shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
    <Skeleton className="h-2.5 w-8 shrink-0" />
  </div>
);

/** Mirrors MessagesInbox's exact shell: AuditListPage header + 12-col 5/7 split. */
const MessagesBodySkeleton = () => (
  <div className="space-y-8">
    <AuditShellHeaderSkeleton tabCount={2} />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-5 xl:col-span-4 bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <ThreadRowSkeleton key={i} />
        ))}
      </div>
      <div className="lg:col-span-7 xl:col-span-8 bg-surface-container-low rounded-3xl border border-outline-variant/30 min-h-[60vh] hidden lg:flex flex-col items-center justify-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  </div>
);

/* ---------- Wallet ---------- */

/** Mirrors WalletSection's 4 equal stat cards + a single transactions card. */
const WalletCardsSkeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="rounded-3xl p-5 bg-surface-container-low border border-outline-variant/30 space-y-2"
      >
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-7 w-20" />
      </div>
    ))}
  </div>
);

const WalletTransactionsSkeleton = () => (
  <CardShell>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-14" />
    </div>
    <div className="divide-y divide-surface-container-high/60">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="py-3 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <Skeleton className="h-3.5 w-14" />
        </div>
      ))}
    </div>
  </CardShell>
);

/* ---------- Notifications ---------- */

/** Mirrors NotificationsSection's row: circular icon, title+unread dot, desc, time+link. */
const NotificationRowSkeleton = () => (
  <div className="py-4 px-2 flex items-start gap-4">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  </div>
);

const NotificationsBodySkeleton = () => (
  <div className="space-y-6">
    <SectionHeaderSkeleton withAction />
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
    <CardShell>
      <div className="divide-y divide-surface-container-high/60">
        {Array.from({ length: 7 }).map((_, i) => (
          <NotificationRowSkeleton key={i} />
        ))}
      </div>
    </CardShell>
  </div>
);

/* ---------- Create-order form ---------- */

/** Mirrors CreateOrderSection exactly: select, textarea, 2-col date/budget, 1 button. */
const CreateOrderFormSkeleton = () => (
  <div className="space-y-6 max-w-3xl">
    <SectionHeaderSkeleton />
    <CardShell className="p-5 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-11 w-32 rounded-full" />
    </CardShell>
  </div>
);

/* ---------- Profile ---------- */

/** Mirrors ProfileSection: avatar+name card, 4-col stat grid, details list card. */
const ProfileBodySkeleton = () => (
  <div className="space-y-6">
    <SectionHeaderSkeleton withAction />

    <CardShell className="flex flex-col sm:flex-row sm:items-center gap-5">
      <Skeleton className="w-20 h-20 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-52" />
        <div className="flex flex-wrap gap-2 mt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-28 rounded-full shrink-0" />
    </CardShell>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardShell key={i} className="space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-5 w-12" />
        </CardShell>
      ))}
    </div>

    <CardShell className="p-0 overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <Skeleton className="h-2.5 w-16" />
      </div>
      <div className="divide-y divide-outline-variant/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </CardShell>
  </div>
);

/* ---------- Settings ---------- */

/** Mirrors SettingsSection's row: 36px icon, label+desc, value text, chevron. */
const SettingsRowSkeleton = () => (
  <div className="flex items-center gap-4 px-5 py-3.5">
    <Skeleton className="w-9 h-9 rounded-2xl shrink-0" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-2.5 w-44" />
    </div>
    <Skeleton className="h-2.5 w-14 hidden sm:block shrink-0" />
    <Skeleton className="h-3 w-3 rounded-sm shrink-0" />
  </div>
);

/** Mirrors SettingsSection's grouped cards (title + rows) + a final sign-out card. */
const SettingsBodySkeleton = () => (
  <div className="space-y-6">
    <SectionHeaderSkeleton withAction />
    {Array.from({ length: 3 }).map((_, g) => (
      <CardShell key={g} className="p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <Skeleton className="h-2.5 w-24" />
        </div>
        <div className="divide-y divide-outline-variant/30">
          {Array.from({ length: 4 }).map((_, i) => (
            <SettingsRowSkeleton key={i} />
          ))}
        </div>
      </CardShell>
    ))}
    <CardShell>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2.5 w-48" />
        </div>
        <Skeleton className="h-10 w-24 rounded-2xl shrink-0" />
      </div>
    </CardShell>
  </div>
);

/* ---------- Generic list / stub / admin fallbacks (unchanged shape, kept for  ---------- */
/* sections that don't yet have a dedicated real layout to mirror). */

const ListRowsSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="rounded-3xl">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="rounded-3xl overflow-hidden">
    <div className="flex items-center gap-4 px-6 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 px-6 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === 0 ? "flex-[1.4]" : "flex-1")} />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Dashboard section skeleton — rendered inside the real dashboard layout so
 * the sidebar / topbar stay live while the section content loads. Each
 * variant is a structural mirror of the real section it stands in for.
 */
export const DashboardSectionSkeleton = ({
  variant = "list",
}: {
  variant?: DashboardSectionVariant;
}) => {
  if (variant === "home") {
    return (
      <div className="space-y-6">
        <MetricGridSkeleton />
        <HomeMainSkeleton />
      </div>
    );
  }

  if (variant === "orders") {
    return <OrdersBodySkeleton />;
  }

  if (variant === "invoices") {
    return <InvoicesBodySkeleton />;
  }

  if (variant === "messages") {
    return <MessagesBodySkeleton />;
  }

  if (variant === "wallet") {
    return (
      <div className="space-y-6">
        <SectionHeaderSkeleton />
        <WalletCardsSkeleton />
        <WalletTransactionsSkeleton />
      </div>
    );
  }

  if (variant === "notifications") {
    return <NotificationsBodySkeleton />;
  }

  if (variant === "form") {
    return <CreateOrderFormSkeleton />;
  }

  if (variant === "profile") {
    return <ProfileBodySkeleton />;
  }

  if (variant === "settings") {
    return <SettingsBodySkeleton />;
  }

  if (variant === "stub") {
    return (
      <div className="space-y-6">
        <SectionHeaderSkeleton />
        <div className="rounded-3xl p-8 space-y-3 bg-surface-container-low border border-outline-variant/30">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <SectionHeaderSkeleton />
          <Skeleton className="h-6 w-40 rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, s) => (
          <div key={s} className="space-y-3">
            <Skeleton className="h-3 w-48" />
            <StatRowSkeleton count={4} />
          </div>
        ))}
        <TableSkeleton rows={5} />
      </div>
    );
  }

  // "list" — generic fallback for sections without a dedicated mirror yet
  return (
    <div className="space-y-8">
      <SectionHeaderSkeleton />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <ListRowsSkeleton rows={4} />
    </div>
  );
};

/** Full dashboard shell skeleton (sidebar + topbar + content). */
export const DashboardShellSkeleton = () => (
  <div className="min-h-screen bg-surface flex">
    <div className="hidden lg:flex w-64 shrink-0 flex-col gap-3 p-4">
      <div className="flex items-center gap-3 pb-4">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-xl" />
      ))}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      <div className="p-6">
        <DashboardSectionSkeleton variant="home" />
      </div>
    </div>
  </div>
);

/** Super-admin second screen (live work pane) skeleton — grey only. */
export const LivePaneSkeleton = () => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-20 rounded-full" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="rounded-3xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton key={j} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

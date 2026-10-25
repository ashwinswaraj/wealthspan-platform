import {
  Navbar,
  HeroSection,
  BentoGrid,
  HowItWorks,
  ServicesSection,
  ProfessionalsSection,
  ClientsSection,
  AnalyticsSection,
  StorySection,
  CTASection,
  Footer,
} from "@/features/marketing";
import { useSkeleton, LandingBodySkeleton, FooterSkeleton } from "@jobrio/ui/design-system";
import { useState, useCallback } from "react";

const Divider = () => (
  <div className="px-8 md:px-20">
    <div className="border-t border-surface-container-high" />
  </div>
);

const Index = () => {
  // Global single-active-state: only one card flipped OR one QR expanded at a time
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"flip" | "qr" | null>(null);

  const handleFlip = useCallback(
    (id: string) => {
      if (activeCardId === id && activeType === "flip") {
        setActiveCardId(null);
        setActiveType(null);
      } else {
        setActiveCardId(id);
        setActiveType("flip");
      }
    },
    [activeCardId, activeType],
  );

  const handleQrExpand = useCallback(
    (id: string) => {
      if (activeCardId === id && activeType === "qr") {
        setActiveCardId(null);
        setActiveType(null);
      } else {
        setActiveCardId(id);
        setActiveType("qr");
      }
    },
    [activeCardId, activeType],
  );

  return (
    <div className="bg-surface text-on-surface">
      <Navbar />
      <main>
        <HeroSection />
        <Divider />
        <BentoGrid />
        <Divider />
        <HowItWorks />
        <Divider />
        <ServicesSection />
        <Divider />
        <ProfessionalsSection
          activeCardId={activeCardId}
          activeType={activeType}
          onFlip={handleFlip}
          onQrExpand={handleQrExpand}
        />
        <Divider />
        <ClientsSection
          activeCardId={activeCardId}
          activeType={activeType}
          onFlip={handleFlip}
          onQrExpand={handleQrExpand}
        />
        <Divider />
        <AnalyticsSection />
        <Divider />
        <StorySection />
        <Divider />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

const IndexWithSkeleton = () => {
  const booting = useSkeleton();
  if (booting) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <Navbar />
        <LandingBodySkeleton />
        <FooterSkeleton />
      </div>
    );
  }
  return <Index />;
};

export default IndexWithSkeleton;

import { Navbar, CTASection, Footer } from "@/features/marketing";
import { useSkeleton, DirectoryBodySkeleton, FooterSkeleton } from "@jobrio/ui/design-system";
import { useState, useMemo, lazy, Suspense } from "react";
import { Search, X } from "lucide-react";
import AnimatedPlaceholder from "@jobrio/ui/shared/AnimatedPlaceholder";
import ProfessionalIdCard from "@jobrio/ui/shared/ProfessionalIdCard";
import type { ProfessionalCardData } from "@jobrio/types/professional";
import { professionals } from "@jobrio/constants/professionals";
import socialImage from "@/assets/professionals-social.jpg";

export { professionals };

// Camera scanner (html5-qrcode, ~880 kB) is code-split: its chunk only
// downloads when the user actually opens the scanner.
const QrScannerModal = lazy(() => import("@jobrio/ui/shared/QrScannerModal"));

const ProfessionalsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"flip" | "qr" | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleFlip = (id: string) => {
    if (activeCardId === id && activeType === "flip") {
      setActiveCardId(null);
      setActiveType(null);
    } else {
      setActiveCardId(id);
      setActiveType("flip");
    }
  };

  const handleQrExpand = (id: string) => {
    if (activeCardId === id && activeType === "qr") {
      setActiveCardId(null);
      setActiveType(null);
    } else {
      setActiveCardId(id);
      setActiveType("qr");
    }
  };

  const filteredProfessionals = useMemo(() => {
    if (!searchQuery.trim()) return professionals;
    const q = searchQuery.toLowerCase();
    return professionals.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleScanResult = (decodedText: string) => {
    // Try to find matching professional by decoded QR text (could be ID or URL containing ID)
    const match = professionals.find(
      (p) => decodedText.includes(p.id) || decodedText.toLowerCase().includes(p.name.toLowerCase()),
    );
    if (match) {
      setSearchQuery(match.id);
    } else {
      setSearchQuery(decodedText);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />
      <main>
        <section className="px-8 md:px-20 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 font-headline tracking-tight">
              Our Professionals
            </h1>
            <p className="text-on-surface-variant text-lg mb-8">
              Vetted elite talent ready for instant deployment. Search by name or card number.
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-24 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl font-headline text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30 transition-all"
                />
                <AnimatedPlaceholder
                  show={!searchQuery}
                  phrases={[
                    "Search by name…",
                    "Search by card number…",
                    "Try “JR-PR-772910”…",
                    "Find Elite engineers…",
                    "Scan a QR to lookup…",
                  ]}
                  className="left-12 right-24 text-sm text-on-surface-variant/60 font-headline"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                      title="Clear search"
                    >
                      <X className="w-4 h-4 text-on-surface-variant" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowScanner(true)}
                    className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                    title="Tap to scan"
                    aria-label="Open QR code scanner"
                  >
                    <span className="material-symbols-outlined text-xl text-primary">
                      qr_code_scanner
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <img
            src={socialImage}
            alt="Vetted Jobrio professionals collaborating on a client project"
            width={1200}
            height={640}
            className="mb-12 aspect-[15/8] w-full rounded-3xl object-cover"
          />

          <div className="grid gap-6 justify-center [grid-template-columns:repeat(auto-fit,minmax(370px,370px))]">
            {filteredProfessionals.map((pro) => (
              <ProfessionalIdCard
                key={pro.id}
                data={pro}
                isFlipped={activeCardId === pro.id && activeType === "flip"}
                isQrExpanded={activeCardId === pro.id && activeType === "qr"}
                onFlip={() => handleFlip(pro.id)}
                onQrExpand={() => handleQrExpand(pro.id)}
              />
            ))}
          </div>

          {filteredProfessionals.length === 0 && (
            <div className="text-center py-20">
              <p className="text-on-surface-variant text-lg">
                No professionals found matching "{searchQuery}"
              </p>
            </div>
          )}
        </section>

        <CTASection />
      </main>
      <Footer />

      {showScanner && (
        <Suspense fallback={null}>
          <QrScannerModal
            open={showScanner}
            onClose={() => setShowScanner(false)}
            onScanResult={handleScanResult}
          />
        </Suspense>
      )}
    </div>
  );
};

const ProfessionalsPageWithSkeleton = () => {
  const booting = useSkeleton();
  if (booting) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <Navbar />
        <DirectoryBodySkeleton />
        <FooterSkeleton />
      </div>
    );
  }
  return <ProfessionalsPage />;
};

export default ProfessionalsPageWithSkeleton;

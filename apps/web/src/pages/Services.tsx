import { Navbar, CTASection, Footer } from "@/features/marketing";
import { useSkeleton, ServicesBodySkeleton, FooterSkeleton } from "@jobrio/ui/design-system";
import { useState, useMemo } from "react";
import AnimatedPlaceholder from "@jobrio/ui/shared/AnimatedPlaceholder";
import { Search, X } from "lucide-react";
import { useServiceRegistry, type RegisteredService } from "@jobrio/constants";
import socialImage from "@/assets/services-social.jpg";

export type { RegisteredService as ServiceItem };

const ServicesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // Live catalog: seed services + anything created from the Super Admin
  // Services Desk. Flat list, no category grouping — matches this page's
  // existing design exactly (category grouping only happens in Order Create).
  const registry = useServiceRegistry();
  const allServices = registry;

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return allServices;
    const q = searchQuery.toLowerCase();
    return allServices.filter(
      (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q),
    );
  }, [searchQuery, allServices]);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />
      <main>
        <section className="px-8 md:px-20 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 font-headline tracking-tight">
              Our Services
            </h1>
            <p className="text-on-surface-variant text-lg mb-8">
              Standardized outcomes for every business need. Explore our ultimate catalog of
              professional services.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl font-headline text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-on-surface focus:ring-1 focus:ring-on-surface/30 transition-all"
              />
              <AnimatedPlaceholder
                show={!searchQuery}
                phrases={[
                  "Search services…",
                  "Try “Web development”…",
                  "Browse design packages…",
                  "Find marketing solutions…",
                  "Explore our catalog…",
                ]}
                className="left-12 right-12 text-sm text-on-surface-variant/60 font-headline"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-on-surface-variant" />
                </button>
              )}
            </div>
          </div>

          <img
            src={socialImage}
            alt="A multidisciplinary Jobrio delivery team planning client work"
            width={1200}
            height={640}
            className="mb-12 aspect-[15/8] w-full rounded-3xl object-cover"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => (
              <div
                key={`${service.title}-${index}`}
                className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 flex flex-col hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 primary-gradient rounded-2xl flex items-center justify-center mb-6 shadow-sm text-on-primary">
                  <service.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold mb-3 font-headline">{service.title}</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-1">
                  {service.desc}
                </p>
                <div className="h-1 w-full bg-primary/20 rounded-full mt-auto"></div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <p className="text-on-surface-variant text-lg">
                No services found matching "{searchQuery}"
              </p>
            </div>
          )}
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

const ServicesPageWithSkeleton = () => {
  const booting = useSkeleton();
  if (booting) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <Navbar />
        <ServicesBodySkeleton />
        <FooterSkeleton />
      </div>
    );
  }
  return <ServicesPage />;
};

export default ServicesPageWithSkeleton;

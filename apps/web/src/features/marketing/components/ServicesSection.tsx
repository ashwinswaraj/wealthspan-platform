import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "@/lib/react-router-dom";
import { allServices } from "@jobrio/constants";
import { useHorizontalInfinite } from "@jobrio/hooks/use-horizontal-infinite";

const ServicesSection = () => {
  const navigate = useNavigate();
  const { ref, count, loading, hasMore } = useHorizontalInfinite(allServices.length, 6, 4);
  const visible = allServices.slice(0, count);

  return (
    <section id="services" className="px-8 md:px-20 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface mb-2">Our Services</h2>
          <p className="text-on-surface-variant text-lg">
            Standardized outcomes for every business need.
          </p>
        </div>
        <button
          onClick={() => navigate("/services")}
          className="px-2 py-3 font-headline font-bold text-primary hover:text-primary-container hover:scale-[1.04] active:scale-[0.95] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
        >
          Explore More <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory"
      >
        {visible.map((service, i) => (
          <div
            key={`${service.title}-${i}`}
            className="min-w-[300px] md:min-w-[380px] bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 snap-start flex flex-col"
          >
            <div className="w-14 h-14 primary-gradient rounded-2xl flex items-center justify-center mb-6 shadow-sm text-on-primary">
              <service.icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-1">
              {service.desc}
            </p>
            <div className="h-1 w-full bg-primary/20 rounded-full mt-auto"></div>
          </div>
        ))}
        {hasMore && (
          <div className="min-w-[160px] flex items-center justify-center text-on-surface-variant">
            <Loader2 className={`w-6 h-6 ${loading ? "animate-spin" : "opacity-40"}`} />
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;

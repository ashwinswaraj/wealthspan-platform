import { useNavigate } from "@/lib/react-router-dom";
import { Button } from "@jobrio/ui/design-system";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="px-8 md:px-20 py-24">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 max-w-7xl mx-auto">
        <div className="max-w-2xl text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 leading-tight tracking-tight">
            Ready to switch to <span className="text-primary-container italic">WaaS</span>
            {"\u00a0"}?
          </h2>
          <p className="text-on-surface-variant text-lg md:text-xl font-medium leading-relaxed max-w-lg">
            Whether you are scaling a department or looking for elite assignments, Jobrio is the
            professional infrastructure you've been waiting for.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full sm:w-auto min-w-[300px]">
          <Button
            variant="cta"
            size="xl"
            onClick={() => navigate("/signup")}
            className="rounded-full font-headline"
          >
            Create Your First Order
          </Button>
          <Button
            variant="ctaWhite"
            size="xl"
            onClick={() => navigate("/signup")}
            className="rounded-full font-headline"
          >
            Apply as a Professional
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

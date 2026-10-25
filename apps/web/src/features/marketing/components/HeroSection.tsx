import { useState } from "react";
import { useNavigate } from "@/lib/react-router-dom";
import { Button, Skeleton } from "@jobrio/ui/design-system";
import heroOfficeImage from "@/assets/hero-office.png";

const HeroSection = () => {
  const navigate = useNavigate();
  // Skeleton stays until the hero image itself has finished loading.
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <section className="relative min-h-[700px] flex items-center px-8 md:px-20 py-10 overflow-hidden">
      <div className="z-10 max-w-4xl px-4 sm:px-0">
        <span className="text-secondary font-label text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
          Workforce-as-a-Service
        </span>
        <h1 className="text-[3.5rem] md:text-[5rem] font-extrabold leading-[1.1] tracking-tight text-on-background mb-8">
          The end of <span className="text-primary italic">bidding</span>.<br />
          The start of execution.
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mb-12 font-body leading-relaxed">
          Jobrio eliminates the friction of traditional marketplaces. No searching, no vetting, no
          bidding. We deliver guaranteed outcomes through an automated, professional workforce
          pipeline.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <Button
            variant="cta"
            size="xl"
            onClick={() => navigate("/signup")}
            className="font-headline text-lg rounded-full shadow-none"
          >
            Create Your First Order
          </Button>
          <Button
            variant="ctaWhite"
            size="xl"
            onClick={() => navigate("/signup")}
            className="font-headline text-lg rounded-full shadow-none"
          >
            Apply as a Professional
          </Button>
        </div>
      </div>
      <div className="absolute right-[-10%] top-[15%] w-[60%] h-[75%] hidden lg:block">
        <div className="relative w-full h-full rounded-[4rem] bg-surface-container-low overflow-hidden shadow-2xl">
          {!heroLoaded && <Skeleton className="absolute inset-0 w-full h-full rounded-[4rem]" />}
          <img
            alt="Modern architectural office"
            onLoad={() => setHeroLoaded(true)}
            onError={() => setHeroLoaded(true)}
            className={`w-full h-full object-cover grayscale transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            src={heroOfficeImage}
            width={512}
            height={512}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

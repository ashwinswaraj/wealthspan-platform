import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/react-router-dom";

const StorySection = () => {
  return (
    <section id="story" className="px-8 md:px-20 py-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-left">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface mb-2">Our Story</h2>
          <p className="text-on-surface-variant text-lg">
            The journey from a simple observation to a global infrastructure.
          </p>
        </div>
        <Link
          to="/story"
          className="px-2 py-3 font-headline font-bold text-primary hover:text-primary-container hover:scale-[1.04] active:scale-[0.95] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
        >
          Explore More <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* The Origin Card */}
        <div className="bg-white p-12 rounded-[3.5rem] relative overflow-hidden flex flex-col min-h-[420px]">
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-[3rem]"
            style={{ background: "#E6EDF8" }}
          ></div>
          <div className="relative z-10 flex-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 block">
              THE ORIGIN
            </span>
            <h3 className="text-[2.5rem] font-extrabold text-on-surface mb-8">The Origin</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-[90%]">
              Hiring today is broken. Clients lose nearly 40% of their time searching, filtering,
              and comparing — yet still struggle to find reliable talent, facing delays, weak
              outcomes, and zero accountability. Professionals stay trapped in endless bidding
              cycles, unpaid work, and unstructured chaos. The system rewards effort, not outcomes.
              Jobrio was built to fix this — replacing uncertainty with trust, and friction with
              execution.
            </p>
          </div>
          <Link
            className="relative z-10 text-primary font-bold flex items-center hover:translate-x-1 transition-transform group"
            to="/story#origin"
          >
            Learn more about our journey <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
        {/* The Future Card */}
        <div className="bg-white p-12 rounded-[3.5rem] relative overflow-hidden flex flex-col min-h-[420px]">
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-[3rem]"
            style={{ background: "#E6EFEC" }}
          ></div>
          <div className="relative z-10 flex-1">
            <span className="text-[10px] font-bold text-tertiary-container uppercase tracking-[0.2em] mb-4 block">
              THE VISION
            </span>
            <h3 className="text-[2.5rem] font-extrabold text-on-surface mb-8">The Vision</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-[90%]">
              Jobrio pioneers Work-as-a-Service (WaaS) — a managed layer where execution runs like
              infrastructure. Structured workflows, automated delivery, and built-in quality
              assurance give clients reliable outcomes without the overhead, while professionals
              gain steady, secure work with guaranteed payments and zero chaos. One platform. Every
              task delivered with precision, at scale.
            </p>
          </div>
          <Link
            className="relative z-10 text-tertiary-container font-bold flex items-center hover:translate-x-1 transition-transform group"
            to="/story#vision"
          >
            Explore our roadmap <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StorySection;

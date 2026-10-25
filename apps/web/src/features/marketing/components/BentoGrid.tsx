import { CheckCircle } from "lucide-react";

const BentoGrid = () => {
  return (
    <section className="px-8 md:px-20 py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Clients Card */}
        <div className="md:col-span-7 bg-white border border-outline-variant/30 p-12 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              Clients: Guaranteed <br />
              Outcomes Only.
            </h2>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center text-on-surface-variant font-medium">
                <CheckCircle className="text-tertiary mr-3 w-5 h-5 flex-shrink-0" />
                No manual searching or vetting of professionals.
              </li>
              <li className="flex items-center text-on-surface-variant font-medium">
                <CheckCircle className="text-tertiary mr-3 w-5 h-5 flex-shrink-0" />
                Fully managed quality assurance layer.
              </li>
              <li className="flex items-center text-on-surface-variant font-medium">
                <CheckCircle className="text-tertiary mr-3 w-5 h-5 flex-shrink-0" />
                Automated professional matching & assignment.
              </li>
              <li className="flex items-center text-on-surface-variant font-medium">
                <CheckCircle className="text-tertiary mr-3 w-5 h-5 flex-shrink-0" />
                Secure escrow-based payment protection.
              </li>
              <li className="flex items-center text-on-surface-variant font-medium">
                <CheckCircle className="text-tertiary mr-3 w-5 h-5 flex-shrink-0" />
                Real-time project tracking & collaboration.
              </li>
              <li className="flex items-center text-on-surface-variant font-medium">
                <CheckCircle className="text-tertiary mr-3 w-5 h-5 flex-shrink-0" />
                Built-in dispute resolution & revision support.
              </li>
            </ul>
            <div className="text-primary font-headline font-bold flex items-center cursor-pointer group-hover:translate-x-2 transition-transform">
              Start your first project
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Professionals Card */}
        <div className="md:col-span-5 primary-gradient p-12 rounded-[2rem] shadow-xl text-on-primary">
          <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-on-primary mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold mb-6 leading-tight">
            Professionals: <br />
            Stable Workflow.
          </h2>
          <p className="text-on-primary-container mb-8 leading-relaxed">
            Forget the "race to the bottom" bidding. Jobrio assigns tasks based on your proven
            skills and trial performance.
          </p>
          <div className="space-y-4 bg-white/5 p-6 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-label uppercase tracking-widest opacity-70">
                Status
              </span>
              <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-xs font-bold">
                ACTIVE ASSIGNMENT
              </span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-fixed w-3/4"></div>
            </div>
            <div className="text-xs opacity-60">
              Trial phase successfully completed. Senior status applied.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;

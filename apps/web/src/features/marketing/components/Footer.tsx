import { Lock, BadgeCheck, Zap, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-surface-container-low">
      <div className="border-t border-outline-variant/30" />
      <div className="px-8 md:px-20 py-16">
        {/* Top: Brand + Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-12 border-b border-outline-variant/20 pb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-black text-on-surface font-headline mb-6 tracking-tighter">
              Jobrio
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
              Building the infrastructure for on-demand execution — connecting verified
              professionals with real-world demand through a managed, quality-driven system.
            </p>
          </div>

          <div>
            <h4 className="font-headline font-bold text-on-background mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li>
                <a className="hover:text-primary transition-colors" href="/services">
                  Services
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/services">
                  How It Works
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/services">
                  Pricing
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/services">
                  Integrations
                </a>
              </li>
              <li>
                <span className="text-secondary opacity-70">
                  API <span className="text-[10px] ml-1">(Soon)</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-on-background mb-6">Solutions</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li>
                <a className="hover:text-primary transition-colors" href="/clients">
                  Enterprise
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/clients">
                  Startups
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/clients">
                  Agencies
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/clients">
                  Individuals
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-on-background mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li>
                <a className="hover:text-primary transition-colors" href="/story">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/professionals">
                  Careers
                </a>
              </li>
              <li>
                <span className="text-secondary opacity-70">
                  Blog <span className="text-[10px] ml-1">(Soon)</span>
                </span>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/services">
                  Help Center
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/services">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-on-background mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li>
                <a className="hover:text-primary transition-colors" href="/privacy-policy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/terms-of-service">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/refund-cancellation">
                  Refund & Cancellation
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/escrow-policy">
                  Escrow Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="/dispute-resolution">
                  Dispute Resolution
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust & Compliance Strip */}
        <div className="mb-12 pb-12 border-b border-outline-variant/20">
          <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">
            Trust & Compliance
          </h4>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-on-surface-variant">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-on-surface-variant">
                Verified Professionals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-on-surface-variant">Quality Assurance</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium text-on-surface-variant">
                100% Escrow Protection
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-widest gap-4">
          <span>© 2026 Jobrio Infrastructure. All rights reserved.</span>
          <div className="flex gap-8">
            <a className="hover:text-primary transition-colors" href="/privacy-policy">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="/terms-of-service">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

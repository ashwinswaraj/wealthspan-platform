import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "@/lib/react-router-dom";
import { LogoBriefcase } from "@jobrio/ui/shared/LogoBriefcase";
import { Button } from "@jobrio/ui/design-system";

const navLinks = [
  { label: "Our Home", href: "/" },
  { label: "Our Services", href: "/services" },
  { label: "Our Professionals", href: "/professionals" },
  { label: "Our Top Clients", href: "/clients" },
  { label: "Our Analytics", href: "/analytics" },
  { label: "Our Story", href: "/story" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href.startsWith("/#")) {
      const hash = href.slice(1);
      if (location.pathname === "/") {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/" + hash);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <nav className="bg-surface sticky top-0 z-50 border-b border-surface-container-high">
      <div className="flex justify-between items-center w-full px-8 h-16">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg, #004AC6 0%, #004AC6 50%, #004AC6 100%)",
              boxShadow: "0 10px 25px rgba(0,74,198,0.4)",
            }}
          >
            <LogoBriefcase />
          </div>
          <span className="text-on-background text-3xl font-extrabold font-headline tracking-tighter">
            Jobrio
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-8 font-headline font-bold tracking-tight text-sm">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`transition-colors cursor-pointer ${
                isActive(link.href) ? "text-primary" : "text-secondary hover:text-primary"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ctaWhite"
            size="lg"
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex font-headline hover:scale-[1.04] hover:-translate-y-0.5 duration-150 rounded-full"
          >
            Sign In
          </Button>
          <Button
            variant="cta"
            size="lg"
            onClick={() => navigate("/signup")}
            className="hidden sm:inline-flex font-headline hover:scale-[1.04] hover:-translate-y-0.5 duration-150 rounded-full"
          >
            Sign Up
          </Button>
          <button className="lg:hidden text-on-surface" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-surface border-t border-surface-container-high px-8 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                handleNavClick(e, link.href);
                setMobileOpen(false);
              }}
              className={`block font-headline font-bold text-sm transition-colors ${
                isActive(link.href) ? "text-primary" : "text-secondary hover:text-primary"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-4 pt-4 border-t border-surface-container-high">
            <Button
              variant="ctaWhite"
              size="lg"
              onClick={() => navigate("/login")}
              className="font-headline rounded-full"
            >
              Sign In
            </Button>
            <Button
              variant="cta"
              size="lg"
              onClick={() => navigate("/signup")}
              className="font-headline rounded-full"
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

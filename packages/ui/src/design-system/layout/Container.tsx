import * as React from "react";
import { cn } from "@wealthspan/utils/utils";

/**
 * Two containers, both locked:
 *  - `AuthContainer`: narrow, centered — used ONLY on Sign In / Sign Up /
 *    Forgot Password. Mirrors the current auth shell.
 *  - `DashboardContainer`: full-bleed page padding inside the dashboard shell.
 *    Every authenticated section uses this.
 *
 * Never create a third container.
 */

export const AuthContainer = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "min-h-screen w-full flex items-center justify-center bg-background px-4 py-10",
      className,
    )}
    {...props}
  >
    <div className="w-full max-w-md">{children}</div>
  </div>
);

export const DashboardContainer = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 md:px-10 py-6 space-y-6", className)} {...props}>
    {children}
  </div>
);

export const SectionContainer = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <section className={cn("px-8 md:px-20 py-24", className)} {...props}>
    {children}
  </section>
);

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@wealthspan/utils/utils";

/**
 * Wealthspan Button — canonical.
 *
 * Primary + Secondary are pixel-locked to the Super Admin
 * "Professional Application" review action cluster:
 *   Primary   = Review
 *   Secondary = Approve / Reject / Request Info
 *
 * Do NOT introduce new visual variants outside this file.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-sm hover:opacity-90 active:scale-[0.97]",
        secondary:
          "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container active:scale-[0.97]",
        outline:
          "bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-low active:scale-[0.97]",
        ghost:
          "bg-transparent text-on-surface-variant hover:bg-surface-container-low active:scale-[0.97]",
        danger:
          "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 active:scale-[0.97]",
        success: "bg-tertiary text-on-tertiary shadow-sm hover:opacity-90 active:scale-[0.97]",
        cta: "bg-primary-container text-white hover:opacity-90 active:scale-[0.95]",
        ctaWhite:
          "bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-low active:scale-[0.95]",
      },
      size: {
        sm: "px-3.5 py-1.5 text-xs rounded-full",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-2.5 text-sm rounded-lg",
        xl: "px-10 py-5 text-base rounded-xl",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };

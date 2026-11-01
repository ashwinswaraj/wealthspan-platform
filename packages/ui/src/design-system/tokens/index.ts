/**
 * Wealthspan Design Tokens — SINGLE SOURCE OF TRUTH.
 *
 * Every token here mirrors a value already present in `src/styles.css` or
 * already in production use. Nothing new is introduced.
 *
 * Rules:
 *  - Do NOT add a new value here unless the design lead has approved it.
 *  - Consumers must not hardcode raw values elsewhere — import from `@wealthspan/ui/design-system`.
 */

export const colors = {
  // Brand
  primary: "hsl(var(--primary))",
  primaryContainer: "hsl(var(--primary-container))",
  onPrimary: "hsl(var(--primary-foreground))",
  onPrimaryContainer: "hsl(var(--on-primary-container))",

  secondary: "hsl(var(--secondary))",
  secondaryContainer: "hsl(var(--secondary-container))",
  onSecondary: "hsl(var(--secondary-foreground))",

  tertiary: "hsl(var(--tertiary))",
  tertiaryContainer: "hsl(var(--tertiary-container))",
  onTertiary: "hsl(var(--on-tertiary))",

  // Surface stack
  background: "hsl(var(--background))",
  surface: "hsl(var(--surface))",
  surfaceLowest: "hsl(var(--surface-container-lowest))",
  surfaceLow: "hsl(var(--surface-container-low))",
  surfaceContainer: "hsl(var(--surface-container))",
  surfaceHigh: "hsl(var(--surface-container-high))",
  surfaceHighest: "hsl(var(--surface-container-highest))",
  surfaceVariant: "hsl(var(--surface-variant))",

  // On-surface text
  onSurface: "hsl(var(--on-surface))",
  onSurfaceVariant: "hsl(var(--on-surface-variant))",
  onBackground: "hsl(var(--on-background))",

  // Structural
  outline: "hsl(var(--outline))",
  outlineVariant: "hsl(var(--outline-variant))",
  border: "hsl(var(--border))",
  ring: "hsl(var(--ring))",

  // Feedback
  destructive: "hsl(var(--destructive))",
  onDestructive: "hsl(var(--destructive-foreground))",
} as const;

export const typography = {
  family: {
    headline: "Manrope, sans-serif",
    body: "Inter, sans-serif",
    label: "Inter, sans-serif",
  },
  scale: {
    display: "text-[3.5rem] md:text-[5rem] leading-[1.1] tracking-tight font-extrabold",
    h1: "text-4xl md:text-5xl font-extrabold tracking-tight",
    h2: "text-3xl md:text-4xl font-extrabold tracking-tight",
    h3: "text-2xl font-extrabold tracking-tight",
    h4: "text-xl font-bold",
    bodyLg: "text-lg leading-relaxed",
    body: "text-base leading-normal",
    bodySm: "text-sm leading-normal",
    label: "text-xs font-semibold",
    caption: "text-[10px] font-bold uppercase tracking-wider",
  },
} as const;

/** Tailwind default spacing scale is the only sanctioned spacing. */
export const spacing = {
  section: "px-8 md:px-20 py-24",
  sectionCompact: "px-8 md:px-20 py-16",
  page: "px-6 md:px-10 py-6",
} as const;

export const radius = {
  xs: "rounded-xs", // 2
  sm: "rounded-sm", // 4
  md: "rounded-md", // 6
  lg: "rounded-lg", // 8
  xl: "rounded-xl", // 12
  "2xl": "rounded-2xl", // 16
  "3xl": "rounded-3xl", // 24
  pill: "rounded-full",
} as const;

export const elevation = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  ctaBlue: "cta-blue-glow",
  ctaWhite: "cta-white-glow",
  premiumId: "premium-id-glow",
  elite: "elite-glow",
  verified: "verified-glow",
} as const;

export const opacity = {
  disabled: "opacity-50",
  muted: "opacity-70",
  ghost: "opacity-40",
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export const motion = {
  duration: {
    fast: "duration-150",
    base: "duration-200",
    slow: "duration-300",
  },
  ease: {
    standard: "ease-out",
    entrance: "ease-out",
    exit: "ease-in",
  },
  press: "active:scale-[0.97]",
  hover: "hover:-translate-y-0.5",
  hoverLift:
    "transition-all duration-150 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.95]",
  fadeIn: "animate-[fade-in_0.3s_ease-out]",
  scaleIn: "animate-[scale-in_0.2s_ease-out]",
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export const iconStroke = 1.5;

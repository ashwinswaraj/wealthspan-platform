/**
 * Motion presets — LOCKED.
 * All timings mirror animations already registered in `src/styles.css`.
 */

export const transitions = {
  hover:
    "transition-all duration-150 hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.95]",
  press: "transition-transform active:scale-[0.97]",
  fade: "transition-opacity duration-300 ease-out",
  colors: "transition-colors duration-200 ease-out",
  slow: "transition-all duration-300 ease-out",
} as const;

export const enter = {
  fadeIn: "animate-[fade-in_0.3s_ease-out]",
  scaleIn: "animate-[scale-in_0.2s_ease-out]",
  slideInRight: "animate-[slide-in-right_0.3s_ease-out]",
} as const;

export const exit = {
  fadeOut: "animate-[fade-out_0.3s_ease-out]",
  scaleOut: "animate-[scale-out_0.2s_ease-out]",
  slideOutRight: "animate-[slide-out-right_0.3s_ease-out]",
} as const;

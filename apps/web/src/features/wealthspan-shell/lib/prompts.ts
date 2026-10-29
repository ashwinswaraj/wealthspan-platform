export const WHEEL_PROMPTS = [
  { emoji: "💳", text: "Optimize debt payoff & interest" },
  { emoji: "🎯", text: "Set retirement savings milestones" },
  { emoji: "⚖️", text: "Balance risk vs dividend yield" },
  { emoji: "📈", text: "Track quarterly revenue & profit" },
  { emoji: "📉", text: "Evaluate market risk & volatility" },
  { emoji: "💰", text: "Calculate compound interest & ROI" },
  { emoji: "🪙", text: "Compare crypto & gold hedging" },
] as const;

export const GREETINGS = [
  "Ready to audit your cash flow,",
  "Where shall we optimize today,",
  "Ready to check the numbers,",
  "What's the plan today,",
  "What's on your agenda today,",
] as const;

export const timeGreeting = (hour: number) =>
  hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";

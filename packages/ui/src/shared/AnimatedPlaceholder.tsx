import { useEffect, useState } from "react";

interface Props {
  phrases: string[];
  show: boolean;
  className?: string;
  intervalMs?: number;
}

/**
 * Overlay span that cycles through phrases — slides in from the right,
 * holds, then slides out to the left. Place inside a `relative` container
 * with `left-*` offset (matching the input's left padding).
 */
const AnimatedPlaceholder = ({ phrases, show, className = "", intervalMs = 2800 }: Props) => {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!show || phrases.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setAnimKey((k) => k + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [show, phrases.length, intervalMs]);

  if (!show) return null;

  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 right-0 flex items-center overflow-hidden ${className}`}
    >
      <span
        key={animKey}
        className="inline-block whitespace-nowrap animate-placeholder-cycle"
        style={{ animationDuration: `${intervalMs}ms` }}
      >
        {phrases[index]}
      </span>
    </span>
  );
};

export default AnimatedPlaceholder;

import { useRef, useState } from "react";
import { PROMO_CARDS } from "../lib/promoCards";

/** Where a card sits on the arc for a given distance from the centre: [x, y, scale, tilt, opacity, z]. */
const SLOT: Record<number, [number, number, number, number, number, number]> = {
  0: [0, -12, 1.06, 0, 1, 35],
  1: [104, -2.8064, 0.89, 10.0263, 1, 24],
  2: [208, 24.7744, 0.84, 19.4736, 1, 20],
  3: [312, 70.7424, 0.79, 27.9415, 0.87, 16],
  4: [416, 135.098, 0.78, 35.268, 0.22, 12],
};
const N = PROMO_CARDS.length;

/** The first-screen promo: a fan of finance cards on an arc, the headline, and "Try it". Closes with X or "Try it". */
export function WelcomeCarousel({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(3);
  const prev = useRef<Record<string, number>>({});
  const drag = useRef<number | null>(null);
  const go = (i: number) => setActive(((i % N) + N) % N);

  const faces: { key: string; i: number; d: number }[] = [];
  PROMO_CARDS.forEach((_, i) => {
    let d = (((i - active) % N) + N) % N;
    if (d > 3) d -= N;
    faces.push({ key: `${i}:a`, i, d });
    if (Math.abs(d) === 3) faces.push({ key: `${i}:b`, i, d: d > 0 ? d - N : d + N });
  });

  return (
    <div
      id="promoSection"
      className="w-full max-w-full flex-1 flex flex-col justify-center items-center pt-[56px] sm:pt-[60px] pb-[74px] sm:pb-[80px] transition-colors duration-300 relative select-none overflow-x-hidden"
    >
      <button
        id="closePromoBtn"
        aria-label="Close"
        type="button"
        onClick={onClose}
        className="absolute top-16 sm:top-18 right-1 p-2 text-gray-700 dark:text-gray-300 opacity-80 hover:opacity-100 active:scale-90 transition-all cursor-pointer z-30 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      </button>
      <div className="relative w-full max-w-lg h-50 sm:h-56 flex items-center justify-center mb-3 sm:mb-4 select-none overflow-visible">
        <svg
          className="absolute inset-x-0 top-0 w-full h-full pointer-events-none text-gray-300/90 dark:text-neutral-700/80 z-0"
          viewBox="0 0 500 220"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 30 195 Q 250 128 470 195"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </svg>
        <div
          className="relative w-full h-full flex items-center justify-center overflow-visible select-none z-10 cursor-grab"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(e) => (drag.current = e.clientX)}
          onPointerUp={(e) => {
            if (drag.current !== null && Math.abs(e.clientX - drag.current) > 40) {
              go(active + (e.clientX < drag.current ? 1 : -1));
            }
            drag.current = null;
          }}
        >
          {faces.map(({ key, i, d }) => {
            const [x, y, scale, tilt, opacity, z] = SLOT[Math.abs(d)];
            const sign = d < 0 ? -1 : 1;
            const jumped = key in prev.current && Math.abs(prev.current[key] - d) > 3;
            prev.current[key] = d;
            return (
              <div
                key={key}
                onClick={() => go(i)}
                className="absolute w-[90px] sm:w-[102px] h-[114px] sm:h-[128px] flex items-center justify-center cursor-pointer antialiased select-none"
                style={{
                  transform: `translate3d(${sign * x}px, ${y}px, 0px) scale(${scale}) rotate(${sign * tilt}deg)`,
                  opacity,
                  zIndex: z,
                  transition: jumped ? "none" : "transform 450ms ease, opacity 450ms ease",
                  willChange: "transform",
                }}
                // Trusted static markup copied from the original design; contains no user input.
                dangerouslySetInnerHTML={{ __html: PROMO_CARDS[i].html }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mb-3">
        {PROMO_CARDS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Select ${c.label} (card ${i + 1})`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${i === active ? "w-5 bg-gray-950 dark:bg-white" : "w-1.5 bg-gray-300 dark:bg-neutral-700 hover:bg-gray-400"}`}
          />
        ))}
      </div>
      <div className="text-center max-w-sm mt-1">
        <h1 className="text-[25px] sm:text-[27px] font-bold text-gray-950 dark:text-white tracking-tight leading-[1.2] mb-3">
          AI Financial Operating System for your Wealth
        </h1>
        <p className="text-[15px] font-normal text-[#5d5d5d] dark:text-neutral-400 leading-relaxed px-2">
          Consolidate business project ledgers, track loan EMIs, and unlock intelligent capital
          forecasts with Wealthspan
        </p>
      </div>
      <div className="mt-6">
        <button
          id="tryItBtn"
          type="button"
          onClick={onClose}
          className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black text-[15.5px] font-semibold rounded-full shadow-lg active:scale-95 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer"
        >
          Try it
        </button>
      </div>
    </div>
  );
}

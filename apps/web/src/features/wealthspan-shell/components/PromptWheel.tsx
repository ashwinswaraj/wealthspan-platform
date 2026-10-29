import { useEffect, useRef, useState } from "react";
import { WHEEL_PROMPTS } from "../lib/prompts";

/** Pose of a chip by its distance from the centre (0 = selected), measured from the original design. */
const POSES = [
  { x: 44, y: 0, scale: 1.02, rot: 0, opacity: 1.05 },
  { x: 40.7186, y: 46.3651, scale: 0.978855, rot: 2.8, opacity: 0.933757 },
  { x: 31.3425, y: 86.1152, scale: 0.858739, rot: 5.6, opacity: 0.610767 },
  { x: 17.2093, y: 113.579, scale: 0.72, rot: 8.4, opacity: 0.152544 },
] as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function poseAt(offset: number) {
  const d = Math.min(Math.abs(offset), 3.999);
  const i = Math.floor(d);
  const t = d - i;
  const a = POSES[i];
  const b = POSES[Math.min(i + 1, 3)];
  const sign = offset < 0 ? -1 : 1;
  return {
    x: lerp(a.x, b.x, t),
    y: sign * lerp(a.y, b.y, t),
    scale: lerp(a.scale, b.scale, t),
    rot: sign * lerp(a.rot, b.rot, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}

const ARC = "M 4 2 C 60 2, 110 60, 110 118 C 110 176, 60 234, 4 234";

/** Vertical wheel of prompt chips: drag or swipe to spin, tap a chip to use it. */
export function PromptWheel({ onPick }: { onPick: (text: string) => void }) {
  const n = WHEEL_PROMPTS.length;
  const [pos, setPos] = useState(3); // fractional index of the centred chip
  const drag = useRef<{ y: number; pos: number; moved: boolean } | null>(null);
  const settle = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (settle.current) cancelAnimationFrame(settle.current);
    },
    [],
  );

  const snapTo = (target: number) => {
    if (settle.current) cancelAnimationFrame(settle.current);
    const step = () => {
      setPos((p) => {
        const next = lerp(p, target, 0.22);
        if (Math.abs(next - target) < 0.002) return target;
        settle.current = requestAnimationFrame(step);
        return next;
      });
    };
    settle.current = requestAnimationFrame(step);
  };

  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));

  return (
    <div
      className="relative w-full h-[250px] flex items-center justify-start overflow-visible pt-1 pl-1 select-none z-0 isolate cursor-grab"
      style={{ touchAction: "none", isolation: "isolate" }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { y: e.clientY, pos, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dy = e.clientY - d.y;
        if (Math.abs(dy) > 4) d.moved = true;
        setPos(clamp(d.pos - dy / 46));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (d?.moved) snapTo(Math.round(pos));
      }}
    >
      <svg
        className="absolute left-0 top-1/2 -translate-y-1/2 h-[236px] w-28 pointer-events-none text-gray-200/90 dark:text-neutral-700/80 z-0"
        viewBox="0 0 112 236"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={ARC}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
      </svg>
      {WHEEL_PROMPTS.map((p, i) => {
        const offset = i - pos;
        if (Math.abs(offset) > 3.6) return null;
        const t = poseAt(offset);
        const active = Math.abs(offset) < 0.5;
        return (
          <div
            key={p.text}
            className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-auto"
            style={{
              transform: `translate3d(${t.x}px, ${t.y}px, 0px) scale(${t.scale}) rotate(${t.rot}deg)`,
              opacity: t.opacity,
              zIndex: 10 - Math.round(Math.abs(offset)),
              transformOrigin: "left center",
              willChange: "transform, opacity",
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (drag.current?.moved) return;
                if (active) onPick(p.text);
                else snapTo(i);
              }}
              className={
                active
                  ? "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-left select-none transition-colors duration-150 group bg-white dark:bg-[#1a1d24] text-gray-950 dark:text-white border-2 border-gray-950 dark:border-white shadow-md shadow-black/8 dark:shadow-black/40 hover:scale-[1.01] active:scale-[0.98]"
                  : "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-left select-none transition-colors duration-150 group bg-white/90 dark:bg-[#16181f]/90 hover:bg-white dark:hover:bg-[#1a1d24] text-gray-700 dark:text-gray-300 border border-gray-200/90 dark:border-[#2d323e] shadow-xs hover:border-gray-400 dark:hover:border-neutral-500 active:scale-[0.98]"
              }
            >
              <span
                className={
                  active
                    ? "text-base select-none leading-none transition-transform scale-110"
                    : "text-base select-none leading-none transition-transform group-hover:scale-105"
                }
              >
                {p.emoji}
              </span>
              <span
                className={
                  active
                    ? "text-[14.5px] tracking-tight whitespace-nowrap select-none font-medium text-gray-950 dark:text-white"
                    : "text-[14.5px] tracking-tight whitespace-nowrap select-none font-normal text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                }
              >
                {p.text}
              </span>
              {active ? (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_6px_rgba(37,99,235,0.8)] animate-pulse ml-0.5" />
              ) : null}
            </button>
          </div>
        );
      })}
    </div>
  );
}

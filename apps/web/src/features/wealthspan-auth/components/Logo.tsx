import { useEffect, useMemo, useRef, useState } from "react";

export function WealthspanWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      <span
        className="wealthspan-logo-tile inline-flex shrink-0 items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg"
        aria-hidden="true"
      >
        <svg
          className="h-[90%] w-[90%]"
          viewBox="0 -1.25 100 100"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 68 C 30 25, 70 25, 82 68" strokeWidth="8.75" />
          <path d="M26 62 L 40 76 L 50 48 L 60 76 L 74 62" strokeWidth="9.4" />
          <circle cx="50" cy="22" r="7" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <div className="text-lg xs:text-xl font-bold tracking-tight text-black dark:text-white flex items-baseline select-none">
        <span>Wealth</span>
        <span className="font-normal text-gray-400 dark:text-gray-500">span</span>
      </div>
    </div>
  );
}

const SNAKE_LEN = 47.55;
const M_PATH = "M 12.48 29.76 L 19.2 36.48 L 24 23.04 L 28.8 36.48 L 35.52 29.76";
const ARCH = "M 8.64 32.64 C 14.4 12, 33.6 12, 39.36 32.64";
const ARCH_LEN = 46.82;
const ANGLES = 64;
const M_WOBBLE = [
  M_PATH,
  "M 12.68 30.06 L 19 36.78 L 24.2 23.34 L 28.6 36.18 L 35.72 29.46",
  "M 12.18 29.46 L 19.5 36.18 L 23.7 22.74 L 29.1 36.78 L 35.22 30.06",
  "M 12.58 29.96 L 19.1 36.68 L 24.1 23.24 L 28.7 36.28 L 35.62 29.56",
  M_PATH,
];
const ARCH_WOBBLE = [
  ARCH,
  "M 8.24 32.94 C 14.4 11.5, 33.6 12.5, 39.66 32.34",
  "M 8.94 32.24 C 14.4 12.5, 33.6 11.5, 39.06 33.04",
  "M 8.34 33.04 C 14.4 11.6, 33.6 12.4, 39.76 32.24",
  ARCH,
];

/** Entry/exit "snake" path for a start angle (ported 1:1 from the original login animation). */
function snakePaths(deg: number) {
  const e = (deg * Math.PI) / 180;
  const r = e + Math.PI;
  const n = 340;
  const a = 1.4;
  const i = Math.round(24 + n * Math.cos(e) * a);
  const o = Math.round(24 + n * Math.sin(e));
  const l = Math.round(24 + n * Math.cos(r) * a);
  const u = Math.round(24 + n * Math.sin(r));
  const right = Math.cos(e) >= 0;
  const h = right ? { x: 12.48, y: 29.76 } : { x: 35.52, y: 29.76 };
  const f = 48;
  const m = right ? { x: 18, y: f } : { x: 30, y: f };
  const g = right ? { x: 28, y: f } : { x: 20, y: f };
  const b = M_PATH;
  const v = "M 35.52 29.76 L 28.8 36.48 L 24 23.04 L 19.2 36.48 L 12.48 29.76";
  const y = "L 19.2 36.48 L 24 23.04 L 28.8 36.48 L 35.52 29.76";
  const w = "L 28.8 36.48 L 24 23.04 L 19.2 36.48 L 12.48 29.76";
  const j = Math.round(i * 0.65 + m.x * 0.35);
  const S = Math.round(o * 0.65 + m.y * 0.35);
  const E = Math.round(i * 0.35 + m.x * 0.65);
  const U = Math.round(o * 0.35 + m.y * 0.65);
  const M = m.x - i;
  const F = m.y - o;
  const T = Math.hypot(M, F) || 1;
  const L = -F / T;
  const Q = M / T;
  const I = 14;
  const H = Math.round(i * 0.8 + j * 0.2 + L * I);
  const Y = Math.round(o * 0.8 + S * 0.2 + Q * I);
  const q = Math.round(i * 0.2 + j * 0.8 - L * I);
  const G = Math.round(o * 0.2 + S * 0.8 - Q * I);
  const X = right ? 6 : 42;
  const entry =
    `M ${i} ${o} C ${H} ${Y}, ${q} ${G}, ${j} ${S} C ${Math.round(j + L * I)} ${Math.round(S + Q * I)}, ${Math.round(E - L * I)} ${Math.round(U - Q * I)}, ${E} ${U} C ${Math.round(E + L * 8)} ${Math.round(U + Q * 8)}, ${m.x} ${m.y}, ${m.x} ${m.y} C ${X} 48, ${X} 42, ${h.x} ${h.y} ` +
    (right ? y : w);
  const ne = Math.round(g.x * 0.65 + l * 0.35);
  const le = Math.round(g.y * 0.65 + u * 0.35);
  const V = Math.round(g.x * 0.35 + l * 0.65);
  const pe = Math.round(g.y * 0.35 + u * 0.65);
  const O = l - g.x;
  const R = u - g.y;
  const P = Math.hypot(O, R) || 1;
  const K = -R / P;
  const Z = O / P;
  const de = right ? 42 : 6;
  const exit =
    (right ? b : v) +
    ` C ${de} 42, ${de} 48, ${g.x} ${g.y} C ${g.x} ${g.y}, ${Math.round(ne + K * 8)} ${Math.round(le + Z * 8)}, ${ne} ${le} C ${Math.round(ne - K * I)} ${Math.round(le - Z * I)}, ${Math.round(V + K * I)} ${Math.round(pe + Z * I)}, ${V} ${pe} C ${Math.round(V - K * I)} ${Math.round(pe - Z * I)}, ${Math.round(l * 0.8 + V * 0.2)} ${Math.round(u * 0.8 + pe * 0.2)}, ${l} ${u}`;
  return { entry, exit };
}

type Phase =
  | "snake_m_draw"
  | "arch_draw"
  | "bindu_rise"
  | "wobble_hold"
  | "bindu_return"
  | "arch_disappear"
  | "m_snake_exit"
  | "pause";
const SHOWN: Phase[] = ["arch_draw", "bindu_rise", "wobble_hold", "bindu_return", "arch_disappear"];

/** The big arc mark on the login screen: same looping animation as the original (snake draws the M, arch draws, dot rises, everything wobbles, then it all leaves). */
export function ArcMark({
  sizeClassName = "w-44 h-44 xs:w-52 xs:h-52 sm:w-64 sm:h-64 md:w-72 md:h-72",
}: {
  sizeClassName?: string;
}) {
  const [angle, setAngle] = useState(0);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("snake_m_draw");
  const [go, setGo] = useState(false);
  const [entryLen, setEntryLen] = useState(330);
  const [exitLen, setExitLen] = useState(400);
  const entryRef = useRef<SVGPathElement>(null);
  const exitRef = useRef<SVGPathElement>(null);
  const paths = useMemo(() => snakePaths((angle * 360) / ANGLES), [angle]);

  useEffect(() => {
    setAngle(Math.floor(Math.random() * ANGLES));
  }, []);

  useEffect(() => {
    const el = entryRef.current;
    if (el) {
      const len = el.getTotalLength();
      if (len > SNAKE_LEN) setEntryLen(len - SNAKE_LEN);
    }
    const ex = exitRef.current;
    if (ex) {
      const len = ex.getTotalLength();
      if (len > 0) setExitLen(len);
    }
    setPhase("snake_m_draw");
    setGo(false);
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    const at = (ms: number, p: Phase) => window.setTimeout(() => setPhase(p), ms);
    const timers = [
      at(3600, "arch_draw"),
      at(5200, "bindu_rise"),
      at(6600, "wobble_hold"),
      at(10400, "bindu_return"),
      at(11600, "arch_disappear"),
      at(13000, "m_snake_exit"),
      at(16600, "pause"),
      window.setTimeout(() => {
        setAngle((a) => (a + Math.floor(Math.random() * (ANGLES - 1)) + 1) % ANGLES);
        setRound((r) => r + 1);
      }, 17100),
    ];
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, [round, angle]);

  const wobble = phase === "wobble_hold";
  const shown = SHOWN.includes(phase);
  const archDrawn = phase !== "arch_disappear";
  const binduUp = phase === "bindu_rise" || phase === "wobble_hold";

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div
        className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-neutral-300/40 dark:bg-white/[0.08] blur-3xl pointer-events-none ${wobble ? "ws-glow" : ""}`}
        style={{ opacity: phase === "pause" ? 0 : 0.2, transform: "scale(.95)" }}
      />
      <div
        className={`relative z-10 flex items-center justify-center overflow-visible ${wobble ? "ws-bob" : ""}`}
      >
        <svg
          className={`${sizeClassName} overflow-visible text-black dark:text-white`}
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path ref={entryRef} d={paths.entry} stroke="none" fill="none" opacity="0" />
          <path ref={exitRef} d={paths.exit} stroke="none" fill="none" opacity="0" />
          {phase === "snake_m_draw" ? (
            <path
              d={paths.entry}
              stroke="currentColor"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${SNAKE_LEN} 4000`}
              style={{
                strokeDashoffset: go ? -entryLen : 0,
                transition: go ? "stroke-dashoffset 3.6s cubic-bezier(.25,.1,.25,1)" : "none",
              }}
            />
          ) : null}
          {shown ? (
            <path
              d={M_PATH}
              stroke="currentColor"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                dur="4.2s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;.25;.5;.75;1"
                keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
                values={M_WOBBLE.join(";")}
              />
            </path>
          ) : null}
          {phase === "m_snake_exit" ? (
            <path
              d={paths.exit}
              stroke="currentColor"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${SNAKE_LEN} 4000`}
              style={{
                strokeDashoffset: go ? -exitLen : 0,
                transition: "stroke-dashoffset 3.6s cubic-bezier(.28,.1,.25,1)",
              }}
            />
          ) : null}
          {shown ? (
            <ArchPath drawn={archDrawn} wobble={wobble} disappearing={phase === "arch_disappear"} />
          ) : null}
          {phase === "bindu_rise" || phase === "wobble_hold" || phase === "bindu_return" ? (
            <Bindu up={binduUp} wobble={wobble} returning={phase === "bindu_return"} />
          ) : null}
        </svg>
      </div>
    </div>
  );
}

function ArchPath({
  drawn,
  wobble,
  disappearing,
}: {
  drawn: boolean;
  wobble: boolean;
  disappearing: boolean;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(f);
  }, []);
  const offset = drawn && on ? 0 : ARCH_LEN;
  return (
    <path
      d={ARCH}
      stroke="currentColor"
      strokeWidth="3.36"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${ARCH_LEN} ${ARCH_LEN * 4}`}
      style={{
        strokeDashoffset: offset,
        transition: `stroke-dashoffset ${disappearing ? 1.4 : 1.6}s cubic-bezier(.22,1,.36,1)`,
      }}
    >
      {wobble ? (
        <animate
          attributeName="d"
          dur="3.8s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;.25;.5;.75;1"
          keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
          values={ARCH_WOBBLE.join(";")}
        />
      ) : null}
    </path>
  );
}

function Bindu({ up, wobble, returning }: { up: boolean; wobble: boolean; returning: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(f);
  }, []);
  const lifted = up && on;
  return (
    <g
      style={{
        transform: `translateY(${lifted ? -12.48 : 0}px)`,
        transition: `transform ${returning ? 1.2 : 1.4}s cubic-bezier(.34,1.3,.64,1)`,
      }}
    >
      <circle
        cx="24"
        cy="23.04"
        r="2.16"
        fill="currentColor"
        className={wobble ? "ws-dot" : ""}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: `scale(${lifted ? 1 : 0})`,
          transition: wobble ? undefined : `transform ${returning ? 0.8 : 0.9}s ease`,
        }}
      />
    </g>
  );
}

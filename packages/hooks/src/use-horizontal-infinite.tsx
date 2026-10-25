import { useCallback, useEffect, useRef, useState } from "react";

export function useHorizontalInfinite(total: number, initial = 6, step = 4) {
  const [count, setCount] = useState(Math.min(initial, total));
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setCount((c) => Math.min(total, c + step));
    loadingRef.current = false;
    setLoading(false);
  }, [step, total]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        if (count >= total || loadingRef.current) return;

        const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;
        if (remaining < 240) loadMore();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [count, total, loadMore]);

  return { ref, count, loading, hasMore: count < total };
}

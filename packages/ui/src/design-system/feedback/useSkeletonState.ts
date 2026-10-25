import * as React from "react";

/**
 * useSkeletonState — debounced skeleton visibility for real async data.
 *
 * Pillar 5 (minimum display time):
 *  - if `loading` resolves before `delay` (default 200ms) the skeleton is
 *    never shown at all (no flash-of-skeleton)
 *  - once shown, it stays visible for at least `minDuration` (default 400ms)
 *    so it can never flicker
 *
 * Pillar 6 (error states): pass `error` — the skeleton is hidden immediately
 * so the caller can render an error/retry block instead of a spinner.
 */
export const useSkeletonState = (
  loading: boolean,
  {
    delay = 200,
    minDuration = 400,
    error = null,
  }: { delay?: number; minDuration?: number; error?: unknown } = {},
) => {
  const [visible, setVisible] = React.useState(false);
  const shownAt = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (error) {
      shownAt.current = null;
      setVisible(false);
      return;
    }

    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    if (loading) {
      if (!visible && shownAt.current === null) {
        showTimer = window.setTimeout(() => {
          shownAt.current = Date.now();
          setVisible(true);
        }, delay);
      }
    } else if (visible) {
      const elapsed = shownAt.current ? Date.now() - shownAt.current : 0;
      const remaining = Math.max(0, minDuration - elapsed);
      hideTimer = window.setTimeout(() => {
        shownAt.current = null;
        setVisible(false);
      }, remaining);
    } else {
      shownAt.current = null;
    }

    return () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [loading, visible, delay, minDuration, error]);

  return visible;
};

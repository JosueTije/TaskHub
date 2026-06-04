import { useEffect, useRef } from 'react';

/**
 * Polls `callback` every `intervalMs` milliseconds.
 * - Skips ticks while the browser tab is hidden (Page Visibility API).
 * - Fires immediately when the tab becomes visible again after being hidden.
 * - Uses a ref so the callback always captures the latest closure without
 *   restarting the timer.
 * - Cleans up automatically on unmount.
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  enabled = true,
) {
  const savedCallback = useRef(callback);

  // Keep the ref up-to-date on every render without restarting the interval.
  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, intervalMs);

    // When the user returns to the tab, refresh immediately instead of
    // waiting for the next scheduled tick.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}

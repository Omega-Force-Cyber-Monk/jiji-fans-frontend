"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteSliderOptions {
  /** Number of unique items in the original (un-tripled) list */
  itemCount: number;
  /** Gap between cards in px — must match the CSS gap value */
  gap?: number;
}

interface UseInfiniteSliderReturn {
  trackRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  scrollPrev: () => void;
  scrollNext: () => void;
}

/**
 * useInfiniteSlider
 *
 * Shared hook for infinite-loop horizontal sliders.
 *
 * Strategy:
 *  1. The caller renders its item list tripled: [A, B, A, B, A, B]
 *  2. On mount we snap scroll to the START of the middle block (scrollWidth / 3)
 *  3. On every scroll event we silently jump back to the equivalent position in
 *     the middle block when the user reaches either boundary.
 *  4. Prev / Next buttons scroll exactly ONE card width.
 *
 * The hook measures real card width from the DOM so it works with any responsive
 * card widths — no hardcoded px values needed.
 */
export function useInfiniteSlider({
  itemCount,
  gap = 16,
}: UseInfiniteSliderOptions): UseInfiniteSliderReturn {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Refs to avoid stale closures without triggering re-renders
  const sectionWidthRef = useRef(0); // one copy of the list = scrollWidth / 3
  const cardStepRef = useRef(0);     // exact width of one card inc. gap
  const isWrappingRef = useRef(false);

  // ── Measure + snap to middle block — single effect, deferred to after paint ──
  useEffect(() => {
    const track = trackRef.current;
    if (!track || itemCount === 0) return;

    const measure = () => {
      const section = track.scrollWidth / 3;
      sectionWidthRef.current = section;
      cardStepRef.current = section / itemCount;
    };

    // rAF ensures the tripled DOM is fully painted before we read scrollWidth
    const raf = requestAnimationFrame(() => {
      measure();
      track.style.scrollBehavior = "auto";
      track.scrollLeft = sectionWidthRef.current;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = "smooth";
      });
    });

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  // ── Infinite-wrap: silently teleport to equivalent position in middle copy ───
  const handleScroll = useCallback(() => {
    if (isWrappingRef.current) return;
    const track = trackRef.current;
    if (!track || itemCount === 0) return;

    const w = sectionWidthRef.current;
    if (w === 0) return;

    // Reached the rightmost copy → jump back to middle
    if (track.scrollLeft >= w * 2) {
      isWrappingRef.current = true;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = track.scrollLeft - w;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = "smooth";
        // Keep the guard on just long enough for the browser to paint
        requestAnimationFrame(() => {
          isWrappingRef.current = false;
        });
      });
    }

    // Reached the leftmost copy → jump forward to middle
    if (track.scrollLeft <= 0) {
      isWrappingRef.current = true;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = track.scrollLeft + w;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = "smooth";
        requestAnimationFrame(() => {
          isWrappingRef.current = false;
        });
      });
    }
  }, [itemCount]);

  // ── Scroll exactly one card ───────────────────────────────────────────────────
  const scrollPrev = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = cardStepRef.current || track.clientWidth * 0.25;
    track.scrollBy({ left: -step, behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = cardStepRef.current || track.clientWidth * 0.25;
    track.scrollBy({ left: step, behavior: "smooth" });
  }, []);

  return { trackRef, handleScroll, scrollPrev, scrollNext };
}

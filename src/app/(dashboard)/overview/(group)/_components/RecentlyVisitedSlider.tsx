"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import SliderNavigation from "@/components/ui/SliderNavigation";
import { useGetRecentlyViewedQuery } from "@/redux/features/users/users.api";

// ---------------------------------------------------------------------------
// Card dimensions — keep in sync with the style prop on each card below
// ---------------------------------------------------------------------------
const CARD_WIDTH = 220; // px
const GAP = 12;         // px — matches the gap style

// ---------------------------------------------------------------------------
// Type for one recently-viewed channel entry
// Adjust fields to match the actual API response shape
// ---------------------------------------------------------------------------
interface TRecentChannel {
  _id: string;
  name: string;
  avatar: string;
}

const RecentlyVisitedSlider = () => {
  const { data, isLoading } = useGetRecentlyViewedQuery(undefined);
  const channels: TRecentChannel[] = data?.data?.recentlyViewed ?? [];

  // ── Refs ────────────────────────────────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionW = useRef(0);   // scrollWidth / 3 — one copy of the list
  const cardStep = useRef(0);   // width of one card + gap
  const isWrapping = useRef(false);

  // ── Measure on data change + resize ────────────────────────────────────────
  useEffect(() => {
    const track = trackRef.current;
    if (!track || channels.length === 0) return;

    const measure = () => {
      sectionW.current = track.scrollWidth / 3;
      cardStep.current = sectionW.current / channels.length;
    };

    // rAF ensures the tripled list is fully painted before we measure
    const raf = requestAnimationFrame(() => {
      measure();
      // Snap to middle copy so left AND right are both available
      track.style.scrollBehavior = "auto";
      track.scrollLeft = sectionW.current;
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
  }, [channels.length]);

  // ── Infinite-wrap scroll handler ────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (isWrapping.current) return;
    const track = trackRef.current;
    if (!track) return;
    const w = sectionW.current;
    if (w === 0) return;

    // Reached right boundary — jump back to the middle copy
    if (track.scrollLeft >= w * 2) {
      isWrapping.current = true;
      track.style.scrollBehavior = "auto";
      track.scrollLeft -= w;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = "smooth";
        requestAnimationFrame(() => { isWrapping.current = false; });
      });
    }

    // Reached left boundary — jump forward to the middle copy
    if (track.scrollLeft <= 0) {
      isWrapping.current = true;
      track.style.scrollBehavior = "auto";
      track.scrollLeft += w;
      requestAnimationFrame(() => {
        track.style.scrollBehavior = "smooth";
        requestAnimationFrame(() => { isWrapping.current = false; });
      });
    }
  }, []);

  // ── Nav buttons — scroll exactly one card ───────────────────────────────────
  const scrollPrev = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: -(cardStep.current || CARD_WIDTH + GAP), behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: cardStep.current || CARD_WIDTH + GAP, behavior: "smooth" });
  }, []);

  // ── Render guard ────────────────────────────────────────────────────────────
  if (!isLoading && channels.length === 0) return null;

  const tripled = [...channels, ...channels, ...channels];

  return (
    <div className="space-y-4 pt-6 border-t border-border-primary/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/overview/recently-visited"
          className="flex items-center gap-1 group no-underline outline-none"
          aria-label="See all recently visited channels"
        >
          <h2 className="text-2xl font-semibold text-primary-text group-hover:text-brand-primary transition-colors">
            Recently visited
          </h2>
        </Link>

        <SliderNavigation
          onPrev={scrollPrev}
          onNext={scrollNext}
          size="md"
        />
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto outline-none select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ gap: GAP }}
        onScroll={handleScroll}
      >
        {isLoading
          ? // Loading placeholders — same count so layout doesn't shift
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="shrink-0 h-11 rounded-md bg-secondary-bg animate-pulse"
              style={{ width: CARD_WIDTH }}
            />
          ))
          : tripled.map((channel, index) => (
            <Link
              key={`${channel._id}-${index}`}
              href={`/overview/channels/${channel._id}`}
              className="group flex items-center gap-3 shrink-0 px-3 py-2.5 rounded-md bg-secondary-bg border border-border-primary hover:border-brand-primary/40 transition-all duration-200 no-underline outline-none focus:outline-none"
              style={{ width: CARD_WIDTH }}
              aria-label={`Visit ${channel.name}`}
            >
              {/* Avatar */}
              <div className="relative w-8 h-8 shrink-0 rounded-sm overflow-hidden bg-primary-bg pointer-events-none">
                <Image
                  src={channel.avatar}
                  alt={channel.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>

              {/* Name */}
              <span className="flex-1 text-base font-medium text-primary-text group-hover:text-brand-primary transition-colors truncate">
                {channel.name}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default RecentlyVisitedSlider;

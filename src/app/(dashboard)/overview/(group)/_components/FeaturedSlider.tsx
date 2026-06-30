"use client";

import React from "react";
import ChannelCard from "./ChannelCard";
import SliderNavigation from "@/components/ui/SliderNavigation";
import { useInfiniteSlider } from "@/hooks/useInfiniteSlider";
import type { TChannel } from "@/redux/features/channel/channel.api";

// Gap mirrors gap-3 (12px) on mobile, gap-4 (16px) on sm+
const GAP = 16;

interface FeaturedSliderProps {
  channels: TChannel[];
}

const FeaturedSlider = ({ channels }: FeaturedSliderProps) => {
  const { trackRef, handleScroll, scrollPrev, scrollNext } = useInfiniteSlider({
    itemCount: channels.length,
    gap: GAP,
  });

  if (channels.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-primary-text">
        No featured channels found.
      </div>
    );
  }

  const tripled = [...channels, ...channels, ...channels];

  return (
    <div className="space-y-4 py-6 border-y border-border-primary/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-primary-text">Featured this week</h2>
        <SliderNavigation
          onPrev={scrollPrev}
          onNext={scrollNext}
          size="md"
        />
      </div>

      {/*
        Scroll wrapper — ref & onScroll go here so the hook can read scrollLeft.
        The inner grid uses min-w-full so that percentage-based auto-cols
        are calculated relative to this wrapper's width (= same content area
        as the main grid above), not the viewport.

        auto-cols breakpoints mirror the main grid:
          base     → grid-cols-2  + gap-3(12px) → calc(50%   -  6px)
          sm:      → grid-cols-2  + gap-4(16px) → calc(50%   -  8px)
          md:      → grid-cols-3  + gap-4(16px) → calc(33.33%- 10.67px)
          xl:      → grid-cols-4  + gap-4(16px) → calc(25%   - 12px)
          2xl:     → grid-cols-5  + gap-4(16px) → calc(20%   - 12.8px)
      */}
      <div
        ref={trackRef}
        className="overflow-x-auto pb-4 outline-none select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onScroll={handleScroll}
      >
        <div className="grid grid-flow-col min-w-full gap-3 sm:gap-4 auto-cols-[calc(50%-6px)] sm:auto-cols-[calc(50%-8px)] md:auto-cols-[calc(33.33%-11px)] xl:auto-cols-[calc(25%-12px)] 2xl:auto-cols-[calc(20%-13px)]">
          {tripled.map((channel, index) => (
            <ChannelCard key={`${channel._id}-${index}`} channel={channel} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedSlider;

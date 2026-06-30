"use client";

import React from "react";
import ChannelCard from "./ChannelCard";
import SliderNavigation from "@/components/ui/SliderNavigation";
import { useInfiniteSlider } from "@/hooks/useInfiniteSlider";
import type { TChannel } from "@/redux/features/channel/channel.api";

// Card width matches the responsive classes on each card wrapper below.
// We use the base (mobile) value; the hook measures real rendered width anyway.
const CARD_WIDTH = 200; // px (base — sm:240 md:280)
const GAP = 16;         // px — matches gap-4

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

      {/* Slider track — hidden scrollbar */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto pb-4 outline-none select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ gap: GAP }}
        onScroll={handleScroll}
      >
        {tripled.map((channel, index) => (
          <div
            key={`${channel._id}-${index}`}
            className="w-[150px] sm:w-[200px] lg:w-[280px] shrink-0 py-2"
          >
            <ChannelCard channel={channel} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSlider;

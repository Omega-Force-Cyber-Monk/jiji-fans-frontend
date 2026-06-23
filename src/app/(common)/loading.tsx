import React from "react";
import HeroSectionSkeleton from "@/Common/Skeleton/home/HeroSectionSkeleton";
import PopularChannelsSkeleton from "@/Common/Skeleton/home/PopularChannelsSkeleton";
import MarketingHighlightSkeleton from "@/Common/Skeleton/home/MarketingHighlightSkeleton";
import DesSectionSkeleton from "@/Common/Skeleton/home/DesSectionSkeleton";
import CreatorGridSkeleton from "@/Common/Skeleton/home/CreatorGridSkeleton";
import AppLinkSkeleton from "@/Common/Skeleton/home/AppLinkSkeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <HeroSectionSkeleton />
      <PopularChannelsSkeleton />
      <MarketingHighlightSkeleton />
      <DesSectionSkeleton />
      <CreatorGridSkeleton />
      <AppLinkSkeleton />
    </div>
  );
}

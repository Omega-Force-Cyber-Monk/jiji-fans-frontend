import React from "react";
import Container from "@/components/Container";

export default function PopularChannelsSkeleton() {
  return (
    <Container mClassName="py-12">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-6 xl:mb-10">
        <div className="w-48 h-8 bg-skeleton-bg rounded-md animate-pulse" />
        <div className="hidden md:flex gap-2">
          <div className="w-10 h-10 bg-skeleton-bg rounded-full animate-pulse" />
          <div className="w-10 h-10 bg-skeleton-bg rounded-full animate-pulse" />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8">
        {/* Blank area on the left */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Carousel Area Skeleton */}
        <div className="lg:col-span-4 grid grid-cols-1.3 sm:grid-cols-2 md:grid-cols-2.5 lg:grid-cols-3 gap-5">
          {/* We simulate the visible slides */}
          <div className="aspect-square bg-skeleton-bg rounded-xl animate-pulse" />
          <div className="hidden sm:block aspect-square bg-skeleton-bg rounded-xl animate-pulse" />
          <div className="hidden lg:block aspect-square bg-skeleton-bg rounded-xl animate-pulse" />
        </div>
      </div>
    </Container>
  );
}

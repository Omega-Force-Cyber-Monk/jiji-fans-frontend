import React from "react";
import Container from "@/components/Container";

const MarketingHighlightSkeleton = () => {
  return (
    <Container className="bg-primary-bg py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto px-6 text-center flex flex-col items-center justify-center space-y-4">

        {/* Line 1 Skeleton */}
        <div className="flex flex-wrap justify-center items-center gap-4 w-full">
          <div className="h-12 w-64 bg-skeleton-bg rounded-md"></div>
          <div className="w-32 h-16 bg-skeleton-bg rounded-full"></div>
          <div className="h-12 w-48 bg-skeleton-bg rounded-md"></div>
        </div>

        {/* Line 2 Skeleton */}
        <div className="flex flex-wrap justify-center items-center gap-4 w-full">
          <div className="h-12 w-56 bg-skeleton-bg rounded-md"></div>
          <div className="w-32 h-16 bg-skeleton-bg rounded-full"></div>
          <div className="h-12 w-72 bg-skeleton-bg rounded-md"></div>
        </div>

        {/* Line 3 Skeleton */}
        <div className="h-12 w-3/4 max-w-2xl bg-skeleton-bg rounded-md"></div>

        {/* Line 4 Skeleton */}
        <div className="h-12 w-2/3 max-w-xl bg-skeleton-bg rounded-md"></div>

      </div>
    </Container>
  );
};

export default MarketingHighlightSkeleton;

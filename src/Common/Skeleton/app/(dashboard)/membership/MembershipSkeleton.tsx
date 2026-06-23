import React from "react";

const MembershipSkeleton = () => {
  const skeletonCards = Array.from({ length: 6 });
  const skeletonStats = Array.from({ length: 3 });

  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-x-2">
        <div className="h-4 w-12 bg-skeleton-bg rounded-sm" />
        <span className="text-muted-text">/</span>
        <div className="h-4 w-20 bg-skeleton-bg rounded-sm" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonStats.map((_, index) => (
          <div
            key={index}
            className="bg-secondary-bg border border-border-primary rounded-lg p-4 flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="h-3 w-28 bg-skeleton-bg rounded-sm" />
              <div className="h-6 w-12 bg-skeleton-bg rounded-sm" />
            </div>
            <div className="h-10 w-10 rounded-md bg-skeleton-bg shrink-0" />
          </div>
        ))}
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonCards.map((_, index) => (
          <div
            key={index}
            className="rounded-lg bg-secondary-bg border border-border-primary overflow-hidden flex flex-col justify-between h-[300px]"
          >
            {/* Top Bar Skeleton */}
            <div className="h-14 bg-skeleton-bg/30 w-full relative border-b border-border-primary/50">
              <div className="absolute top-3 right-3 h-5 w-24 bg-skeleton-bg/50 rounded-full" />
            </div>

            {/* Content Body Skeleton */}
            <div className="p-4 pt-0 flex-1 flex flex-col">
              {/* Avatar circle skeleton overlapping top bar */}
              <div className="relative -mt-8 mb-3 h-16 w-16 rounded-full bg-skeleton-bg border-4 border-primary-bg" />

              {/* Info text lines skeleton */}
              <div className="space-y-2.5 flex-1">
                <div className="h-5 w-2/3 bg-skeleton-bg rounded-sm" />
                <div className="space-y-1.5">
                  <div className="h-4 w-full bg-skeleton-bg rounded-sm" />
                  <div className="h-4 w-5/6 bg-skeleton-bg rounded-sm" />
                  <div className="h-4 w-3/4 bg-skeleton-bg rounded-sm" />
                </div>
              </div>
            </div>

            {/* Bottom Actions Skeleton */}
            <div className="p-4 border-t border-border-primary/50 bg-primary-bg/50 flex items-center justify-between gap-3">
              <div className="h-4 w-28 bg-skeleton-bg rounded-sm" />
              <div className="h-9 w-28 bg-skeleton-bg rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipSkeleton;

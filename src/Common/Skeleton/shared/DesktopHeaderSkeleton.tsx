import React from "react";

const DesktopHeaderSkeleton = () => {
  return (
    <div className="w-full sticky top-0 z-40 bg-secondary-bg/95 backdrop-blur-md border-b border-border-primary py-3 animate-pulse">
      <div className="w-full px-4 lg:px-6 flex items-center justify-between gap-4 md:gap-6">
        {/* Left: Mobile Menu Trigger & Search Bar Skeletons */}
        <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
          <div className="h-9 w-9 bg-skeleton-bg rounded-md lg:hidden shrink-0" />
          <div className="h-9 md:h-[46px] w-full max-w-xl bg-skeleton-bg rounded-full" />
        </div>

        {/* Right: Actions Skeletons */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="h-9 w-9 md:h-[46px] md:w-[140px] bg-skeleton-bg rounded-full" />
          <div className="h-9 w-9 md:h-[46px] md:w-[160px] bg-skeleton-bg rounded-full" />
          <div className="size-9 md:size-11 rounded-full bg-skeleton-bg" />
          <div className="size-9 md:size-11 rounded-full bg-skeleton-bg" />
        </div>
      </div>
    </div>
  );
};

export default DesktopHeaderSkeleton;

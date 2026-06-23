import React from "react";

const MetricsCardSkeleton = () => {
  return (
    <div className="bg-secondary-bg rounded-lg border border-border-primary p-6 flex flex-col justify-between animate-pulse h-[150px]">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-32 bg-skeleton-bg rounded-md" />
        <div className="w-11 h-11 bg-skeleton-bg rounded-md" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-9 w-24 bg-skeleton-bg rounded-md" />
        <div className="h-7 w-16 bg-skeleton-bg rounded-md" />
      </div>
    </div>
  );
};

export default MetricsCardSkeleton;

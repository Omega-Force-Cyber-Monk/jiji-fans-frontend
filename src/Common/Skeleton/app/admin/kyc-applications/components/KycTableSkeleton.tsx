import React from "react";

const KycTableSkeleton = () => {
  return (
    <div className="w-full bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
      <div className="border-b border-border-primary px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-secondary-bg">
        <div className="h-8 w-48 bg-skeleton-bg rounded-md animate-pulse" />
        <div className="flex flex-nowrap gap-3 overflow-hidden">
          <div className="h-10 w-40 bg-skeleton-bg rounded-md animate-pulse" />
          <div className="h-10 w-40 bg-skeleton-bg rounded-md animate-pulse" />
          <div className="h-10 w-60 bg-skeleton-bg rounded-md animate-pulse" />
        </div>
      </div>
      <div className="p-6">
        <div className="w-full h-12 bg-skeleton-bg rounded-md animate-pulse mb-4" />
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="w-full h-14 bg-skeleton-bg rounded-md animate-pulse mb-2"
          />
        ))}
      </div>
    </div>
  );
};

export default KycTableSkeleton;

import React from "react";

const EarningsTableSkeleton = () => {
  return (
    <div className="w-full bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
      <div className="border-b border-border-primary px-6 py-4 flex justify-between items-center">
        <div className="h-8 w-48 bg-skeleton-bg rounded-md animate-pulse" />
        <div className="h-10 w-72 bg-skeleton-bg rounded-md animate-pulse" />
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

export default EarningsTableSkeleton;

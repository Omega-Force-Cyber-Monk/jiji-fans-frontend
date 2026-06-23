"use client";

import React from "react";

const RegionalRevenueSplitSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`rounded-xl border border-border-primary bg-secondary-bg shadow-sm p-6 flex flex-col justify-between animate-pulse ${className}`}>
      <div className="space-y-6 flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-between gap-6 border-b border-border-primary/50 pb-4 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <div className="w-48 h-5 bg-skeleton-bg rounded-sm" />
            <div className="w-80 h-3 bg-skeleton-bg rounded-sm" />
          </div>
          <div className="w-5 h-5 bg-skeleton-bg rounded-sm flex-shrink-0" />
        </div>

        <div className="space-y-5 flex-grow mt-4 justify-center flex flex-col">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="w-24 h-3 bg-skeleton-bg rounded-sm" />
                <div className="w-32 h-3 bg-skeleton-bg rounded-sm" />
              </div>
              <div className="w-full h-2 bg-skeleton-bg/40 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionalRevenueSplitSkeleton;

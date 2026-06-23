"use client";

import React from "react";

const FailedTransactionsAreaChartSkeleton = ({ className }: { className?: string }) => {
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

        <div className="h-[280px] w-full flex items-center justify-center flex-grow mt-4">
          <div className="w-full h-full bg-skeleton-bg/30 rounded-md relative overflow-hidden">
            {/* Smooth visual curve layout loading indicator */}
            <div className="absolute inset-0 bg-gradient-to-t from-skeleton-bg/5 to-skeleton-bg/25 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailedTransactionsAreaChartSkeleton;

"use client";

import React from "react";

const AnalyticsMetricCardSkeleton = () => {
  return (
    <div className="p-6 rounded-lg border border-border-primary bg-secondary-bg flex flex-col justify-between h-full shadow-sm animate-pulse">
      <div className="space-y-6">
        {/* Header section with placeholder text */}
        <div className="flex items-center justify-between">
          <div className="w-24 h-3 bg-skeleton-bg rounded-sm" />
          <div className="w-5 h-5 bg-skeleton-bg rounded-sm" />
        </div>

        {/* Main Stats Display Placeholder */}
        <div className="flex items-baseline gap-6">
          <div className="w-32 h-8 bg-skeleton-bg rounded-sm" />
          <div className="w-12 h-4 bg-skeleton-bg rounded-sm" />
        </div>

        <div className="w-48 h-3 bg-skeleton-bg rounded-sm" />

        {/* Placeholder split/progress line */}
        <div className="space-y-6 pt-6 border-t border-border-primary/50">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="w-16 h-3 bg-skeleton-bg rounded-sm" />
              <div className="w-12 h-4 bg-skeleton-bg rounded-sm" />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <div className="w-16 h-3 bg-skeleton-bg rounded-sm" />
              <div className="w-12 h-4 bg-skeleton-bg rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMetricCardSkeleton;

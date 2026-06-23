"use client";

import React from "react";
import AnalyticsMetricCardSkeleton from "./AnalyticsMetricCardSkeleton";

const AnalyticsMetricsGridSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      
      {/* Row 1: 4 cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
        <AnalyticsMetricCardSkeleton />
      </div>

      {/* Row 2: Charts side-by-side skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Users Horizontal Chart Skeleton */}
        <div className="lg:col-span-6 p-6 rounded-lg border border-border-primary bg-secondary-bg space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between">
              <div className="w-36 h-3 bg-skeleton-bg rounded-sm" />
              <div className="w-5 h-5 bg-skeleton-bg rounded-sm" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-24 h-3 bg-skeleton-bg rounded-sm" />
                    <div className="w-12 h-3 bg-skeleton-bg rounded-sm" />
                  </div>
                  <div className="w-full h-8 bg-skeleton-bg rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border-primary/50 pt-4 flex justify-between">
            <div className="w-8 h-2 bg-skeleton-bg rounded-sm" />
            <div className="w-8 h-2 bg-skeleton-bg rounded-sm" />
            <div className="w-8 h-2 bg-skeleton-bg rounded-sm" />
          </div>
        </div>

        {/* Top Performing Categories Skeleton */}
        <div className="lg:col-span-6 p-6 rounded-lg border border-border-primary bg-secondary-bg space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between">
              <div className="w-36 h-3 bg-skeleton-bg rounded-sm" />
              <div className="w-5 h-5 bg-skeleton-bg rounded-sm" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-24 h-3 bg-skeleton-bg rounded-sm" />
                    <div className="w-12 h-3 bg-skeleton-bg rounded-sm" />
                  </div>
                  <div className="w-full h-2 bg-skeleton-bg rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-48 h-3 bg-skeleton-bg rounded-sm mt-4" />
        </div>
      </div>

    </div>
  );
};

export default AnalyticsMetricsGridSkeleton;

"use client";

import React from "react";

const ActiveRegionsMapSkeleton = () => {
  return (
    <div className="w-full p-6 rounded-lg border border-border-primary bg-secondary-bg shadow-sm space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border-primary pb-6">
        <div className="space-y-6">
          <div className="h-6 w-48 bg-skeleton-bg rounded-md" />
          <div className="h-4 w-72 bg-skeleton-bg rounded-md" />
        </div>
        <div className="flex items-center gap-6">
          <div className="h-4 w-24 bg-skeleton-bg rounded-sm" />
          <div className="h-4 w-24 bg-skeleton-bg rounded-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Map Area Skeleton */}
        <div className="lg:col-span-8 w-full h-80 bg-primary-bg rounded-md border border-border-primary flex items-center justify-center p-6">
          <div className="w-full h-full bg-skeleton-bg/25 rounded-md" />
        </div>

        {/* Side Panel Skeleton */}
        <div className="lg:col-span-4 p-6 rounded-md border border-border-primary bg-primary-bg space-y-8">
          <div className="border-b border-border-primary pb-6 space-y-6">
            <div className="h-6 w-24 bg-skeleton-bg rounded-sm" />
            <div className="h-6 w-32 bg-skeleton-bg rounded-md" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-border-primary/50 pb-6">
                <div className="h-4 w-24 bg-skeleton-bg rounded-md" />
                <div className="h-4 w-16 bg-skeleton-bg rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRegionsMapSkeleton;

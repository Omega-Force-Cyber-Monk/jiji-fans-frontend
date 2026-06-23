import React from "react";

const KycSkeleton = () => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 pt-4">
        <div className="h-3 w-10 bg-skeleton-bg rounded-sm" />
        <span className="text-muted-text text-xs">/</span>
        <div className="h-3 w-20 bg-skeleton-bg rounded-sm" />
        <span className="text-muted-text text-xs">/</span>
        <div className="h-3 w-24 bg-skeleton-bg rounded-sm" />
      </div>

      {/* Header title skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-skeleton-bg rounded-md" />
          <div className="h-3 w-72 bg-skeleton-bg rounded-sm" />
        </div>
        <div className="h-10 w-32 bg-skeleton-bg rounded-md shrink-0" />
      </div>

      {/* Status card skeleton */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-skeleton-bg shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-skeleton-bg rounded-sm" />
            <div className="h-6 w-28 bg-skeleton-bg rounded-md" />
          </div>
        </div>
        <div className="h-10 w-36 bg-skeleton-bg rounded-md" />
      </div>

      {/* Timeline steps skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-secondary-bg border border-border-primary">
            <div className="w-10 h-10 rounded-md bg-skeleton-bg shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="h-2 w-8 bg-skeleton-bg rounded-sm" />
              <div className="h-4 w-28 bg-skeleton-bg rounded-sm mt-1.5" />
              <div className="h-3 w-full bg-skeleton-bg rounded-sm mt-1.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
        {/* Form header */}
        <div className="px-4 py-4 border-b border-border-primary space-y-2">
          <div className="h-5 w-40 bg-skeleton-bg rounded-md" />
          <div className="h-3 w-80 bg-skeleton-bg rounded-sm" />
        </div>

        {/* Form body */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Step 1 select skeleton */}
          <div className="space-y-4">
            <div className="h-3 w-36 bg-skeleton-bg rounded-sm" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 w-full bg-skeleton-bg rounded-md" />
              <div className="h-24 w-full bg-skeleton-bg rounded-md" />
            </div>
          </div>

          {/* Dummy Form fields skeleton */}
          <div className="space-y-4 pt-4 border-t border-border-primary">
            <div className="h-3 w-32 bg-skeleton-bg rounded-sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-skeleton-bg rounded-sm" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-skeleton-bg rounded-sm" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
            </div>
          </div>

          {/* Dummy Upload zones skeleton */}
          <div className="space-y-4 pt-4 border-t border-border-primary">
            <div className="h-3 w-40 bg-skeleton-bg rounded-sm" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-56 w-full bg-skeleton-bg rounded-md" />
              <div className="h-56 w-full bg-skeleton-bg rounded-md" />
              <div className="h-56 w-full bg-skeleton-bg rounded-md" />
            </div>
          </div>

          <div className="h-10 w-full bg-skeleton-bg rounded-md pt-4" />
        </div>
      </div>
    </div>
  );
};

export default KycSkeleton;

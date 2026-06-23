import React from "react";

const BecomeCreatorSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-x-2">
        <div className="h-4 w-12 bg-skeleton-bg rounded-sm" />
        <span className="text-muted-text">/</span>
        <div className="h-4 w-24 bg-skeleton-bg rounded-sm" />
      </div>

      {/* Hero Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-skeleton-bg rounded-md" />
        <div className="h-4 w-96 bg-skeleton-bg rounded-md" />
      </div>

      {/* Main Creation Card Skeleton */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
        {/* Mock Live Preview Area Skeleton */}
        <div className="relative bg-primary-bg/40 border-b border-border-primary/50 pb-6">
          {/* Mock Header Cover Banner (Fixed Widescreen Standard 2560x1440 YouTube Aspect) */}
          <div className="w-full h-[450px] bg-skeleton-bg relative overflow-hidden" />

          {/* Profile Details Overlap */}
          <div className="relative px-6">
            {/* User Avatar Circle */}
            <div className="absolute -top-10 left-6 h-24 w-24 rounded-full bg-skeleton-bg border-4 border-secondary-bg" />

            {/* Overlap Line - Upload Buttons (Left & Right Boxes with tight inline padding) */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div className="pl-28">
                <div className="h-8 w-28 bg-skeleton-bg rounded-full" />
              </div>
              <div className="h-8 w-36 bg-skeleton-bg rounded-full" />
            </div>

            {/* Profile Info Details with Category Pill, Name, Username and Membership mock */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-20 bg-skeleton-bg rounded-md" />
                <div className="space-y-1">
                  <div className="h-7 w-56 bg-skeleton-bg rounded-sm" />
                  <div className="h-4.5 w-32 bg-skeleton-bg rounded-sm" />
                </div>
              </div>
              <div className="h-9 w-36 bg-skeleton-bg rounded-full" />
            </div>
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-skeleton-bg rounded-sm" />
              <div className="h-10 w-full bg-skeleton-bg rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-skeleton-bg rounded-sm" />
              <div className="h-10 w-full bg-skeleton-bg rounded-md" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-4 w-20 bg-skeleton-bg rounded-sm" />
            <div className="h-10 w-full bg-skeleton-bg rounded-md" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-28 bg-skeleton-bg rounded-sm" />
            <div className="h-20 w-full bg-skeleton-bg rounded-md" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-24 bg-skeleton-bg rounded-sm" />
            <div className="h-32 w-full bg-skeleton-bg rounded-md" />
          </div>

          <div className="h-12 w-full bg-skeleton-bg rounded-md mt-4" />
        </div>
      </div>
    </div>
  );
};

export default BecomeCreatorSkeleton;

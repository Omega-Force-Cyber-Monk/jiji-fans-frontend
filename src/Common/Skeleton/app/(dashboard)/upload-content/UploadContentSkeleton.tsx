import React from "react";
import SectionContainer from "@/components/ui/SectionContainer";

const UploadContentSkeleton = () => {
  return (
    <SectionContainer className="mt-6">
      {/* Page Heading Skeleton */}
      <div className="h-10 w-48 bg-skeleton-bg rounded-md mb-6 animate-pulse" />
      
      {/* Form Card Skeleton */}
      <div className="bg-secondary-bg p-8 rounded-lg border border-border-primary space-y-6">
        {/* URL Field */}
        <div className="space-y-2">
          <div className="h-5 w-32 bg-skeleton-bg rounded-sm animate-pulse" />
          <div className="h-12 w-full bg-skeleton-bg/50 rounded-md animate-pulse" />
        </div>
        
        {/* Title Field */}
        <div className="space-y-2">
          <div className="h-5 w-32 bg-skeleton-bg rounded-sm animate-pulse" />
          <div className="h-12 w-full bg-skeleton-bg/50 rounded-md animate-pulse" />
        </div>
        
        {/* Tier Field */}
        <div className="space-y-2">
          <div className="h-5 w-40 bg-skeleton-bg rounded-sm animate-pulse" />
          <div className="h-12 w-full bg-skeleton-bg/50 rounded-md animate-pulse" />
        </div>
        
        {/* Description Field */}
        <div className="space-y-2">
          <div className="h-5 w-48 bg-skeleton-bg rounded-sm animate-pulse" />
          <div className="h-32 w-full bg-skeleton-bg/50 rounded-md animate-pulse" />
        </div>
        
        {/* Button */}
        <div className="flex justify-center pt-4">
          <div className="h-12 w-full bg-skeleton-bg rounded-md animate-pulse" />
        </div>
      </div>
    </SectionContainer>
  );
};

export default UploadContentSkeleton;

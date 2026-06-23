import React from "react";
import SectionContainer from "@/components/ui/SectionContainer";

export default function AppLinkSkeleton() {
  return (
    <section className="relative w-full min-h-[600px] overflow-hidden mt-12 bg-skeleton-bg animate-pulse">
      {/* Content Container */}
      <div className="relative z-20 flex items-center justify-center min-h-[600px] p-6">
        <SectionContainer className="flex flex-col lg:flex-row items-center gap-12 bg-secondary-bg/10 backdrop-blur-md rounded-lg border border-border-primary p-6 md:p-12">
          
          {/* Left Side: Phone Mockup Skeleton */}
          <div className="w-full lg:w-5/12 flex justify-center order-2 lg:order-1">
            <div className="w-64 sm:w-72 aspect-[9/19.5] bg-skeleton-bg rounded-[40px]" />
          </div>
          
          {/* Content Skeleton */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6 flex-1 order-1 lg:order-2">
            <div className="w-14 h-14 bg-skeleton-bg rounded-md" />
            <div className="h-10 bg-skeleton-bg rounded-md w-3/4" />
            <div className="h-5 bg-skeleton-bg rounded-md w-full" />
            <div className="h-5 bg-skeleton-bg rounded-md w-2/3" />
            
            {/* App Store Buttons Box Skeleton */}
            <div className="bg-secondary-bg/10 rounded-md p-6 flex flex-col gap-6 mt-6 max-w-md">
              <div className="h-4 bg-skeleton-bg rounded-md w-1/4" />
              <div className="flex gap-6 items-center">
                <div className="h-12 bg-skeleton-bg rounded-md flex-1" />
                <div className="h-12 bg-skeleton-bg rounded-md flex-1" />
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    </section>
  );
}

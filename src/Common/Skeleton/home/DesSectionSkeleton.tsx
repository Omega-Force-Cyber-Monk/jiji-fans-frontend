import React from "react";
import Container from "@/components/Container";

const DesSectionSkeleton = () => {
  return (
    <Container className="bg-primary-bg py-16 lg:py-16 overflow-hidden">
      <div className="w-full">
        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          
          {/* Responsive Skeleton Button Overlay — visible only on xl and larger */}
          <div className="hidden xl:absolute xl:top-1/2 xl:left-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 z-10 h-16 w-[470px] bg-skeleton-bg rounded-md"></div>

          {/* Card Skeleton 1 (col-span-2, xl:h-96) */}
          <div className="flex flex-col bg-secondary-bg rounded-lg border border-border-primary overflow-hidden md:col-span-2 xl:h-96">
            <div className="flex flex-col h-full md:flex-row">
              <div className="w-full md:w-1/2 h-64 md:h-full bg-skeleton-bg border-b md:border-b-0 md:border-r border-border-primary"></div>
              <div className="p-8 flex flex-col flex-1 justify-center space-y-6 md:w-1/2">
                <div className="w-12 h-1 bg-skeleton-bg rounded-full"></div>
                <div className="w-3/4 h-8 bg-skeleton-bg rounded-md"></div>
                <div className="space-y-6">
                  <div className="w-full h-4 bg-skeleton-bg rounded-sm"></div>
                  <div className="w-2/3 h-4 bg-skeleton-bg rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Skeleton 2 (col-span-1) */}
          <div className="flex flex-col bg-secondary-bg rounded-lg border border-border-primary overflow-hidden md:col-span-1">
            <div className="w-full h-64 bg-skeleton-bg border-b border-border-primary"></div>
            <div className="p-8 flex flex-col flex-1 justify-center space-y-6">
              <div className="w-12 h-1 bg-skeleton-bg rounded-full"></div>
              <div className="w-3/4 h-8 bg-skeleton-bg rounded-md"></div>
              <div className="space-y-6">
                <div className="w-full h-4 bg-skeleton-bg rounded-sm"></div>
                <div className="w-2/3 h-4 bg-skeleton-bg rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Card Skeleton 3 (col-span-1, xl:-mt-22) */}
          <div className="flex flex-col bg-secondary-bg rounded-lg border border-border-primary overflow-hidden md:col-span-1 xl:-mt-22">
            <div className="w-full h-64 bg-skeleton-bg border-b border-border-primary"></div>
            <div className="p-8 flex flex-col flex-1 justify-center space-y-6">
              <div className="w-12 h-1 bg-skeleton-bg rounded-full"></div>
              <div className="w-3/4 h-8 bg-skeleton-bg rounded-md"></div>
              <div className="space-y-6">
                <div className="w-full h-4 bg-skeleton-bg rounded-sm"></div>
                <div className="w-2/3 h-4 bg-skeleton-bg rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Card Skeleton 4 (col-span-2, xl:h-96) */}
          <div className="flex flex-col bg-secondary-bg rounded-lg border border-border-primary overflow-hidden md:col-span-2 xl:h-96">
            <div className="flex flex-col h-full md:flex-row-reverse">
              <div className="w-full md:w-1/2 h-64 md:h-full bg-skeleton-bg border-b md:border-b-0 md:border-l border-border-primary"></div>
              <div className="p-8 flex flex-col flex-1 justify-center space-y-6 md:w-1/2">
                <div className="w-12 h-1 bg-skeleton-bg rounded-full"></div>
                <div className="w-3/4 h-8 bg-skeleton-bg rounded-md"></div>
                <div className="space-y-6">
                  <div className="w-full h-4 bg-skeleton-bg rounded-sm"></div>
                  <div className="w-2/3 h-4 bg-skeleton-bg rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Container>
  );
};

export default DesSectionSkeleton;

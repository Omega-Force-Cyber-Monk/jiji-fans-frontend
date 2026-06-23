"use client";

import React from "react";
import SectionContainer from "@/components/ui/SectionContainer";
import StatusSealSkeleton from "./StatusSealSkeleton";

export default function ChannelStatusGuardSkeleton() {
  return (
    <main className="min-h-[70vh] w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <SectionContainer className="flex justify-center items-center">
        <div className="w-full flex flex-col items-center justify-center">
          {/* Circular Stamp Skeleton */}
          <StatusSealSkeleton />

          {/* Title Skeleton */}
          <div className="h-8 w-64 sm:w-80 bg-skeleton-bg rounded-md mb-4 animate-pulse" />

          {/* Description Skeleton */}
          <div className="w-full max-w-2xl flex flex-col gap-2 items-center">
            <div className="h-4 w-full bg-skeleton-bg rounded-sm animate-pulse" />
            <div className="h-4 w-5/6 bg-skeleton-bg rounded-sm animate-pulse" />
            <div className="h-4 w-4/6 bg-skeleton-bg rounded-sm animate-pulse" />
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}

"use client";

import React from "react";
import SectionContainer from "@/components/ui/SectionContainer";

export default function SubscriberSkeleton() {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-32 bg-skeleton-bg rounded-sm mb-4 animate-pulse" />

      {/* Header Card Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary-bg border border-border-primary rounded-lg p-6 animate-pulse">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-44 bg-skeleton-bg rounded-md" />
            <div className="h-6 w-20 bg-skeleton-bg rounded-md" />
          </div>
          <div className="h-4 w-72 sm:w-96 bg-skeleton-bg rounded-sm" />
        </div>
        <div className="h-10 w-full sm:w-72 bg-skeleton-bg rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4 rounded-lg bg-primary-bg border border-border-primary p-6 mt-6">
        {skeletonRows.map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-md border border-border-primary bg-secondary-bg p-4 lg:grid-cols-[1.5fr_1.1fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-skeleton-bg" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-skeleton-bg rounded-sm" />
              </div>
            </div>
            <div className="h-4 w-40 bg-skeleton-bg rounded-sm" />
            <div className="h-4 w-20 bg-skeleton-bg rounded-sm" />
            <div className="h-6 w-16 bg-skeleton-bg rounded-md justify-self-center" />
            <div className="h-4 w-20 bg-skeleton-bg rounded-sm justify-self-center" />
            <div className="h-4 w-20 bg-skeleton-bg rounded-sm justify-self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import PageHeading from "@/components/ui/PageHeading";
import MetricsCardSkeleton from "@/Common/Skeleton/components/dashboard/MetricsCardSkeleton";

const Loading = () => {
  return (
    <div className="space-y-8 animate-pulse w-full">
      <PageHeading title="Overview" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <MetricsCardSkeleton />
        <MetricsCardSkeleton />
        <MetricsCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="rounded-lg border border-border-primary bg-secondary-bg p-6 h-[400px] flex flex-col gap-6">
          <div className="h-8 w-48 bg-skeleton-bg rounded-md" />
          <div className="h-full w-full bg-skeleton-bg rounded-md" />
        </div>

        <div className="rounded-lg border border-border-primary bg-secondary-bg p-6 h-[300px] flex flex-col gap-6">
          <div className="h-8 w-48 bg-skeleton-bg rounded-md" />
          <div className="h-full w-full bg-skeleton-bg rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default Loading;

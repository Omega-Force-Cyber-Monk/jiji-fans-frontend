import React from "react";
import EarningsStatsSkeleton from "./components/EarningsStatsSkeleton";
import EarningsTableSkeleton from "./components/EarningsTableSkeleton";
import SectionContainer from "@/components/ui/SectionContainer";

const EarningsLayoutSkeleton = () => {
  return (
    <div className="py-6 space-y-8">
      <div className="space-y-4">
        <div className="h-6 w-48 bg-skeleton-bg rounded-md animate-pulse" />
      </div>
      <EarningsStatsSkeleton />
      <EarningsTableSkeleton />
    </div>
  );
};

export default EarningsLayoutSkeleton;

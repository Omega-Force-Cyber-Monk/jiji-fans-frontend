import React from "react";
import MetricsCardSkeleton from "@/Common/Skeleton/components/dashboard/MetricsCardSkeleton";

const EarningsStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((item) => (
        <MetricsCardSkeleton key={item} />
      ))}
    </div>
  );
};

export default EarningsStatsSkeleton;

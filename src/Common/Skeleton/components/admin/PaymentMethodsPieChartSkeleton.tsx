"use client";

import React from "react";

const PaymentMethodsPieChartSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`rounded-xl border border-border-primary bg-secondary-bg shadow-sm p-6 flex flex-col justify-between animate-pulse ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-6 border-b border-border-primary/50 pb-4">
          <div className="flex flex-col gap-2">
            <div className="w-36 h-5 bg-skeleton-bg rounded-sm" />
            <div className="w-64 h-3 bg-skeleton-bg rounded-sm" />
          </div>
          <div className="w-5 h-5 bg-skeleton-bg rounded-sm flex-shrink-0" />
        </div>

        <div className="h-[320px] w-full flex justify-center items-center">
          <div className="w-44 h-44 rounded-full bg-skeleton-bg flex items-center justify-center" />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsPieChartSkeleton;

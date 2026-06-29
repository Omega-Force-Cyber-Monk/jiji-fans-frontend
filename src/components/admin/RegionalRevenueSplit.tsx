"use client";

import React from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useCountryMarketShareQuery } from "@/redux/features/adminHome/adminHome.api";

const COLORS = ["bg-[#00E3A5]", "bg-[#3B82F6]", "bg-[#A855F7]", "bg-muted-text/30"];

const RegionalRevenueSplit = ({ className }: { className?: string }) => {
  const { data: marketData, isLoading } = useCountryMarketShareQuery({ period: "month" });

  const listData = React.useMemo(() => {
    if (!marketData?.countries || marketData.countries.length === 0) {
      return [
        { label: "Kenya (KES)", value: "$1,339,200", share: "54% share", percentage: 54, color: "bg-[#00E3A5]" },
        { label: "Nigeria (NGN)", value: "$644,800", share: "26% share", percentage: 26, color: "bg-[#3B82F6]" },
        { label: "Uganda (UGX)", value: "$297,600", share: "12% share", percentage: 12, color: "bg-[#A855F7]" },
        { label: "Others (USD/EUR)", value: "$198,400", share: "8% share", percentage: 8, color: "bg-muted-text/30" },
      ];
    }
    return marketData.countries.map((item: any, idx: number) => ({
      label: `${item.country} (${item.countryCode})`,
      value: `$${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      share: `${item.percentage.toFixed(0)}% share`,
      percentage: item.percentage,
      color: COLORS[idx % COLORS.length],
    }));
  }, [marketData]);

  return (
    <div className={`rounded-xl border border-border-primary bg-secondary-bg shadow-sm p-6 flex flex-col justify-between ${className}`}>
      <div className="space-y-6 flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-between gap-6 border-b border-border-primary/50 pb-4 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <h4 className="text-xl font-bold text-primary-text">Regional Revenue Split</h4>
            <p className="text-sm text-muted-text font-normal">
              Revenue distribution split across global currencies and active regions.
            </p>
          </div>
          <GlobeAltIcon className="text-muted-text w-5 h-5 flex-shrink-0" />
        </div>

        {/* Premium list representation with dynamic mini horizontal progress gauges */}
        <div className="space-y-5 flex-grow mt-4 justify-start flex flex-col">
          {listData.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-secondary-text">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary-text">{item.value}</span>
                  <span className="text-sm text-muted-text font-normal">({item.share})</span>
                </div>
              </div>
              <div className="w-full h-2 bg-secondary-bg border border-border-primary/30 rounded-md overflow-hidden">
                <div
                  className={`h-full rounded-r-sm ${item.color} transition-all duration-700`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionalRevenueSplit;
export { RegionalRevenueSplit };

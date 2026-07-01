"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import { useCountryMarketShareQuery } from "@/redux/features/adminHome/adminHome.api";
import { Skeleton } from "antd";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const CountryMarketShareChart = ({ className }: { className?: string }) => {
  const { data: marketShareData, isLoading, isError } = useCountryMarketShareQuery(undefined);

  const chartData = useMemo(() => {
    const countries = marketShareData?.countries || [];
    return countries.map((item: any) => ({
      name: item.country || item.countryCode || "Unknown",
      value: item.amount || 0,
      percentage: item.percentage || 0,
      transactions: item.transactionCount || 0,
    }));
  }, [marketShareData]);

  const summary = marketShareData?.summary || {
    totalAmount: 0,
    totalCountries: 0,
    totalTransactions: 0,
  };

  if (isError) {
    return (
      <div className={`rounded-xl border border-border-primary bg-secondary-bg p-6 h-[380px] flex flex-col justify-center items-center text-error ${className}`}>
        Failed to load country market share. Please try again.
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col justify-between ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between gap-6 border-b border-border-primary/50 pb-4 mb-4 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-primary-text">Country Market Share</h3>
            {isLoading ? (
              <Skeleton.Button active size="small" className="!w-24 !h-6" />
            ) : (
              <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                ${summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-text font-normal mt-0.5">
            Revenue distribution by active purchasing countries
          </p>
        </div>
        <GlobeAltIcon className="text-muted-text w-5 h-5 flex-shrink-0" />
      </div>

      {/* Chart Representation */}
      {isLoading ? (
        <div className="w-full flex-grow min-h-[250px] flex items-center justify-center">
          <Skeleton active paragraph={{ rows: 6 }} title={false} />
        </div>
      ) : chartData.length === 0 || summary.totalTransactions === 0 ? (
        <div className="w-full flex-grow min-h-[250px] flex flex-col items-center justify-center border border-dashed border-border-primary/50 rounded-lg p-6 text-center">
          <GlobeAltIcon className="w-10 h-10 text-muted-text/40 mb-2" />
          <p className="text-sm font-medium text-secondary-text">No market share data available</p>
          <p className="text-xs text-muted-text mt-1">There are no transactions recorded yet.</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray=""
                stroke="#2D2D2D"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                tickFormatter={(value: number) =>
                  value >= 1000
                    ? `$${(value / 1000).toFixed(1)}K`
                    : `$${value}`
                }
              />
              <Tooltip
                content={
                  <CustomTooltip />
                }
              />
              <Bar
                dataKey="value"
                fill="#16B989"
                barSize={28}
                activeBar={
                  <Rectangle
                    fill="#16B989"
                    stroke="#00D698"
                    strokeWidth={1}
                  />
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-primary-bg/95 p-3 rounded-lg shadow-xl border border-border-primary min-w-[150px] backdrop-blur-sm space-y-1.5">
        <p className="text-brand-secondary font-bold text-sm border-b border-border-primary/50 pb-1">{label}</p>
        <div className="text-xs text-secondary-text space-y-0.5">
          <p>
            Revenue: <strong className="text-primary-text">${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </p>
          <p>
            Share: <strong className="text-success">{data.percentage}%</strong>
          </p>
          <p>
            Transactions: <strong className="text-primary-text">{data.transactions}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default CountryMarketShareChart;
export { CountryMarketShareChart };

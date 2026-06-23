"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface SplitData {
  labelA: string;
  valueA: string;
  labelB: string;
  valueB: string;
  ratioA: number; // percentage of A (0 to 100)
}

interface ListDataItem {
  label: string;
  value: string;
  percentage: number;
}

interface AnalyticsMetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  type?: "simple" | "split" | "list" | "progress" | "pie";
  splitData?: SplitData;
  listData?: ListDataItem[];
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

const AnalyticsMetricCard = ({
  title,
  value,
  subValue,
  type = "simple",
  splitData,
  listData,
  trend,
  icon,
}: AnalyticsMetricCardProps) => {
  return (
    <div className="p-6 rounded-lg border border-border-primary bg-secondary-bg flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-6">
        {/* Header section of card */}
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm font-semibold text-muted-text uppercase tracking-wider">
            {title}
          </span>
          {icon && <div className="text-muted-text w-5 h-5 flex-shrink-0">{icon}</div>}
        </div>

        {/* Main Stats Display */}
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-semibold text-primary-text">{value}</span>
          {trend && (
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-sm ${trend.isPositive
                ? "text-success bg-success/10"
                : "text-error bg-error/10"
                }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        {subValue && (
          <p className="text-sm text-muted-text font-normal">{subValue}</p>
        )}

        {/* Conditional layouts based on analytic types from the requirements */}
        {type === "split" && splitData && (
          <div className="space-y-6 pt-6 border-t border-border-primary/50">

            {/* Data split values */}
            <div className="grid grid-cols-2 gap-6 text-sm font-normal">
              <div className="space-y-2">
                <p className="text-muted-text text-sm flex items-center gap-2">
                  {splitData.labelA}
                </p>
                <p className="font-semibold text-sm text-primary-text">{splitData.valueA}</p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-muted-text text-sm flex items-center justify-end gap-2">
                  {splitData.labelB}
                </p>
                <p className="font-semibold text-sm text-primary-text">{splitData.valueB}</p>
              </div>
            </div>
          </div>
        )}

        {type === "progress" && splitData && (
          <div className="space-y-6 pt-6 border-t border-border-primary/50">

            <div className="flex justify-between items-center text-sm font-normal">
              <span className="text-muted-text">{splitData.labelA}</span>
              <span className="font-semibold text-primary-text">{splitData.valueA}</span>
            </div>
          </div>
        )}

        {type === "list" && listData && (
          <div className="space-y-6 pt-6 border-t border-border-primary/50">
            {listData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-normal">
                  <span className="text-secondary-text">{item.label}</span>
                  <span className="font-semibold text-primary-text">{item.value}</span>
                </div>

              </div>
            ))}
          </div>
        )}

        {type === "pie" && listData && (
          <div className="pt-6 border-t border-border-primary/50 flex flex-col justify-center items-center h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={listData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={4}
                  dataKey="percentage"
                  nameKey="label"
                >
                  {listData.map((entry, index) => {
                    const colors = ["#00E3A5", "#A855F7", "#F59E0B", "#9CA3AF"];
                    return (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2D2D2D",
                    borderRadius: "6px",
                    color: "#F9FAFB",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom premium legend table */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm font-medium w-full">
              {listData.map((item, idx) => {
                const colors = ["#00E3A5", "#A855F7", "#F59E0B", "#9CA3AF"];
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                    <span className="text-secondary-text truncate max-w-[80px]">{item.label}</span>
                    <span className="text-primary-text font-semibold ml-auto">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsMetricCard;

"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

// Mock data representing a continuous log of failed transactions over months
const failedTransactionsData = [
  { month: "Jan", failures: 165 },
  { month: "Feb", failures: 142 },
  { month: "Mar", failures: 188 },
  { month: "Apr", failures: 120 },
  { month: "May", failures: 95 },
  { month: "Jun", failures: 110 },
  { month: "Jul", failures: 85 },
  { month: "Aug", failures: 72 },
  { month: "Sep", failures: 64 },
  { month: "Oct", failures: 55 },
  { month: "Nov", failures: 42 },
  { month: "Dec", failures: 28 },
];

const FailedTransactionsAreaChart = ({ className }: { className?: string }) => {
  return (
    <div className={`rounded-xl border border-border-primary bg-secondary-bg shadow-sm p-6 flex flex-col justify-between ${className}`}>
      <div className="space-y-6 flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-between gap-6 border-b border-border-primary/50 pb-4 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold text-primary-text">Failed Transactions Log</h4>
              <span className="bg-red-500/10 text-red-500 text-sm font-semibold px-2 py-0.5 rounded-sm">
                -4.2% Decr.
              </span>
            </div>
            <p className="text-sm text-muted-text font-normal">
              Continuous failure log trend showing systematic checkout dropouts and errors.
            </p>
          </div>
          <ExclamationCircleIcon className="text-muted-text w-5 h-5 flex-shrink-0" />
        </div>

        {/* Dynamic smooth area chart representation */}
        <div className="h-[280px] w-full flex items-center justify-center flex-grow mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={failedTransactionsData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {/* Sleek red gradient mapping failure metrics */}
                <linearGradient id="failureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray=""
                stroke="#2D2D2D"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2D2D2D",
                  borderRadius: "6px",
                  color: "#F9FAFB",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value} Failures`, "Log"]}
              />
              <Area
                type="monotone"
                dataKey="failures"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#failureGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FailedTransactionsAreaChart;
export { FailedTransactionsAreaChart };

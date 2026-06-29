/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { DatePicker, DatePickerProps } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { TooltipProps } from "recharts";
import { cn } from "../../utils/cn";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsStatusQuery } from "@/redux/features/adminHome/adminHome.api";
import { TUniObject } from "@/types";
import LoaderWraperComp from "../LoaderWraperComp";

const chart = [
  { month: "Jan", value: 5 },
  { month: "Feb", value: 8.5 },
  { month: "Mar", value: 4 },
  { month: "Apr", value: 7 },
  { month: "May", value: 4 },
  { month: "Jun", value: 6 },
  { month: "Jul", value: 7 },
  { month: "Aug", value: 2 },
  { month: "Sep", value: 2 },
  { month: "Oct", value: 2 },
  { month: "Nov", value: 5 },
  { month: "Dec", value: 8 },
];

const ViewsRatioChart = ({ className }: { className?: string }) => {
  const [cartYear, setCartYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError, error } = useAnalyticsStatusQuery([
    { name: "year", value: cartYear.toString() },
  ]);
  const onChange: DatePickerProps["onChange"] = (_date, dateString) => {
    setCartYear(new Date(dateString as string).getFullYear());
  };
  // console.log(data)
  return (
    <div className={cn("rounded-xl border border-border-primary bg-secondary-bg shadow-sm p-6 pt-8", className)}>
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-xl font-bold text-primary-text">Views</h4>
        <DatePicker
          prefix={"Year"}
          placeholder="Year"
          allowClear={false}
          picker="year"
          value={dayjs(`${cartYear}`, "YYYY")}
          onChange={onChange}
          style={{
            border: "none",
            borderBottom: "1px solid var(--border-primary)",
            borderRadius: 0,
            width: "120px",
            paddingLeft: 5,
            paddingRight: 5,
            backgroundColor: "transparent",
          }}
        />
      </div>
      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="h-[30vh]"
      >
        <div className="w-full max-w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              // data={data?.data || []}
              data={
                (() => {
                  const items = data?.chartData || (Array.isArray(data) ? data : []);
                  return items.map((item: any, index: number) => ({
                    month: item.label || chart[index]?.month || `Point ${index}`,
                    value: (item.views !== undefined ? item.views : (item.count || 0)) / 1000,
                  }));
                })()
              }
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray=""
                stroke="#959393"
              />
              <XAxis
                // axisLine={false}
                dataKey="month"
                tick={{ stroke: "#7D7D7D", strokeWidth: 0 }}
              />
              <YAxis
                axisLine={false}
                tick={{ stroke: "#959393", strokeWidth: 0 }}
                tickFormatter={(value) =>
                  `${value.toString().length < 2 ? "0" + value : value}K`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill="#16B989"
                barSize={36}
                activeBar={<Rectangle fill="#16B989" stroke="#00D698" />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </LoaderWraperComp>
    </div>
  );
};

interface CustomTooltipProps extends TooltipProps<any, any> {
  payload?: any[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-bg/95 p-3 rounded-lg shadow-xl border border-border-primary min-w-[120px] backdrop-blur-sm text-center">
        <p className="text-brand-primary font-bold text-lg pb-0.5">{`${payload[0].value}K`}</p>
        <p className="text-secondary-text font-semibold">{label}</p>
      </div>
    );
  }
  return null;
};
export default ViewsRatioChart;

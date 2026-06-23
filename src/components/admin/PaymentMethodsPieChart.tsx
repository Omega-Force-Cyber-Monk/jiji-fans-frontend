"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CreditCardIcon } from "@heroicons/react/24/outline";

const listData = [
  { label: "Paynow", value: "55% share", percentage: 55 },
  { label: "Stripe", value: "30% share", percentage: 30 },
  { label: "PawaPay", value: "15% share", percentage: 15 },
];

// Hex colors matching the image visualization (Blue, Green, Orange)
const COLORS = ["#3B82F6", "#00E3A5", "#F97316"];

const RADIAN = Math.PI / 180;

// High-fidelity custom label renderer that draws precise pointer lines and text nodes
// exactly like the reference image layout.
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  label,
  name,
}: any) => {
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  // Starting point of the pointer line (outer boundary of slice)
  const sx = cx + (outerRadius - 2) * cos;
  const sy = cy + (outerRadius - 2) * sin;

  // Mid-bend point of the pointer line
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;

  // Ending point of horizontal line
  const textAnchor = cos >= 0 ? "start" : "end";
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;

  // Retrieve the label name dynamically
  const labelName = listData[index]?.label || name;

  return (
    <g>
      {/* Pointer anchor line */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke="#94A3B8"
        strokeWidth={1}
        fill="none"
      />
      {/* Small anchor dot on the label line */}
      <circle cx={ex} cy={ey} r={2} fill="#94A3B8" />

      {/* Dynamic text displaying both the label name and its percentage */}
      <text
        x={ex + (cos >= 0 ? 8 : -8)}
        y={ey}
        textAnchor={textAnchor}
        fill="var(--primary-text)"
        dominantBaseline="central"
        className="text-sm font-semibold tracking-wide"
      >
        {`${labelName} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const PaymentMethodsPieChart = ({ className }: { className?: string }) => {
  return (
    <div className={`rounded-xl border border-border-primary bg-secondary-bg shadow-sm p-6 flex flex-col justify-between ${className}`}>
      <div className="space-y-6 flex-grow flex flex-col justify-between">
        <div className="flex items-center justify-between gap-6 border-b border-border-primary/50 pb-4 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <h4 className="text-xl font-bold text-primary-text">Payment Methods</h4>
            <p className="text-sm text-muted-text font-normal">
              Most used digital & mobile money transaction channels.
            </p>
          </div>
          <CreditCardIcon className="text-muted-text w-5 h-5 flex-shrink-0" />
        </div>

        {/* Height increased to 320px for a massive, highly visible solid pie chart */}
        <div className="h-[320px] w-full flex justify-center items-center flex-grow mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={listData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={95}
                label={renderCustomizedLabel}
                labelLine={false}
                dataKey="percentage"
                nameKey="label"
                stroke="#ffffff"
                strokeWidth={1.5}
              >
                {listData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2D2D2D",
                  borderRadius: "6px",
                  color: "#F9FAFB",
                  fontSize: "14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsPieChart;
export { PaymentMethodsPieChart };

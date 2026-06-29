/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { DatePicker, DatePickerProps, Skeleton } from "antd";
import { useState, useMemo } from "react";
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
import { useGetChannelEarningsQuery } from "@/redux/features/dashboard/dashboard.api";

const monthLabels = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const EarningBarChart = ({ className }: { className?: string }) => {
	const { data, isLoading, error } = useGetChannelEarningsQuery(undefined);

	// Format data for the chart - include all 12 months
	const chartData = useMemo(() => {
		const earningsByMonth = new Map<number, number>();

		const flatMonthData = data?.data?.earningsByMonth;
		if (Array.isArray(flatMonthData)) {
			flatMonthData.forEach((item: { _id: number; earnings: number }) => {
				const month = Number(item?._id);
				if (month >= 1 && month <= 12) {
					earningsByMonth.set(month, Number(item.earnings) || 0);
				}
			});
		}

		return monthLabels.map((monthLabel, index) => {
			const monthNumber = index + 1;
			const earning = earningsByMonth.get(monthNumber) ?? 0;
			return {
				month: monthLabel,
				value: earning,
				earnings: earning,
			};
		});
	}, [data]);

	if (error) {
		return (
			<div className={cn("rounded-lg pt-10", className)}>
				<div className="flex justify-between items-center mb-10">
					<h4 className="text-[20px] font-medium text-primary-text">Earnings</h4>
				</div>
				<div className="w-full h-[300px] flex items-center justify-center text-error">
					Failed to load earnings data. Please try again.
				</div>
			</div>
		);
	}

	return (
		<div className={cn("h-full flex flex-col justify-between", className)}>
			<div className="flex justify-between items-center mb-4 shrink-0">
				<div className="mb-4 shrink-0">
					<h3 className="text-lg font-semibold text-primary-text">Revenue & Activities</h3>
					<p className="text-sm text-muted-text font-normal mt-0.5">Monthly overview of subscription earnings</p>
				</div>
			</div>
			{isLoading ? (
				<div className="w-full flex-1 min-h-[250px] rounded-xl border border-border-primary bg-primary-bg p-5 flex items-center justify-center">
					<Skeleton active paragraph={{ rows: 6 }} title={false} />
				</div>
			) : (
				<div className="flex-1 w-full min-h-0 overflow-hidden">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{
								top: 5,
								right: 10,
								left: -20,
								bottom: 5,
							}}
						>
							<CartesianGrid
								vertical={false}
								strokeDasharray=""
								stroke="#959393"
								opacity={0.15}
							/>
							<XAxis
								dataKey="month"
								tick={{ stroke: "#7D7D7D", strokeWidth: 0, fontSize: 11 }}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ stroke: "#959393", strokeWidth: 0, fontSize: 11 }}
								tickFormatter={(value: number) =>
									value >= 1000
										? `${(value / 1000).toFixed(1)}K`
										: `${value}`
								}
							/>
							<Tooltip
								content={
									<CustomTooltip currency={data?.currency} />
								}
							/>
							<Bar
								dataKey="value"
								fill="#16B989"
								barSize={24}
								activeBar={
									<Rectangle
										fill="#16B989"
										stroke="#00D698"
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

interface CustomTooltipProps extends TooltipProps<any, any> {
	payload?: any[];
	label?: string | number;
	currency?: string;
}

const CustomTooltip = (props: CustomTooltipProps) => {
	const { active, payload, label, currency = "USD" } = props;
	if (active && payload && payload.length) {
		const earnings: number = payload[0].payload.earnings;

		return (
			<div className="bg-primary-bg/95 p-3 rounded-lg shadow-xl border border-border-primary min-w-[120px] backdrop-blur-sm">
				<p className="text-success font-semibold text-sm">{label}</p>
				<p className="text-brand-primary font-bold text-base mt-1">
					{currency} {earnings.toFixed(2)}
				</p>
			</div>
		);
	}
	return null;
};
export default EarningBarChart;

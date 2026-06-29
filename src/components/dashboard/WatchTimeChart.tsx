/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DatePicker, DatePickerProps } from "antd";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { TooltipProps } from "recharts";
import { cn } from "../../utils/cn";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

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
import { useGetWatchTimeStatsQuery } from "@/redux/features/dashboard/dashboard.api";
import { Skeleton } from "antd";

const WatchTimeChart = ({ className }: { className?: string }) => {
	const [metric, setMetric] = useState<"minutes" | "duration">("minutes");
	const { data: response, isLoading } = useGetWatchTimeStatsQuery(undefined);

	const chartData = useMemo(() => {
		const rawChartData = response?.data?.chartData || [];
		
		return rawChartData.map((item: any) => {
			const totalWatchTimeSeconds = Number(item.totalWatchTimeSeconds) || 0;
			const sessionsCount = Number(item.sessionsCount) || 0;
			
			let value = 0;
			let formatted = "";
			
			if (metric === "minutes") {
				value = Math.round(totalWatchTimeSeconds / 60);
				formatted = `${value.toLocaleString()}m`;
			} else {
				value = sessionsCount > 0 ? Math.round(totalWatchTimeSeconds / sessionsCount) : 0;
				formatted = `${Math.floor(value / 60)}m ${value % 60}s`;
			}

			return {
				month: item.label,
				value,
				formatted,
			};
		});
	}, [response, metric]);

	return (
		<div className={cn("h-full flex flex-col justify-between", className)}>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
				<div>
					<h4 className="text-lg font-medium text-primary-text mb-2">Watch-Time Analytics</h4>
					<div className="inline-flex rounded-md p-0.5 bg-primary-bg border border-border-primary">
						<button
							onClick={() => setMetric("minutes")}
							className={cn(
								"px-3 py-1 text-sm rounded transition-all duration-200",
								metric === "minutes"
									? "bg-secondary-bg text-brand-primary shadow-sm font-medium"
									: "text-muted-text hover:text-primary-text"
							)}
						>
							Total Minutes
						</button>
						<button
							onClick={() => setMetric("duration")}
							className={cn(
								"px-3 py-1 text-sm rounded transition-all duration-200",
								metric === "duration"
									? "bg-secondary-bg text-brand-primary shadow-sm font-medium"
									: "text-muted-text hover:text-primary-text"
							)}
						>
							Avg. Duration
						</button>
					</div>
				</div>
			</div>
			{isLoading ? (
				<div className="w-full flex-1 min-h-[250px] rounded-xl border border-border-primary bg-primary-bg p-5 flex items-center justify-center">
					<Skeleton active paragraph={{ rows: 6 }} title={false} />
				</div>
			) : (

			<div className="flex-1 w-full min-h-0 overflow-hidden">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{
							top: 10,
							right: 10,
							left: -15,
							bottom: 0,
						}}
					>
						<defs>
							<linearGradient id="watchTimeGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.25} />
								<stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.0} />
							</linearGradient>
						</defs>
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
							tickFormatter={(value: number) => {
								if (metric === "minutes") {
									return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
								} else {
									return `${Math.floor(value / 60)}m`;
								}
							}}
						/>
						<Tooltip
							content={<CustomTooltip metric={metric} />}
							cursor={{ stroke: "var(--border-primary)", strokeWidth: 1 }}
						/>
						<Area
							type="monotone"
							dataKey="value"
							stroke="var(--brand-primary)"
							strokeWidth={2}
							fillOpacity={1}
							fill="url(#watchTimeGrad)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
			)}
		</div>
	);
};

interface CustomTooltipProps extends TooltipProps<any, any> {
	payload?: any[];
	label?: string | number;
	metric: "minutes" | "duration";
}

const CustomTooltip = ({ active, payload, label, metric }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const val: number = payload[0].payload.value;
		const formatted: string = payload[0].payload.formatted;

		return (
			<div className="bg-primary-bg/95 p-3 rounded border border-border-primary min-w-[150px] shadow-lg backdrop-blur-sm">
				<p className="text-brand-primary text-sm font-medium mb-1">{label}</p>
				<p className="text-primary-text text-sm font-semibold">
					{metric === "minutes" ? "Watch Time:" : "Avg. Duration:"}{" "}
					<span className="text-brand-primary">{formatted}</span>
				</p>
			</div>
		);
	}
	return null;
};

export default WatchTimeChart;

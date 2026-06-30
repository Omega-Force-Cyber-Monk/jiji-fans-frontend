"use client";
import React from "react";
import { cn } from "../../utils/cn";
import { Skeleton } from "antd";
import { useGetChannelEarningsQuery } from "@/redux/features/dashboard/dashboard.api";

// A curated palette of colors cycling through tiers
const TIER_COLORS = [
	{ bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-500" },
	{ bar: "bg-indigo-500", dot: "bg-indigo-500", text: "text-indigo-500" },
	{ bar: "bg-amber-500", dot: "bg-amber-500", text: "text-amber-500" },
	{ bar: "bg-rose-500", dot: "bg-rose-500", text: "text-rose-500" },
	{ bar: "bg-cyan-500", dot: "bg-cyan-500", text: "text-cyan-500" },
];

const MemberTiersBreakdown = ({ className }: { className?: string }) => {
	const { data, isLoading } = useGetChannelEarningsQuery();

	const earningsByPlan = data?.data?.earningsByPlan || [];
	const totalEarnings = data?.data?.totalEarnings ?? 0;
	const earningsByStatus = data?.data?.earningsByStatus;
	const totalFans = earningsByPlan.reduce((acc: number, p: any) => acc + (p.fansCount ?? 0), 0);

	return (
		<div className={cn("rounded-lg pt-4 sm:pt-6", className)}>
			<div className="flex flex-col mb-6">
				<h4 className="text-lg font-medium text-primary-text mb-1">Member Tiers Breakdown</h4>
				<p className="text-sm text-muted-text">
					Revenue distribution across your active membership tiers
				</p>
			</div>

			{/* Loading skeletons */}
			{isLoading ? (
				<div className="space-y-5">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i}>
							<Skeleton active title={{ width: "60%" }} paragraph={{ rows: 1, width: "100%" }} />
						</div>
					))}
				</div>
			) : earningsByPlan.length === 0 ? (
				<div className="flex items-center justify-center h-28 text-muted-text text-sm">
					No earnings data available yet.
				</div>
			) : (
				<div className="space-y-5">
					{earningsByPlan.map((plan: any, idx: number) => {
						const color = TIER_COLORS[idx % TIER_COLORS.length];
						const billingLabel = plan.billingCycle === "year" ? "/yr" : "/mo";
						const earningsPct = plan.earningsPercentage ?? 0;
						const subsPct = plan.subscribersPercentage ?? 0;

						return (
							<div key={plan._id} className="group">
								<div className="flex items-center justify-between text-sm mb-1.5">
									<div className="flex items-center gap-2 min-w-0">
										<div className={cn("w-2 h-2 rounded-full shrink-0", color.dot)} />
										<span className="text-primary-text font-medium truncate">{plan.planName}</span>
										<span className="text-xs text-muted-text whitespace-nowrap shrink-0">
											(${plan.pricePerMonth?.toFixed(2)}/mo)
										</span>
									</div>
									<div className="text-right shrink-0 ml-2">
										<span className="text-primary-text font-semibold">
											${plan.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										</span>
										<span className="text-xs text-muted-text ml-2">
											({plan.fansCount} fans · ${plan.planPrice}{billingLabel})
										</span>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="w-full h-1.5 bg-primary-bg border border-border-primary rounded-full overflow-hidden">
									<div
										className={cn("h-full rounded-full transition-all duration-700 ease-out", color.bar)}
										style={{ width: `${earningsPct}%` }}
									/>
								</div>

								<div className="flex justify-between items-center mt-1 text-xs text-muted-text">
									<span>{subsPct.toFixed(1)}% of subscribers</span>
									<span>{earningsPct.toFixed(1)}% of earnings</span>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Earnings by Status row */}
			{earningsByStatus && !isLoading && (
				<div className="mt-6 pt-4 border-t border-border-primary grid grid-cols-2 sm:grid-cols-4 gap-3">
					{[
						{ label: "Paid", value: earningsByStatus.paid, color: "text-emerald-500" },
						{ label: "Pending", value: earningsByStatus.pending, color: "text-amber-500" },
						{ label: "Failed", value: earningsByStatus.failed, color: "text-rose-500" },
						{ label: "Refunded", value: earningsByStatus.refunded, color: "text-muted-text" },
					].map(({ label, value, color }) => (
						<div key={label} className="flex flex-col">
							<span className="text-xs text-muted-text">{label}</span>
							<span className={cn("text-sm font-semibold", color)}>
								${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
							</span>
						</div>
					))}
				</div>
			)}

			{/* Summary Footer */}
			{!isLoading && (
				<div className="mt-4 pt-4 border-t border-border-primary flex items-center justify-between text-sm text-muted-text">
					<div>
						Total Earnings:{" "}
						<span className="text-brand-primary font-medium ml-1">
							${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</span>
					</div>
					<div>
						Active Members: <span className="text-primary-text font-medium ml-1">{totalFans}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemberTiersBreakdown;

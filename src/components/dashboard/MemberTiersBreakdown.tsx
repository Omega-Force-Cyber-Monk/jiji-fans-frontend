"use client";
import React from "react";
import { cn } from "../../utils/cn";

interface MemberTier {
	name: string;
	price: number;
	fans: number;
	color: string;
}

const MemberTiersBreakdown = ({ className }: { className?: string }) => {
	const tiers: MemberTier[] = [
		{
			name: "Basic Tier",
			price: 4.99,
			fans: 142,
			color: "bg-emerald-500",
		},
		{
			name: "VIP Fan Club",
			price: 9.99,
			fans: 218,
			color: "bg-indigo-500",
		},
		{
			name: "Elite Backstage",
			price: 24.99,
			fans: 35,
			color: "bg-amber-500",
		},
	];

	// Calculations
	const totalFans = tiers.reduce((acc, tier) => acc + tier.fans, 0);
	const totalRevenue = tiers.reduce((acc, tier) => acc + tier.fans * tier.price, 0);

	return (
		<div className={cn("rounded-lg pt-4 sm:pt-6", className)}>
			<div className="flex flex-col mb-6">
				<h4 className="text-lg font-medium text-primary-text mb-1">Member Tiers Breakdown</h4>
				<p className="text-sm text-muted-text">
					Revenue distribution across your active membership tiers
				</p>
			</div>

			<div className="space-y-5">
				{tiers.map((tier) => {
					const revenue = tier.fans * tier.price;
					const fanPercentage = totalFans > 0 ? (tier.fans / totalFans) * 100 : 0;
					const revPercentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

					return (
						<div key={tier.name} className="group">
							<div className="flex items-center justify-between text-sm mb-1.5">
								<div className="flex items-center gap-2">
									<div className={cn("w-2 h-2 rounded-full", tier.color)} />
									<span className="text-primary-text font-medium">{tier.name}</span>
									<span className="text-sm text-muted-text">(${tier.price}/mo)</span>
								</div>
								<div className="text-right">
									<span className="text-primary-text font-medium">${revenue.toFixed(2)}</span>
									<span className="text-sm text-muted-text ml-2">({tier.fans} fans)</span>
								</div>
							</div>

							{/* Progress Bar container */}
							<div className="w-full h-1.5 bg-primary-bg border border-border-primary rounded-full overflow-hidden">
								<div
									className={cn("h-full rounded-full transition-all duration-500", tier.color)}
									style={{ width: `${revPercentage}%` }}
								/>
							</div>

							<div className="flex justify-between items-center mt-1 text-sm text-muted-text">
								<span>{fanPercentage.toFixed(1)}% of subscribers</span>
								<span>{revPercentage.toFixed(1)}% of earnings</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Summary Footer */}
			<div className="mt-8 pt-4 border-t border-border-primary flex items-center justify-between text-sm text-muted-text">
				<div>
					Total Tiers Revenue:{" "}
					<span className="text-brand-primary font-medium ml-1">
						${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
					</span>
				</div>
				<div>
					Active Members: <span className="text-primary-text font-medium ml-1">{totalFans}</span>
				</div>
			</div>
		</div>
	);
};

export default MemberTiersBreakdown;

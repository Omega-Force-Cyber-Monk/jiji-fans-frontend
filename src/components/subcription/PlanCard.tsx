import { TUniObject } from "@/types";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import React from "react";
import { cn } from "@/utils/cn";

const PlanCard = ({
	data,
	viewType,
	editModal,
	isCurrentPlan,
	hasSubscription,
	onSelectPlan,
}: {
	data: TUniObject;
	viewType?: string;
	editModal?: (type: "edit", data: TUniObject) => void;
	isCurrentPlan?: boolean;
	hasSubscription?: boolean;
	onSelectPlan?: (plan: TUniObject) => void;
}) => {
	const facilities = data.facilities || [];
	const billingCycle =
		data.billingCycle ||
		(data.interval === 365 || data.interval === 360 ? "year" : "month");
	const displayInterval = billingCycle === "year" ? "year" : "month";
	const hasUnlockableContent = data.hasUnlockableContent !== false;
	const isActionDisabled =
		isCurrentPlan || (viewType !== "admin" && !hasUnlockableContent);
	const actionLabel =
		viewType === "admin"
			? "Manage Plan"
			: isCurrentPlan
				? "Current Plan"
				: !hasUnlockableContent
					? "Nothing to unlock"
					: hasSubscription
						? "Upgrade Plan"
						: "Subscribe Now";

	return (
		<div className={cn(
			"relative bg-secondary-bg/80 backdrop-blur-md shadow-sm rounded-2xl p-6 md:p-8 w-full text-left border flex flex-col transition-all duration-300",
			isCurrentPlan 
				? "border-brand-primary shadow-md ring-1 ring-brand-primary/20 scale-[1.02]" 
				: "border-border-primary hover:border-brand-primary/40 hover:shadow-md hover:-translate-y-1"
		)}>
			{isCurrentPlan && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm">
					<SparklesIcon className="w-3.5 h-3.5" />
					Active
				</div>
			)}
			
			<div className="mb-6 space-y-2">
				<h3 className="text-xl font-bold tracking-tight text-primary-text">{data.name}</h3>
				<div className="flex items-baseline gap-1">
					<span className="text-4xl font-extrabold text-primary-text tracking-tight">${data.price}</span>
					<span className="text-sm font-medium text-muted-text uppercase tracking-wider">
						/{displayInterval}
					</span>
				</div>
			</div>

			<div className="h-px w-full bg-border-primary/50 mb-6" />

			<ul className="space-y-4 mb-8 flex-grow">
				{facilities.length > 0 ? (
					facilities.map((facility: string, index: number) => (
						<li key={index} className="flex items-start gap-3">
							<CheckCircleIcon className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
							<span className="text-sm text-secondary-text leading-relaxed font-medium">
								{facility}
							</span>
						</li>
					))
				) : (
					<li className="text-sm text-muted-text italic text-center py-4">
						No specific features listed.
					</li>
				)}
			</ul>

			<div className="mt-auto space-y-3">
				<button
					onClick={() => {
						if (editModal && !isCurrentPlan) editModal("edit", data);
						if (!editModal && !isCurrentPlan) onSelectPlan?.(data);
					}}
					disabled={isActionDisabled}
					className={cn(
						"font-semibold w-full py-3.5 px-4 rounded-xl outline-none transition-all duration-300 flex items-center justify-center gap-2",
						isActionDisabled
							? "bg-secondary-bg text-muted-text border border-border-primary cursor-not-allowed"
							: isCurrentPlan
								? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
								: "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
					)}
				>
					{actionLabel}
				</button>
				{!hasUnlockableContent && viewType !== "admin" && !isCurrentPlan && (
					<p className="text-xs font-medium text-warning text-center">
						This plan doesn't unlock any content.
					</p>
				)}
			</div>
		</div>
	);
};

export default PlanCard;

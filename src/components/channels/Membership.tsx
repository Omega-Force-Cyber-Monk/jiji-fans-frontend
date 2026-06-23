"use client";

import React from "react";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { countries } from "countries-list";
import { useRouter } from "next/navigation";
import { Button, Empty, message } from "antd";
import PlanCard from "../subcription/PlanCard";
import GlobalModal from "@/components/GlobalModal";
import MembershipSkeleton from "@/Common/Skeleton/Channels/MembershipSkeleton";
import { CreditCardIcon, SparklesIcon, WalletIcon } from "@heroicons/react/24/outline";
import {
	useGetCurrentChannelSubscriptionQuery,
	useGetAllSubscriptionPlansQuery,
	useCreateCheckoutSessionMutation,
	ISubscription,
	ISubscriptionPlanWithUnlockFlag,
} from "@/redux/features/subscription/subscription.api";
import { useAppSelector } from "@/redux/hook";
import { errorAlert } from "@/lib/alerts";

interface MembershipProps {
	channelId?: string;
}

const Membership = ({ channelId }: MembershipProps) => {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);
	const { data: currentSubscriptionData, isLoading: isLoadingSubscription } =
		useGetCurrentChannelSubscriptionQuery(channelId || "", {
			skip: !channelId,
		});
	const { data: plansData, isLoading: isLoadingPlans } =
		useGetAllSubscriptionPlansQuery(
			channelId ? { channelId } : undefined
		);
	const [createCheckoutSession, { isLoading: isCreatingSession }] =
		useCreateCheckoutSessionMutation();

	const currentSubscription = currentSubscriptionData?.data as
		| ISubscription
		| undefined;
	const plans = (plansData?.data || []) as ISubscriptionPlanWithUnlockFlag[];
	const currentPlan = currentSubscription
		? plans.find(
			(plan: any) =>
				plan._id === currentSubscription.subscriptionPlanId
		)
		: undefined;
	const [messageApi, contextHolder] = message.useMessage();
	const [isProviderModalOpen, setIsProviderModalOpen] = React.useState(false);
	const [selectedPlan, setSelectedPlan] = React.useState<any>(null);

	const pawapayEligibleIso3 = new Set([
		"BEN", "BFA", "CMR", "CIV", "COD", "ETH", "GAB", "GHA", "KEN", "LSO",
		"MWI", "MOZ", "NGA", "COG", "RWA", "SEN", "SLE", "TZA", "UGA", "ZMB",
	]);

	const ISO2_TO_ISO3: Record<string, string> = {
		BJ: "BEN", BF: "BFA", CM: "CMR", CI: "CIV", CD: "COD", ET: "ETH",
		GA: "GAB", GH: "GHA", KE: "KEN", LS: "LSO", MW: "MWI", MZ: "MOZ",
		NG: "NGA", CG: "COG", RW: "RWA", SN: "SEN", SL: "SLE", TZ: "TZA",
		UG: "UGA", ZM: "ZMB", ZW: "ZWE",
	};

	const NAME_TO_ISO3: Record<string, string> = {
		"benin": "BEN",
		"burkina faso": "BFA",
		"cameroon": "CMR",
		"côte d'ivoire": "CIV",
		"cote d'ivoire": "CIV",
		"cote d’ivoire": "CIV",
		"dr congo": "COD",
		"democratic republic of the congo": "COD",
		"ethiopia": "ETH",
		"gabon": "GAB",
		"ghana": "GHA",
		"kenya": "KEN",
		"lesotho": "LSO",
		"malawi": "MWI",
		"mozambique": "MOZ",
		"nigeria": "NGA",
		"republic of the congo": "COG",
		"rwanda": "RWA",
		"senegal": "SEN",
		"sierra leone": "SLE",
		"tanzania": "TZA",
		"uganda": "UGA",
		"zambia": "ZMB",
		"zimbabwe": "ZWE",
	};

	const getUserIso3 = (countryCode?: string) => {
		if (!countryCode) return undefined;
		const trimmed = countryCode.trim();
		const upper = trimmed.toUpperCase();
		if (upper.length === 3) return upper;
		if (upper.length === 2) return ISO2_TO_ISO3[upper] || upper;
		return NAME_TO_ISO3[trimmed.toLowerCase()] || upper;
	};

	const userIso3 = getUserIso3(user?.country);
	const isPawaPayEligible = pawapayEligibleIso3.has(userIso3 || "") && userIso3 !== "ZWE"; // Disable Pawapay in Zimbabwe
	const isPaynowEligible = userIso3 === "ZWE";

	if (isLoadingSubscription || isLoadingPlans) {
		return <MembershipSkeleton />;
	}

	const formatExpiryDate = (dateString: string) => {
		const date = new Date(dateString);
		const formattedDate = date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const formattedTime = date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
		return `${formattedDate} at ${formattedTime}`;
	};

	const startCheckout = async (
		plan: any,
		paymentProvider: "STRIPE" | "PAWAPAY" | "PAYNOW"
	) => {
		try {
			let fullCountryName = user?.country || "United States";
			if (fullCountryName && fullCountryName.length === 2 && (countries as any)[fullCountryName.toUpperCase()]) {
				fullCountryName = (countries as any)[fullCountryName.toUpperCase()].name;
			}

			const res = await createCheckoutSession({
				channelId,
				subscriptionPlanId: plan._id,
				paymentProvider,
				phoneNumber: user?.phoneNumber || "",
				country: fullCountryName,
				currency: "USD",
				language: "en",
			}).unwrap();
			const url = res?.data?.url;
			if (url) {
				window.location.href = url;
				return;
			}
			messageApi.open({
				key: "checkout",
				type: "error",
				content: "Failed to start checkout. Please try again.",
			});
		} catch (error: any) {
			errorAlert({
				error: error,
				messageApi,
				title: "Checkout failed",
			});
		}
	};

	const handleSelectPlan = (plan: any) => {
		if (!user?.phoneNumber || !user?.country) {
			messageApi.warning("Please complete your profile (Phone Number and Country) before subscribing.");
			router.push("/profile");
			return;
		}
		setSelectedPlan(plan);
		setIsProviderModalOpen(true);
	};

	return (
		<div className="w-full mx-auto space-y-8">
			{contextHolder}

			{currentSubscription && (
				<div className="space-y-4">
					<h3 className="text-xl font-semibold text-primary-text flex items-center gap-2">
						<SparklesIcon className="w-5 h-5 text-brand-primary" />
						My Current Memberships
					</h3>
					<div className="bg-brand-primary/5 rounded-lg px-6 py-5 space-y-4 border border-brand-primary/15 transition-all hover:bg-brand-primary/10">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="space-y-1">
								<p className="text-lg font-semibold text-primary-text">
									{currentPlan?.name || "Current"} Plan
								</p>
								<p className="text-sm text-secondary-text">
									Expires on:{" "}
									{currentSubscription.endDate
										? formatExpiryDate(currentSubscription.endDate)
										: "N/A"}
								</p>
							</div>
							<div>
								<Button
									type="primary"
									danger
									ghost
									className="rounded-md"
								>
									Cancel Membership
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-4">
					{plans.length === 0 ? (
						<div className="col-span-full bg-secondary-bg/50 border border-border-primary rounded-lg py-12 flex flex-col items-center justify-center">
							<Empty description="No subscription plans available" />
						</div>
					) : (
						plans.map((plan: any) => (
							<PlanCard
								key={plan._id}
								data={plan}
								isCurrentPlan={
									currentSubscription?.subscriptionPlanId === plan._id
								}
								hasSubscription={!!currentSubscription}
								onSelectPlan={handleSelectPlan}
							/>
						))
					)}
				</div>
			</div>

			<GlobalModal
				isModalOpen={isProviderModalOpen}
				setIsModalOpen={setIsProviderModalOpen}
				maxWidth="480px"
			>
				<div className="p-6 space-y-6">
					<div className="space-y-2">
						<h3 className="text-xl font-semibold text-primary-text">
							Select Payment Method
						</h3>
						<p className="text-sm text-secondary-text">
							Choose how you would like to complete your subscription checkout.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-4">
						{/* Stripe Option */}
						<button
							onClick={() => {
								if (!selectedPlan) return;
								setIsProviderModalOpen(false);
								startCheckout(selectedPlan, "STRIPE");
							}}
							disabled={isCreatingSession}
							className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer"
						>
							<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
								<CreditCardIcon className="w-6 h-6" />
							</div>
							<div>
								<p className="font-semibold text-primary-text">Pay with Stripe</p>
								<p className="text-sm text-muted-text">Support credit/debit cards and local wallets globally</p>
							</div>
						</button>

						{/* PawaPay Option */}
						{isPawaPayEligible && (
							<button
								onClick={() => {
									if (!selectedPlan) return;
									setIsProviderModalOpen(false);
									startCheckout(selectedPlan, "PAWAPAY");
								}}
								disabled={isCreatingSession}
								className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer"
							>
								<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
									<WalletIcon className="w-6 h-6" />
								</div>
								<div>
									<p className="font-semibold text-primary-text">Pay with PawaPay</p>
									<p className="text-sm text-muted-text">Support local Mobile Money payments in your country</p>
								</div>
							</button>
						)}

						{/* Paynow Option */}
						{isPaynowEligible && (
							<button
								onClick={() => {
									if (!selectedPlan) return;
									setIsProviderModalOpen(false);
									startCheckout(selectedPlan, "PAYNOW");
								}}
								disabled={isCreatingSession}
								className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer"
							>
								<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
									<WalletIcon className="w-6 h-6" />
								</div>
								<div>
									<p className="font-semibold text-primary-text">Pay with PayNow</p>
									<p className="text-sm text-muted-text">Support EcoCash, OneMoney, and Telecash in Zimbabwe</p>
								</div>
							</button>
						)}
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							onClick={() => setIsProviderModalOpen(false)}
							className="rounded-md"
						>
							Cancel
						</Button>
					</div>
				</div>
			</GlobalModal>
		</div>
	);
};

export default Membership;

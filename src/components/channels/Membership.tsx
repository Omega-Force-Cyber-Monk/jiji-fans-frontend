"use client";

import React, { useState, useEffect, useRef } from "react";
import { countries } from "countries-list";
import { useRouter } from "next/navigation";
import { Button, Empty, message } from "antd";
import PlanCard from "../subcription/PlanCard";
import GlobalModal from "@/components/GlobalModal";
import MembershipSkeleton from "@/Common/Skeleton/Channels/MembershipSkeleton";
import { CreditCardIcon, WalletIcon } from "@heroicons/react/24/outline";
import {
	useGetCurrentChannelSubscriptionQuery,
	useGetAllSubscriptionPlansNewQuery,
	useCreateCheckoutSessionMutation,
	ISubscription,
	ISubscriptionPlanWithUnlockFlag,
} from "@/redux/features/subscription/subscription.api";
import { useVerifyTransactionMutation } from "@/redux/features/payment/payment.api";
import { useIdempotency, generateUUID } from "@/hooks/useIdempotency";
import { useAppSelector } from "@/redux/hook";
import { errorAlert } from "@/lib/alerts";
import { getPawaPayCurrency } from "@/lib/pawapayCurrencies";

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
		useGetAllSubscriptionPlansNewQuery(
			channelId ? { channelId } : undefined
		);
	const [createCheckoutSession, { isLoading: isCreatingSession }] =
		useCreateCheckoutSessionMutation();
	const [verifyTransaction] = useVerifyTransactionMutation();

	const [messageApi, contextHolder] = message.useMessage();
	const { idempotencyKey, regenerateKey } = useIdempotency();
	const [isProcessingMobile, setIsProcessingMobile] = useState(false);
	const [mobileStatusMsg, setMobileStatusMsg] = useState("");
	const [countdown, setCountdown] = useState(60);

	const isProcessingRef = useRef(false);
	isProcessingRef.current = isProcessingMobile;

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data?.type === "PAYMENT_SUCCESS") {
				setMobileStatusMsg("Payment completed successfully!");
				messageApi.success("Subscription completed successfully!");
				setIsProcessingMobile(false);
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			}
		};
		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [messageApi]);

	useEffect(() => {
		if (!isProcessingMobile) {
			regenerateKey();
		}
	}, [isProcessingMobile, regenerateKey]);

	const currentSubscription = currentSubscriptionData?.data as
		| ISubscription
		| undefined;
	const plans = (plansData?.data || []) as ISubscriptionPlanWithUnlockFlag[];
	const currentPlan = currentSubscription
		? plans.find(
			(plan: any) =>
				plan._id === currentSubscription.subscriptionPlanId ||
				plan._id === (currentSubscription.subscriptionPlanId as any)?._id
		)
		: undefined;
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
	const isPawaPayEligible = true; // pawapayEligibleIso3.has(userIso3 || "") && userIso3 !== "ZWE"; // Disable Pawapay in Zimbabwe
	const isPaynowEligible = true; // userIso3 === "ZWE";
	// const isPawaPayEligible = pawapayEligibleIso3.has(userIso3 || "") && userIso3 !== "ZWE"; // Disable Pawapay in Zimbabwe
	// const isPaynowEligible = userIso3 === "ZWE";

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

			// Define request trigger inside a helper that handles 202/409/400
			const executeSessionRequest = async (currentKey: string) => {
				let attempts = 0;
				while (attempts < 5) {
					try {
						const response: any = await createCheckoutSession({
							body: {
								channelId,
								subscriptionPlanId: plan._id,
								paymentProvider,
								phoneNumber: user?.phoneNumber?.replace(/\D/g, "") || "",
								country: fullCountryName,
								currency: paymentProvider === "STRIPE" ? "USD" : getPawaPayCurrency(userIso3),
								language: "EN",
							},
							idempotencyKey: currentKey,
						}).unwrap();
						return response;
					} catch (error: any) {
						if (error?.status === 202) {
							// Wait 2 seconds and retry
							attempts++;
							await new Promise((resolve) => setTimeout(resolve, 2000));
							continue;
						}
						if (error?.status === 409) {
							messageApi.warning("You have modified the request parameters. A new transaction key is being created.");
							regenerateKey();
							throw error;
						}
						if (error?.status === 400) {
							regenerateKey();
							throw error;
						}
						throw error;
					}
				}
				throw new Error("Transaction is still processing. Please check your transaction history.");
			};

			const res = await executeSessionRequest(idempotencyKey);
			const url = res?.data?.url || res?.data?.redirectUrl;
			const providerReferenceId = res?.data?.providerReferenceId || res?.data?.pawapayId || res?.data?.paynowReference;

			const isWebFlow = (paymentProvider === "PAWAPAY" || paymentProvider === "PAYNOW" || paymentProvider === "STRIPE") && !!url;

			if (isWebFlow) {
				window.open(url, "_blank");
			}

			if (isWebFlow || providerReferenceId) {
				setIsProcessingMobile(true);
				setCountdown(60);
				setMobileStatusMsg(
					isWebFlow
						? "Please complete the payment in the newly opened tab..."
						: "Initiating payment prompt on your phone... Please enter your PIN on your mobile device."
				);

				const intervalId = setInterval(() => {
					setCountdown((prev) => {
						if (prev <= 1) {
							clearInterval(intervalId);
							if (!providerReferenceId) {
								setIsProcessingMobile(false);
							}
							return 0;
						}
						return prev - 1;
					});
				}, 1000);

				if (providerReferenceId) {
					// poll every 3 seconds up to 20 times (60 seconds total)
					(async () => {
						for (let i = 0; i < 20; i++) {
							await new Promise((resolve) => setTimeout(resolve, 3000));
							if (!isProcessingRef.current) {
								return;
							}
							try {
								const verifyKey = generateUUID();
								const verifyRes = await verifyTransaction({ providerReferenceId, idempotencyKey: verifyKey }).unwrap();
								if (verifyRes?.data?.status === "COMPLETED") {
									setMobileStatusMsg("Payment completed and settled successfully!");
									messageApi.success("Subscription completed successfully!");
									clearInterval(intervalId);
									setTimeout(() => {
										setIsProcessingMobile(false);
										window.location.reload();
									}, 2000);
									return;
								} else if (verifyRes?.data?.status === "FAILED") {
									setMobileStatusMsg("Transaction failed on mobile device.");
									messageApi.error("Payment transaction failed.");
									clearInterval(intervalId);
									setTimeout(() => setIsProcessingMobile(false), 3000);
									return;
								}
							} catch (e) {
								console.error("Polling verify error:", e);
							}
						}

						setMobileStatusMsg("Transaction confirmation took too long. Please check your transaction history.");
						clearInterval(intervalId);
						setTimeout(() => setIsProcessingMobile(false), 4000);
					})();
				}
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
			messageApi.open({
				type: "warning",
				duration: 8,
				content: (
					<span>
						Please complete your{" "}
						<strong>Phone Number</strong> and <strong>Country</strong> in your profile before subscribing.{" "}
						<button
							onClick={() => router.push("/profile")}
							style={{
								color: "#f59e0b",
								fontWeight: 600,
								textDecoration: "underline",
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: 0,
							}}
						>
							Go to Profile →
						</button>
					</span>
				),
			});
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
						{/* <SparklesIcon className="w-5 h-5 text-brand-primary" /> */}
						Current Memberships
					</h3>
					<div className="bg-brand-primary/5 rounded-lg px-6 py-5 space-y-4 border border-brand-primary/15 transition-all hover:bg-brand-primary/10">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="space-y-1">
								<p className="text-lg font-semibold text-primary-text">
									{currentPlan?.name || "Current"}
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
									currentSubscription?.subscriptionPlanId === plan._id ||
									(currentSubscription?.subscriptionPlanId as any)?._id === plan._id
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
						<button
							onClick={() => {
								if (!selectedPlan) return;
								setIsProviderModalOpen(false);
								startCheckout(selectedPlan, "PAWAPAY");
							}}
							disabled={isCreatingSession || !isPawaPayEligible}
							className={`flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer ${!isPawaPayEligible ? "opacity-50 cursor-not-allowed hover:border-border-primary hover:bg-secondary-bg" : ""
								}`}
						>
							<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
								<WalletIcon className="w-6 h-6" />
							</div>
							<div>
								<p className="font-semibold text-primary-text">Pay with PawaPay</p>
								<p className="text-sm text-muted-text">Support local Mobile Money payments in your country</p>
								{!isPawaPayEligible && (
									<p className="text-xs text-red-400 mt-1 font-semibold">Not available in your country ({user?.country || "Unknown"})</p>
								)}
							</div>
						</button>

						{/* Paynow Option */}
						<button
							onClick={() => {
								if (!selectedPlan) return;
								setIsProviderModalOpen(false);
								startCheckout(selectedPlan, "PAYNOW");
							}}
							disabled={isCreatingSession || !isPaynowEligible}
							className={`flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer ${!isPaynowEligible ? "opacity-50 cursor-not-allowed hover:border-border-primary hover:bg-secondary-bg" : ""
								}`}
						>
							<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
								<WalletIcon className="w-6 h-6" />
							</div>
							<div>
								<p className="font-semibold text-primary-text">Pay with PayNow</p>
								<p className="text-sm text-muted-text">Support EcoCash, OneMoney, and Telecash in Zimbabwe</p>
								{!isPaynowEligible && (
									<p className="text-xs text-red-400 mt-1 font-semibold">Only available in Zimbabwe</p>
								)}
							</div>
						</button>
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

			<GlobalModal
				isModalOpen={isProcessingMobile}
				setIsModalOpen={setIsProcessingMobile}
				maxWidth="480px"
			>
				<div className="p-6 text-center space-y-6 bg-secondary-bg rounded-lg">
					<div className="flex justify-center">
						<div className="relative w-16 h-16 flex items-center justify-center">
							<div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
							<span className="text-xs font-bold text-brand-primary z-10">{countdown}s</span>
						</div>
					</div>
					<h3 className="text-xl font-semibold text-primary-text">Mobile Money Prompt</h3>
					<p className="text-sm text-secondary-text">{mobileStatusMsg}</p>
				</div>
			</GlobalModal>
		</div>
	);
};

export default Membership;

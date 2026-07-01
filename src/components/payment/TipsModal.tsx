import React, { useState } from "react";
import { countries } from "countries-list";
import { Button, InputNumber, message } from "antd";
import GlobalModal from "@/components/GlobalModal";
import { CreditCardIcon, WalletIcon, GiftIcon } from "@heroicons/react/24/outline";
import {
	useCreateStripeTipSessionMutation,
	useCreatePawaPayTipSessionMutation,
	useCreatePaynowTipSessionMutation,
} from "@/redux/features/tips/tips.api";
import { useVerifyTransactionMutation } from "@/redux/features/payment/payment.api";
import { useIdempotency, generateUUID } from "@/hooks/useIdempotency";
import { useAppSelector } from "@/redux/hook";
import { errorAlert } from "@/lib/alerts";

interface TipsModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	contentId: string;
}

const TipsModal = ({ isOpen, setIsOpen, contentId }: TipsModalProps) => {
	const { user } = useAppSelector((state) => state.auth);
	const [amount, setAmount] = useState<number | null>(5);
	const [messageApi, contextHolder] = message.useMessage();

	const [createStripeSession, { isLoading: isStripeLoading }] = useCreateStripeTipSessionMutation();
	const [createPawaPaySession, { isLoading: isPawaLoading }] = useCreatePawaPayTipSessionMutation();
	const [createPaynowSession, { isLoading: isPaynowLoading }] = useCreatePaynowTipSessionMutation();
	const [verifyTransaction] = useVerifyTransactionMutation();

	const { idempotencyKey, regenerateKey } = useIdempotency();
	const [isProcessingMobile, setIsProcessingMobile] = useState(false);
	const [mobileStatusMsg, setMobileStatusMsg] = useState("");
	const [countdown, setCountdown] = useState(60);

	const isCreatingSession = isStripeLoading || isPawaLoading || isPaynowLoading || isProcessingMobile;

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
		"zambia": "ZMB",
		"zimbabwe": "ZWE",
		"kenya": "KEN",
		"nigeria": "NGA",
		"ghana": "GHA",
		"tanzania": "TZA",
		"uganda": "UGA",
		"south africa": "ZAF",
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
	const isPawaPayEligible = pawapayEligibleIso3.has(userIso3 || "") && userIso3 !== "ZWE";
	const isPaynowEligible = userIso3 === "ZWE";

	const handleTip = async (provider: "STRIPE" | "PAWAPAY" | "PAYNOW") => {
		if (!amount || amount <= 0) {
			messageApi.error("Please enter a valid amount.");
			return;
		}

		try {
			let fullCountryName = user?.country;
			if (fullCountryName && fullCountryName.length === 2 && (countries as any)[fullCountryName.toUpperCase()]) {
				fullCountryName = (countries as any)[fullCountryName.toUpperCase()].name;
			}

			const executeTipRequest = async (currentKey: string) => {
				let attempts = 0;
				while (attempts < 5) {
					try {
						let res;
						if (provider === "STRIPE") {
							res = await createStripeSession({
								body: { contentId, amount },
								idempotencyKey: currentKey,
							}).unwrap();
						} else if (provider === "PAWAPAY") {
							res = await createPawaPaySession({
								body: {
									contentId,
									amount,
									phoneNumber: (user?.phoneNumber || "").replace(/\+/g, ""),
									country: fullCountryName || "kenya",
									currency: (user as any)?.currency || "KES",
								},
								idempotencyKey: currentKey,
							}).unwrap();
						} else if (provider === "PAYNOW") {
							res = await createPaynowSession({
								body: {
									contentId,
									amount,
									phoneNumber: (user?.phoneNumber || "").replace(/\+/g, ""),
									country: fullCountryName || "zimbabwe",
									currency: (user as any)?.currency || "USD",
								},
								idempotencyKey: currentKey,
							}).unwrap();
						}
						return res;
					} catch (error: any) {
						if (error?.status === 202) {
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

			const res = await executeTipRequest(idempotencyKey);
			const url = res?.data?.sessionUrl || res?.data?.url;
			const providerReferenceId = res?.data?.providerReferenceId;

			// Stripe and normal Card Redirect flows
			if (provider === "STRIPE" || (provider === "PAYNOW" && !user?.phoneNumber)) {
				if (url) {
					window.location.href = url;
					return;
				}
			} else {
				// Mobile Money PIN Entry Countdown and polling flow
				if (providerReferenceId) {
					setIsProcessingMobile(true);
					setCountdown(60);
					setMobileStatusMsg("Initiating payment prompt on your phone... Please enter your PIN on your mobile device.");

					const intervalId = setInterval(() => {
						setCountdown((prev) => {
							if (prev <= 1) {
								clearInterval(intervalId);
								return 0;
							}
							return prev - 1;
						});
					}, 1000);

					// poll every 3 seconds up to 20 times (60 seconds total)
					for (let i = 0; i < 20; i++) {
						await new Promise((resolve) => setTimeout(resolve, 3000));
						try {
							const verifyKey = generateUUID();
							const verifyRes = await verifyTransaction({ providerReferenceId, idempotencyKey: verifyKey }).unwrap();
							if (verifyRes?.data?.status === "COMPLETED") {
								setMobileStatusMsg("Tip payment completed successfully! Thank you for supporting the creator!");
								messageApi.success("Tip sent successfully!");
								clearInterval(intervalId);
								setTimeout(() => {
									setIsProcessingMobile(false);
									setIsOpen(false);
								}, 2000);
								return;
							} else if (verifyRes?.data?.status === "FAILED") {
								setMobileStatusMsg("Transaction failed on mobile device.");
								messageApi.error("Tip payment failed.");
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
					return;
				} else if (url) {
					window.location.href = url;
					return;
				}
			}

			// Pawapay might return depositId directly in custom responses
			if (provider === "PAWAPAY" && res?.data?.depositId) {
				messageApi.success("Deposit initiated! Please check your phone to complete the transaction.");
				setIsOpen(false);
				return;
			}

			messageApi.error("Failed to start checkout. Please try again.");
		} catch (error: any) {
			errorAlert({ error, messageApi, title: "Tip failed" });
		}
	};

	const presets = [5, 10, 20, 50, 100];

	return (
		<>
			{contextHolder}
			<GlobalModal isModalOpen={isOpen} setIsModalOpen={setIsOpen} maxWidth="500px">
				<div className="space-y-6 relative overflow-hidden rounded-xl bg-secondary-bg border border-border-primary text-primary-text">
					{/* Glowing top gradient header */}
					<div className="p-6 pb-4 border-b border-border-primary/60 bg-gradient-to-r from-brand-primary/10 via-transparent to-brand-primary/5 flex items-start gap-4">
						<div className="p-3 bg-brand-primary/20 rounded-xl text-brand-primary border border-brand-primary/30 shrink-0">
							<GiftIcon className="w-7 h-7" />
						</div>
						<div className="space-y-1">
							<h3 className="text-xl font-bold tracking-tight text-primary-text">Support the Creator</h3>
							<p className="text-sm text-secondary-text leading-relaxed">
								Send a tip to show appreciation for their exclusive streams and content.
							</p>
						</div>
					</div>

					<div className="px-6 space-y-5">
						{/* Preset selection section */}
						<div className="space-y-2.5">
							<label className="text-sm font-semibold text-secondary-text block">Select Preset Amount</label>
							<div className="flex flex-wrap gap-2.5">
								{presets.map((preset) => {
									const isSelected = amount === preset;
									return (
										<button
											key={preset}
											type="button"
											onClick={() => setAmount(preset)}
											className={`px-4 py-2.5 rounded-lg text-sm font-bold border transition-all duration-200 active:scale-[0.96] ${isSelected
												? "bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/10"
												: "bg-primary-bg/40 border-border-primary/80 text-secondary-text hover:border-brand-primary/40 hover:text-primary-text"
												}`}
										>
											${preset}
										</button>
									);
								})}
							</div>
						</div>

						{/* Custom amount input field */}
						<div className="space-y-2.5">
							<label className="text-sm font-semibold text-secondary-text block">Custom Amount (USD)</label>
							<div className="relative group">
								<InputNumber
									min={1}
									value={amount}
									onChange={(val) => setAmount(Number(val) || 1)}
									className="w-full bg-primary-bg/40 border-border-primary hover:border-brand-primary/60 focus:border-brand-primary rounded-lg text-lg pt-1"
									size="large"
									prefix={<span className="text-brand-primary font-bold text-lg mr-1">$</span>}
								/>
							</div>
						</div>

						<div className="border-t border-border-primary/40 my-2"></div>

						{/* Payment choices container */}
						<div className="space-y-3.5">
							<label className="text-sm font-semibold text-secondary-text block">Disbursement Channel</label>
							<div className="grid grid-cols-1 gap-3">
								{/* Stripe Option */}
								<button
									onClick={() => handleTip("STRIPE")}
									disabled={isCreatingSession}
									className="flex items-center gap-4 p-4 rounded-xl border border-border-primary/80 bg-primary-bg/30 hover:border-brand-primary hover:bg-brand-primary/5 hover:-translate-y-[1px] hover:shadow-md transition-all duration-200 text-left group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
								>
									<div className="p-3 bg-brand-primary/15 rounded-lg text-brand-primary group-hover:bg-brand-primary/25 border border-brand-primary/10 transition-all shrink-0">
										<CreditCardIcon className="w-5 h-5" />
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-primary-text group-hover:text-brand-primary transition-colors text-sm">Tip with Stripe</p>
										<p className="text-xs text-muted-text truncate mt-0.5">Credit/debit cards globally</p>
									</div>
								</button>

								{/* PawaPay Option */}
								<button
									onClick={() => handleTip("PAWAPAY")}
									disabled={isCreatingSession}
									className="flex items-center gap-4 p-4 rounded-xl border border-border-primary/80 bg-primary-bg/30 hover:border-brand-primary hover:bg-brand-primary/5 hover:-translate-y-[1px] hover:shadow-md transition-all duration-200 text-left group cursor-pointer"
								>
									<div className="p-3 bg-brand-primary/15 rounded-lg text-brand-primary group-hover:bg-brand-primary/25 border border-brand-primary/10 transition-all shrink-0">
										<WalletIcon className="w-5 h-5" />
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-primary-text group-hover:text-brand-primary transition-colors text-sm">Tip with PawaPay</p>
										<p className="text-xs text-muted-text truncate mt-0.5">Local Mobile Money payments</p>
										{!isPawaPayEligible && (
											<span className="inline-block text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-1.5">
												Unavailable in {user?.country || "your location"} (Testing Active)
											</span>
										)}
									</div>
								</button>

								{/* Paynow Option */}
								<button
									onClick={() => handleTip("PAYNOW")}
									disabled={isCreatingSession}
									className="flex items-center gap-4 p-4 rounded-xl border border-border-primary/80 bg-primary-bg/30 hover:border-brand-primary hover:bg-brand-primary/5 hover:-translate-y-[1px] hover:shadow-md transition-all duration-200 text-left group cursor-pointer"
								>
									<div className="p-3 bg-brand-primary/15 rounded-lg text-brand-primary group-hover:bg-brand-primary/25 border border-brand-primary/10 transition-all shrink-0">
										<WalletIcon className="w-5 h-5" />
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-primary-text group-hover:text-brand-primary transition-colors text-sm">Tip with PayNow</p>
										<p className="text-xs text-muted-text truncate mt-0.5">EcoCash, OneMoney, Telecash</p>
										{!isPaynowEligible && (
											<span className="inline-block text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-1.5">
												Zimbabwe region only (Testing Active)
											</span>
										)}
									</div>
								</button>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 p-6 border-t border-border-primary/60 bg-primary-bg/20">
						<Button onClick={() => setIsOpen(false)} className="rounded-lg h-10 px-5 border-border-primary hover:border-brand-primary text-secondary-text hover:text-primary-text">
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
						<div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin flex items-center justify-center">
							<span className="text-xs font-bold text-brand-primary">{countdown}s</span>
						</div>
					</div>
					<h3 className="text-xl font-semibold text-primary-text">Mobile Money Prompt</h3>
					<p className="text-sm text-secondary-text">{mobileStatusMsg}</p>
				</div>
			</GlobalModal>
		</>
	);
};

export default TipsModal;

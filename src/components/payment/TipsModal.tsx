import React, { useState } from "react";
import { countries } from "countries-list";
import { Button, InputNumber, message } from "antd";
import GlobalModal from "@/components/GlobalModal";
import { CreditCardIcon, WalletIcon } from "@heroicons/react/24/outline";
import {
	useCreateStripeTipSessionMutation,
	useCreatePawaPayTipSessionMutation,
	useCreatePaynowTipSessionMutation,
} from "@/redux/features/tips/tips.api";
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

	const isCreatingSession = isStripeLoading || isPawaLoading || isPaynowLoading;

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

			let res;
			if (provider === "STRIPE") {
				res = await createStripeSession({ contentId, amount }).unwrap();
			} else if (provider === "PAWAPAY") {
				res = await createPawaPaySession({
					contentId,
					amount,
					phoneNumber: user?.phoneNumber || "",
					country: fullCountryName || "kenya",
					currency: (user as any)?.currency || "KES",
				}).unwrap();
			} else if (provider === "PAYNOW") {
				res = await createPaynowSession({
					contentId,
					amount,
					phoneNumber: user?.phoneNumber || "",
					country: fullCountryName || "zimbabwe",
					currency: (user as any)?.currency || "USD",
				}).unwrap();
			}

			const url = res?.data?.sessionUrl || res?.data?.url;
			if (url) {
				window.location.href = url;
				return;
			}

			// Pawapay might return something else like depositId if we are doing ussd push
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

	return (
		<>
			{contextHolder}
			<GlobalModal isModalOpen={isOpen} setIsModalOpen={setIsOpen} maxWidth="480px">
				<div className="p-6 space-y-6">
					<div className="space-y-2">
						<h3 className="text-xl font-semibold text-primary-text">Send a Tip</h3>
						<p className="text-sm text-secondary-text">
							Support the creator by sending a tip.
						</p>
					</div>

					<div className="space-y-3">
						<label className="text-sm font-medium text-primary-text block">Amount (USD)</label>
						<InputNumber
							min={1}
							value={amount}
							onChange={(val) => setAmount(Number(val) || 1)}
							className="w-full"
							size="large"
							prefix="$"
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 pt-4">
						<button
							onClick={() => handleTip("STRIPE")}
							disabled={isCreatingSession}
							className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer disabled:opacity-50"
						>
							<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
								<CreditCardIcon className="w-6 h-6" />
							</div>
							<div>
								<p className="font-semibold text-primary-text">Tip with Stripe</p>
								<p className="text-sm text-muted-text">Credit/debit cards globally</p>
							</div>
						</button>

						{isPawaPayEligible && (
							<button
								onClick={() => handleTip("PAWAPAY")}
								disabled={isCreatingSession}
								className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer disabled:opacity-50"
							>
								<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
									<WalletIcon className="w-6 h-6" />
								</div>
								<div>
									<p className="font-semibold text-primary-text">Tip with PawaPay</p>
									<p className="text-sm text-muted-text">Local Mobile Money payments</p>
								</div>
							</button>
						)}

						{isPaynowEligible && (
							<button
								onClick={() => handleTip("PAYNOW")}
								disabled={isCreatingSession}
								className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-secondary-bg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group cursor-pointer disabled:opacity-50"
							>
								<div className="p-3 bg-brand-primary/10 rounded-md text-brand-primary group-hover:bg-brand-primary/20 transition-all">
									<WalletIcon className="w-6 h-6" />
								</div>
								<div>
									<p className="font-semibold text-primary-text">Tip with PayNow</p>
									<p className="text-sm text-muted-text">EcoCash, OneMoney, Telecash</p>
								</div>
							</button>
						)}
					</div>

					<div className="flex justify-end pt-4">
						<Button onClick={() => setIsOpen(false)} className="rounded-md">
							Cancel
						</Button>
					</div>
				</div>
			</GlobalModal>
		</>
	);
};

export default TipsModal;

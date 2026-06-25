"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Button } from "antd";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useVerifyTransactionMutation } from "@/redux/features/payment/payment.api";

const PaymentVerificationPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const referenceId = searchParams?.get("providerReferenceId") || searchParams?.get("session_id") || searchParams?.get("reference");
	
	const [verifyTransaction] = useVerifyTransactionMutation();
	const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED">("LOADING");

	useEffect(() => {
		if (!referenceId) {
			setStatus("FAILED");
			return;
		}

		const verify = async () => {
			try {
				const res = await verifyTransaction({ providerReferenceId: referenceId }).unwrap();
				if (res?.data?.status === "COMPLETED" || res?.data?.status === "ACTIVE") {
					setStatus("SUCCESS");
				} else {
					setStatus("FAILED");
				}
			} catch (error) {
				console.error("Verification failed:", error);
				setStatus("FAILED");
			}
		};

		verify();
	}, [referenceId, verifyTransaction]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
			<div className="bg-secondary-bg/80 backdrop-blur-md p-10 rounded-2xl border border-border-primary text-center max-w-md w-full shadow-lg">
				{status === "LOADING" && (
					<div className="space-y-6">
						<Spin size="large" />
						<h2 className="text-xl font-semibold text-primary-text">Verifying Payment</h2>
						<p className="text-secondary-text text-sm">
							Please wait while we confirm your transaction securely. Do not close this page.
						</p>
					</div>
				)}

				{status === "SUCCESS" && (
					<div className="space-y-6">
						<div className="flex justify-center">
							<CheckCircleIcon className="w-16 h-16 text-success" />
						</div>
						<h2 className="text-2xl font-bold text-primary-text">Payment Successful!</h2>
						<p className="text-secondary-text text-sm">
							Your transaction has been securely verified and processed.
						</p>
						<Button
							type="primary"
							size="large"
							className="w-full mt-4"
							onClick={() => router.back()}
						>
							Go Back
						</Button>
					</div>
				)}

				{status === "FAILED" && (
					<div className="space-y-6">
						<div className="flex justify-center">
							<XCircleIcon className="w-16 h-16 text-danger" />
						</div>
						<h2 className="text-2xl font-bold text-primary-text">Verification Failed</h2>
						<p className="text-secondary-text text-sm">
							We couldn't automatically verify your payment right now. It might take a few more minutes to complete.
						</p>
						<Button
							size="large"
							className="w-full mt-4 bg-secondary-bg text-primary-text border border-border-primary"
							onClick={() => router.back()}
						>
							Go Back
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default PaymentVerificationPage;

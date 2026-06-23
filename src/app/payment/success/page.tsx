"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessAnimation from "@/components/ui/SuccessAnimation";
import { Button } from "antd";
import { HomeOutlined, DashboardOutlined } from "@ant-design/icons";
import Link from "next/link";
import { gsap } from "gsap";

function SuccessContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [showSummary, setShowSummary] = useState(false);
	const sessionId = searchParams.get("session_id");

	const handleAnimationComplete = () => {
		setShowSummary(true);
	};

	useEffect(() => {
		if (showSummary) {
			gsap.fromTo(
				".summary-card",
				{ opacity: 0, y: 30 },
				{ opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
			);
		}
	}, [showSummary]);

	if (!showSummary) {
		return (
			<SuccessAnimation
				message="Payment successful! Finalizing your subscriptions..."
				onAnimationComplete={handleAnimationComplete}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<div className="summary-card max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
				<div className="h-2 bg-green-500 w-full" />

				<div className="p-8 sm:p-12 text-center">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-10 h-10 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						Success!
					</h1>
					<p className="text-slate-600 mb-8 text-lg">
						Your payment has been processed successfully. Your
						account is now upgraded and ready to go.
					</p>

					<div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left">
						<h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
							Transaction Details
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center text-sm">
								<span className="text-slate-500">Status</span>
								<span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
									Completed
								</span>
							</div>
							{sessionId && (
								<div className="flex justify-between items-center text-sm">
									<span className="text-slate-500">
										Session ID
									</span>
									<span className="font-mono text-slate-700 text-sm truncate max-w-[180px]">
										{sessionId}
									</span>
								</div>
							)}
							<div className="flex justify-between items-center text-sm">
								<span className="text-slate-500">Date</span>
								<span className="text-slate-700">
									{new Date().toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Link href="/dashboard" className="w-full">
							<Button
								type="primary"
								size="large"
								icon={<DashboardOutlined />}
								className="w-full h-12 bg-slate-900 border-none hover:bg-slate-800 rounded-xl font-medium"
							>
								Dashboard
							</Button>
						</Link>
						<Link href="/" className="w-full">
							<Button
								size="large"
								icon={<HomeOutlined />}
								className="w-full h-12 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-medium"
							>
								Home
							</Button>
						</Link>
					</div>
				</div>

				<div className="bg-slate-50 py-4 px-8 border-t border-slate-100">
					<p className="text-sm text-slate-400 text-center">
						A confirmation email has been sent to your registered
						address.
					</p>
				</div>
			</div>
		</div>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-50 flex items-center justify-center">
					Loading...
				</div>
			}
		>
			<SuccessContent />
		</Suspense>
	);
}

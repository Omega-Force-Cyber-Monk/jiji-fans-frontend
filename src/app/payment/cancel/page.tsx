"use client";

import React, { useEffect } from "react";
import { Button } from "antd";
import {
	HomeOutlined,
	RedoOutlined,
	CloseCircleFilled,
} from "@ant-design/icons";
import Link from "next/link";
import { gsap } from "gsap";

export default function PaymentCancelPage() {
	useEffect(() => {
		const tl = gsap.timeline();

		tl.fromTo(
			".cancel-card",
			{ opacity: 0, scale: 0.95, y: 20 },
			{ opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
		).fromTo(
			".warning-icon",
			{ scale: 0, rotate: -45 },
			{ scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2)" },
			"-=0.3"
		);
	}, []);

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<div className="cancel-card max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
				<div className="h-2 bg-amber-500 w-full" />

				<div className="p-8 sm:p-12 text-center">
					<div className="warning-icon w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<CloseCircleFilled className="text-4xl text-amber-600" />
					</div>

					<h1 className="text-2xl font-bold text-slate-900 mb-2">
						Payment Cancelled
					</h1>
					<p className="text-slate-600 mb-8">
						The payment process was cancelled before completion. No
						charges have been made to your account.
					</p>

					<div className="bg-amber-50 rounded-2xl p-6 mb-8 border border-amber-100/50 text-left">
						<p className="text-sm text-amber-800 leading-relaxed">
							If you experienced any technical issues or have
							questions about our plans, please feel free to reach
							out to our support team.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						<Link href="/membership" className="w-full">
							<Button
								type="primary"
								size="large"
								icon={<RedoOutlined />}
								className="w-full h-12 bg-amber-600 border-none hover:bg-amber-700 rounded-xl font-medium shadow-amber-200 shadow-lg"
							>
								Try Again
							</Button>
						</Link>
						<Link href="/" className="w-full">
							<Button
								size="large"
								icon={<HomeOutlined />}
								className="w-full h-12 border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-medium"
							>
								Go Back Home
							</Button>
						</Link>
					</div>
				</div>

				<div className="bg-slate-50 py-4 px-8 border-t border-slate-100">
					<p className="text-xs text-slate-400 text-center">
						Need help?{" "}
						<Link
							href="/contact"
							className="text-slate-600 font-medium hover:underline"
						>
							Contact Support
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

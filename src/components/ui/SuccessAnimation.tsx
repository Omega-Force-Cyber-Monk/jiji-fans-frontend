"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ISuccessAnimationProps {
	message: string;
	onAnimationComplete: () => void;
}

const SuccessAnimation = ({
	message,
	onAnimationComplete,
}: ISuccessAnimationProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const circleRef = useRef<SVGCircleElement>(null);
	const checkmarkRef = useRef<SVGPathElement>(null);
	const textRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const tl = gsap.timeline({
			onComplete: () => {
				setTimeout(onAnimationComplete, 800); // Wait a bit before redirecting
			},
		});

		tl.fromTo(
			containerRef.current,
			{ opacity: 0, scale: 0.9 },
			{ opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
		)
			.fromTo(
				circleRef.current,
				{ strokeDashoffset: 502 },
				{
					strokeDashoffset: 0,
					duration: 0.8,
					ease: "power2.inOut",
				},
				"-=0.2"
			)
			.fromTo(
				checkmarkRef.current,
				{ strokeDashoffset: 48 },
				{
					strokeDashoffset: 0,
					duration: 0.4,
					ease: "power2.out",
				},
				"-=0.4"
			)
			.fromTo(
				textRef.current,
				{ opacity: 0, y: 15 },
				{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
				"-=0.2"
			);
	}, [onAnimationComplete]);

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm"
		>
			<div className="bg-white/80 rounded-2xl p-8 shadow-lg text-center">
				<svg
					className="w-20 h-20 mx-auto"
					viewBox="0 0 160 160"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<circle
						ref={circleRef}
						cx="80"
						cy="80"
						r="70"
						stroke="#00B05A"
						strokeWidth="10"
						strokeDasharray="502"
						strokeDashoffset="502"
						transform="rotate(-90 80 80)"
					/>
					<path
						ref={checkmarkRef}
						d="M45 85 L70 110 L115 60"
						stroke="#00B05A"
						strokeWidth="10"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeDasharray="48"
						strokeDashoffset="48"
					/>
				</svg>
				<p ref={textRef} className="mt-4 text-lg font-medium text-gray-800">
					{message}
				</p>
			</div>
		</div>
	);
};

export default SuccessAnimation;
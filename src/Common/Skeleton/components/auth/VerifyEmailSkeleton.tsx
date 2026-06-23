import React from "react";
import { cn } from "@/utils/cn";

const VerifyEmailSkeleton = () => {
	return (
		<div className={cn("w-full animate-pulse")}>
			<div className="text-center space-y-6 pb-8">
				<div className="flex items-center justify-center gap-4 relative">
					<div className="absolute left-0">
						<div className="w-10 h-10 rounded-md bg-skeleton-bg" />
					</div>
					<div className="h-8 w-48 bg-skeleton-bg rounded-md" />
				</div>
				<div className="flex flex-col items-center gap-2">
					<div className="h-4 w-64 bg-skeleton-bg rounded-md" />
					<div className="h-4 w-48 bg-skeleton-bg rounded-md" />
				</div>
			</div>

			<div className="w-full text-center">
				<div className="py-4 flex justify-center">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] md:w-[50px] md:h-[50px] lg:w-[56px] lg:h-[56px] xl:w-[62px] xl:h-[62px] mx-[2px] sm:mx-[3px] md:mx-[4px] lg:mx-[6px] bg-skeleton-bg rounded-full"
						/>
					))}
				</div>
				
				<div className="w-full flex justify-center pt-4">
					<div className="w-full h-12 bg-skeleton-bg rounded-md" />
				</div>
			</div>
			
			<div className="text-center mt-8 flex justify-center gap-2 items-center">
				<div className="h-4 w-40 bg-skeleton-bg rounded-md" />
				<div className="h-4 w-16 bg-skeleton-bg rounded-md" />
			</div>
		</div>
	);
};

export default VerifyEmailSkeleton;

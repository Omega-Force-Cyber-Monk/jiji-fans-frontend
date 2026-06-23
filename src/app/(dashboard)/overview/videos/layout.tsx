"use client";
import React from "react";
import { TLayoutProps } from "@/types";
import VideoSuggetions from "@/components/channels/VideoSuggetions";
import { useSearchParams, usePathname } from "next/navigation";

const OverviewLayout = ({ children }: TLayoutProps) => {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const channelId = searchParams.get("channelId");

	// Extract current video ID from pathname: /overview/videos/[slug]
	const pathParts = pathname?.split("/") ?? [];
	const currentVideoId = pathParts[pathParts.length - 1] ?? "";

	return (
		<div className="relative flex flex-col lg:flex-row gap-6 md:overflow-visible">
			{/* Main video content — takes ~65% width */}
			<div className="w-full lg:flex-1 min-w-0">{children}</div>

			{/* Suggestions sidebar — fixed ~380px wide on large screens */}
			{channelId && (
				<VideoSuggetions
					channelId={channelId}
					currentVideoId={currentVideoId}
					className="w-full lg:w-[480px] xl:w-[520px] shrink-0"
				/>
			)}
		</div>
	);
};

export default OverviewLayout;


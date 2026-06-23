"use client";
import React from "react";
import { cn } from "../../utils/cn";
import { 
	HandThumbUpIcon, 
	ChatBubbleLeftEllipsisIcon,
	EyeIcon
} from "@heroicons/react/24/outline";

interface VideoPerformance {
	id: string;
	title: string;
	publishDate: string;
	views: number;
	retention: number; // percentage
	likes: number;
	comments: number;
	thumbnailGradient: string;
}

const TopPerformingVideos = ({ className }: { className?: string }) => {
	const videos: VideoPerformance[] = [
		{
			id: "1",
			title: "Ultimate Premium Q&A Session - May 2026",
			publishDate: "May 10, 2026",
			views: 15420,
			retention: 84,
			likes: 1240,
			comments: 342,
			thumbnailGradient: "from-purple-600 to-indigo-600",
		},
		{
			id: "2",
			title: "Behind the Scenes: A Day in the Studio",
			publishDate: "May 04, 2026",
			views: 9210,
			retention: 72,
			likes: 812,
			comments: 189,
			thumbnailGradient: "from-pink-600 to-rose-600",
		},
		{
			id: "3",
			title: "Subscribers Only: Exclusive Lounge Chat",
			publishDate: "Apr 28, 2026",
			views: 6430,
			retention: 65,
			likes: 590,
			comments: 98,
			thumbnailGradient: "from-emerald-600 to-teal-600",
		},
	];

	return (
		<div className={cn("rounded-lg pt-4 sm:pt-6", className)}>
			<div className="flex flex-col mb-6">
				<h4 className="text-lg font-medium text-primary-text mb-1">Top Performing Videos</h4>
				<p className="text-sm text-muted-text">
					Your premium content with the highest watch-time and fan engagement
				</p>
			</div>

			<div className="w-full overflow-x-auto select-none">
				<table className="w-full border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-border-primary text-sm text-muted-text">
							<th className="pb-3 font-medium">Video Content</th>
							<th className="pb-3 font-medium px-4">Views</th>
							<th className="pb-3 font-medium px-4">Completion (Retention)</th>
							<th className="pb-3 font-medium text-right">Engagement</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border-primary/50">
						{videos.map((video) => (
							<tr key={video.id} className="group hover:bg-primary-bg/20 transition-colors duration-200">
								{/* Title & Thumbnail */}
								<td className="py-3 pr-4">
									<div className="flex items-center gap-3">
										<div className={cn(
											"w-16 h-10 rounded border border-border-primary bg-gradient-to-br flex items-center justify-center shrink-0 relative overflow-hidden",
											video.thumbnailGradient
										)}>
											<span className="text-sm font-semibold text-white/90 uppercase tracking-widest">
												EXCL
											</span>
											<div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
												<span className="w-2 h-2 border-t-4 border-b-4 border-l-[6px] border-y-transparent border-l-white ml-0.5" />
											</div>
										</div>
										<div className="min-w-0">
											<p className="text-primary-text font-medium truncate max-w-[200px] sm:max-w-[300px]">
												{video.title}
											</p>
											<p className="text-sm text-muted-text mt-0.5">{video.publishDate}</p>
										</div>
									</div>
								</td>

								{/* Views */}
								<td className="py-3 px-4 whitespace-nowrap">
									<div className="flex items-center gap-1.5 text-primary-text">
										<EyeIcon className="w-4 h-4 text-muted-text shrink-0" />
										<span>{video.views.toLocaleString()}</span>
									</div>
								</td>

								{/* Completion Rate / Retention */}
								<td className="py-3 px-4">
									<div className="flex flex-col gap-1 min-w-[120px] max-w-[160px]">
										<div className="flex justify-between text-sm text-primary-text">
											<span>{video.retention}%</span>
											<span className="text-muted-text text-sm">avg</span>
										</div>
										<div className="w-full h-1 bg-primary-bg border border-border-primary rounded-full overflow-hidden">
											<div 
												className={cn(
													"h-full rounded-full",
													video.retention >= 80 ? "bg-success" : video.retention >= 70 ? "bg-brand-primary" : "bg-warning"
												)}
												style={{ width: `${video.retention}%` }}
											/>
										</div>
									</div>
								</td>

								{/* Engagement */}
								<td className="py-3 text-right whitespace-nowrap">
									<div className="inline-flex items-center gap-3 text-sm text-muted-text">
										<span className="flex items-center gap-1">
											<HandThumbUpIcon className="w-3.5 h-3.5" />
											<span>{video.likes}</span>
										</span>
										<span className="flex items-center gap-1">
											<ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
											<span>{video.comments}</span>
										</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default TopPerformingVideos;

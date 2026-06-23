"use client";

import React, { useState, useEffect, useRef } from "react";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import { cn } from "@/utils/cn";
import { BellIcon } from "@heroicons/react/24/outline";
import {
	useGetAllNotificationsQuery,
	TNotification,
} from "@/redux/features/notification/notification.api";
import { Empty, Skeleton, Breadcrumb } from "antd";

const mockNotifications = [
	{
		_id: "mock-1",
		title: "New Subscriber! 🎉",
		message: "naim008 has just subscribed to your Premium Tier. Say hello!",
		createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
	},
	{
		_id: "mock-2",
		title: "Content Upload Successful 🎬",
		message: "Your video 'Creative Coding Aesthetics' is processed and now live.",
		createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
	},
	{
		_id: "mock-3",
		title: "Direct Message Received 💬",
		message: "Alice sent you a new message: 'Hey, I love your latest post!'",
		createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
	},
	{
		_id: "mock-4",
		title: "Pledge Tipped 💰",
		message: "A supporter tipped you $15.00 on your recent exclusive post.",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
	},
	{
		_id: "mock-5",
		title: "Account Milestone 🌟",
		message: "Congratulations! You have reached 1,000 views on your profile this week.",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
	},
	{
		_id: "mock-6",
		title: "Creator Verification Approved ✅",
		message: "Welcome to Plus2Fans! Your KYC documents are approved. Start publishing content!",
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
	},
] as unknown as TNotification[];

const Notification = () => {
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [allNotifications, setAllNotifications] = useState<TNotification[]>(
		[]
	);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const limit = 10;
	const notificationSkeletons = Array.from({ length: 6 });

	const queryArgs = cursor
		? [
			{ name: "limit", value: String(limit) },
			{ name: "cursor", value: cursor },
		]
		: [{ name: "limit", value: String(limit) }];

	const { data, isLoading, error } = useGetAllNotificationsQuery(queryArgs);

	const pagination = data?.data?.pagination;
	const isDev = process.env.NEXT_PUBLIC_APP_ENV === "dev";
	const displayNotifications = (isDev && allNotifications.length === 0) ? mockNotifications : allNotifications;

	// Append new notifications when data changes
	useEffect(() => {
		if (data?.data?.notifications) {
			setAllNotifications((prev) => {
				// If no cursor, it's initial load - replace all
				if (!cursor) {
					return data.data.notifications;
				}
				// Otherwise append new notifications
				const newNotifications = data.data.notifications.filter(
					(notification: TNotification) =>
						!prev.some((p) => p._id === notification._id)
				);
				return [...prev, ...newNotifications];
			});
		}
	}, [data, cursor]);

	// Set up Intersection Observer for infinite scroll
	useEffect(() => {
		if (!pagination?.hasNextPage) {
			return;
		}

		const option = {
			root: null,
			rootMargin: "20px",
			threshold: 0.1,
		};

		const handleObserver = (entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			if (
				entry.isIntersecting &&
				pagination?.hasNextPage &&
				!isLoading &&
				!isLoadingMore
			) {
				setIsLoadingMore(true);
				if (pagination.nextCursor) {
					setCursor(pagination.nextCursor);
				}
				setTimeout(() => setIsLoadingMore(false), 1000);
			}
		};

		observerRef.current = new IntersectionObserver(handleObserver, option);

		const timeoutId = setTimeout(() => {
			if (loadMoreRef.current) {
				observerRef.current?.observe(loadMoreRef.current);
			}
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [
		pagination?.hasNextPage,
		pagination?.nextCursor,
		isLoading,
		isLoadingMore,
	]);

	if (error) {
		return (
			<div>
				<Breadcrumb
					items={[
						{ title: "Home", href: "/overview" },
						{ title: "Notifications" },
					]}
					className="mb-4"
				/>
				<h2 className="text-3xl font-semibold text-primary-text mb-6">Notifications</h2>
				<div className="flex justify-center items-center min-h-[400px]">
					<Empty description="Failed to load notifications" />
				</div>
			</div>
		);
	}

	return (
		<div>
			<Breadcrumb
				items={[
					{ title: "Home", href: "/overview" },
					{ title: "Notifications" },
				]}
				className="mb-4"
			/>
			<div className="space-y-3.5 mt-5">
				{isLoading && !cursor ? (
					<div className="space-y-3.5">
						{notificationSkeletons.map((_, index) => (
							<div
								key={index}
								className="group flex items-center gap-4 px-5 sm:px-[24px] py-4 border-b border-border-primary"
							>
								{/* Rounded avatar icon boundary matching BellIcon */}
								<div className="shrink-0 border border-border-primary w-[42px] md:w-10 h-[42px] md:h-10 bg-skeleton-bg rounded-lg animate-pulse" />

								{/* Content line items matching actual text elements */}
								<div className="space-y-[2px] flex-1">
									{/* Title skeleton */}
									<div className="h-5 w-1/3 bg-skeleton-bg rounded-md animate-pulse" />
									{/* Message skeleton */}
									<div className="h-4 w-3/4 bg-skeleton-bg rounded-md animate-pulse mt-1" />
									{/* Time/Date skeleton */}
									<div className="h-3.5 w-20 bg-skeleton-bg rounded-md animate-pulse mt-1.5" />
								</div>
							</div>
						))}
					</div>
				) : displayNotifications.length === 0 ? (
					<Empty description="No notifications yet" />
				) : (
					<>
						{displayNotifications.map((item: TNotification) => (
							<div
								key={item._id}
								className="px-5 sm:px-[24px] py-4 hover:bg-secondary-bg/50 border-b border-border-primary/50 transition-all duration-200 cursor-pointer group relative"
							>
								<div className="flex gap-4 items-start">
									{/* Clean Brand Icon container matching NotificationPopover pattern */}
									<div className="size-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-all duration-300">
										<BellIcon className="size-5 text-brand-primary group-hover:text-primary-bg transition-colors duration-300" />
									</div>

									{/* Content Details */}
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-semibold text-primary-text group-hover:text-brand-primary transition-colors duration-200">
												{item.title}
											</p>

											{/* Subtle unread dot */}
											{item._id.startsWith("mock") && (
												<span className="size-2 rounded-full bg-brand-primary shrink-0" />
											)}
										</div>
										<p className="text-xs text-secondary-text mt-1 leading-relaxed">
											{item.message}
										</p>
										<p className="text-[10px] text-muted-text mt-2 flex items-center gap-1.5 font-medium">
											<span className="size-1 rounded-full bg-border-primary" />
											{compareByCTime({ preTime: item.createdAt })}
										</p>
									</div>
								</div>
							</div>
						))}

						{/* Infinite scroll trigger */}
						{allNotifications.length > 0 && pagination?.hasNextPage && (
							<div
								ref={loadMoreRef}
								className="w-full py-8 flex justify-center"
							>
								{isLoadingMore && (
									<Skeleton.Input active style={{ width: 180, height: 18 }} />
								)}
							</div>
						)}

						{/* Show end message when no more content */}
						{allNotifications.length > 0 && !pagination?.hasNextPage && (
							<div className="w-full py-8 flex justify-center">
								<p className="text-muted-text text-sm">
									No more notifications to load
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Notification;

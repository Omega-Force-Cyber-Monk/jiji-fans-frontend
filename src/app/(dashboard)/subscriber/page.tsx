"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Avatar, Input, Table, TableColumnsType, Empty, Breadcrumb } from "antd";
import { useGetMySubscribersQuery } from "@/redux/features/channel/channel.api";
import SectionContainer from "@/components/ui/SectionContainer";
import SubscriberSkeleton from "@/Common/Skeleton/app/(dashboard)/subscriber/SubscriberSkeleton";

const formatDate = (dateString: string | Date) => {
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "N/A";
	const day = date.getDate();
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const month = months[date.getMonth()];
	const year = date.getFullYear();
	return `${day} ${month}, ${year}`;
};

interface TableDataType {
	key: string;
	id: string;
	name: string;
	email: string;
	avatar?: string;
	plan: string;
	status: string;
	paymentStatus: string;
	joinDate: string;
	startDate: string;
}

export default function Page() {
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [searchQuery, setSearchQuery] = useState("");
	const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const { data: subscribersData, isLoading } = useGetMySubscribersQuery({
		limit: 10,
		cursor,
	});

	const subscribers = subscribersData?.data;
	const pagination = subscribers?.pagination;

	// Append new subscribers when data changes
	useEffect(() => {
		if (subscribers?.subscribers) {
			setAllSubscribers((prev) => {
				// If no cursor, it's initial load - replace all
				if (!cursor) {
					return subscribers.subscribers;
				}
				// Otherwise append new subscribers
				const newSubscribers = subscribers.subscribers.filter(
					(sub: any) => !prev.some((p) => p._id === sub._id)
				);
				return [...prev, ...newSubscribers];
			});
		}
	}, [subscribers, cursor]);

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
				// Generate the cursor from the last item
				const lastSub = allSubscribers[allSubscribers.length - 1];
				if (lastSub) {
					const nextCursor = btoa(
						JSON.stringify({
							value: lastSub._id,
							direction: "next",
							sortField: "_id",
							sortOrder: -1,
						})
					);
					setCursor(nextCursor);
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
	}, [pagination?.hasNextPage, isLoading, isLoadingMore, allSubscribers]);

	const columns: TableColumnsType<TableDataType> = [
		{
			title: "Subscriber",
			dataIndex: "name",
			render: (text: string, record) => (
				<div className="flex items-center gap-2">
					<Avatar
						src={record.avatar}
						size={36}
						className="border border-border-primary bg-secondary-bg text-primary-text"
					>
						{text?.charAt(0)?.toUpperCase()}
					</Avatar>
					<p className="font-medium text-primary-text text-base">{text}</p>
				</div>
			),
		},
		{
			title: "Email",
			dataIndex: "email",
			render: (text: string) => <p className="text-secondary-text text-base">{text}</p>,
		},
		{
			title: "Plan",
			dataIndex: "plan",
			render: (text: string) => <p className="text-primary-text text-base">{text}</p>,
		},
		{
			title: "Status",
			dataIndex: "status",
			render: (text: string) => {
				let statusStyles = "bg-muted-text/10 text-secondary-text";
				if (text === "Active") {
					statusStyles = "bg-success/10 text-success";
				} else if (text === "Expired" || text === "Cancelled") {
					statusStyles = "bg-error/10 text-error";
				} else if (text === "Past Due") {
					statusStyles = "bg-warning/10 text-warning";
				}
				return (
					<span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${statusStyles}`}>
						{text}
					</span>
				);
			},
			align: "center",
		},
		{
			title: "Platform Joined",
			dataIndex: "startDate",
			render: (text: string) => <p className="text-secondary-text text-base">{text}</p>,
			align: "center",
		},
		{
			title: "Subscribed At",
			dataIndex: "joinDate",
			render: (text: string) => <p className="text-secondary-text text-base">{text}</p>,
			align: "center",
		},
	];

	const data: TableDataType[] = allSubscribers
		.filter(
			(sub) =>
				sub?.subscriber?.username
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				sub?.subscriber?.email
					.toLowerCase()
					.includes(searchQuery.toLowerCase())
		)
		.map((sub) => ({
			key: sub?._id,
			id: sub?._id,
			name: sub?.subscriber?.username || "N/A",
			email: sub?.subscriber?.email || "N/A",
			avatar: sub?.subscriber?.avatar,
			plan: sub?.subscriptionPlan?.name || sub?.subscriptionPlanId || "N/A",
			status:
				sub?.status === "ACTIVE"
					? "Active"
					: sub?.status === "PAST_DUE"
						? "Past Due"
						: sub?.status === "CANCELLED"
							? "Cancelled"
							: sub?.status === "EXPIRED"
								? "Expired"
								: sub?.isExpired
									? "Expired"
									: sub?.isCancelled
										? "Cancelled"
										: "Active",
			paymentStatus: sub?.paymentStatus,
			joinDate: formatDate(sub?.createdAt),
			startDate: formatDate(sub?.startDate || sub?.createdAt),
		}));

	if (isLoading && !cursor) {
		return <SubscriberSkeleton />;
	}

	return (
		<div className="space-y-6">
			<Breadcrumb
				items={[
					{ title: "Home", href: "/dashboard" },
					{ title: "Subscribers" },
				]}
				className="mb-4!"
			/>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary-bg border border-border-primary rounded-lg p-6">
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold text-primary-text flex items-center gap-3">
						Subscribers
						<span className="text-sm font-medium px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-md">
							{subscribers?.totalSubscribers || 0} Total
						</span>
					</h2>
					<p className="text-base font-normal text-muted-text">
						Monitor and manage active subscription plans and member details.
					</p>
				</div>
				<div className="w-full sm:w-72">
					<Input
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search email or username..."
						suffix={<MagnifyingGlassIcon className="w-5 h-5 text-muted-text" />}
						className="w-full h-10 rounded-md bg-primary-bg border-border-primary text-primary-text text-base"
						value={searchQuery}
					/>
				</div>
			</div>

			{allSubscribers.length === 0 ? (
				<div className="bg-primary-bg border border-border-primary rounded-lg p-12 flex justify-center items-center">
					<Empty description={<span className="text-muted-text text-base">No subscribers found</span>} />
				</div>
			) : (
				<>
					<div className="bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
						<div className="w-full overflow-x-auto">
							<Table
								columns={columns}
								dataSource={data}
								pagination={false}
								locale={{ emptyText: "No subscribers found" }}
							/>
						</div>
					</div>

					{/* Infinite scroll trigger */}
					{pagination?.hasNextPage && (
						<div
							ref={loadMoreRef}
							className="w-full py-8 flex justify-center"
						>
							{isLoadingMore && (
								<div className="w-44 h-8 bg-skeleton-bg rounded-md animate-pulse" />
							)}
						</div>
					)}

					{/* Show end message when no more content */}
					{/* {!pagination?.hasNextPage && allSubscribers.length > 0 && (
						<div className="w-full py-8 flex justify-center">
							<p className="text-muted-text text-base">
								No more subscribers to load
							</p>
						</div>
					)} */}
				</>
			)}
		</div>
	);
}

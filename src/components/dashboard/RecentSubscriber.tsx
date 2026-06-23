import { Table, TableColumnsType, Avatar } from "antd";
import { ChannelStatsRecentSubscription } from "@/redux/features/dashboard/dashboard.api";
import { cn } from "@/utils/cn";

interface RecentSubscriberProps {
	title: string;
	subscriptions: ChannelStatsRecentSubscription[];
	viewType: "admin" | "creator";
	pagination?: boolean;
	pageSize?: number;
	loading?: boolean;
}

interface TableDataType {
	key: string;
	id: string;
	name: string;
	avatar?: string;
	plan: string;
	email: string;
	address?: string;
	price: string;
	joinDate: string;
	status: string;
}

const RecentSubscriber = ({
	title,
	subscriptions,
	viewType,
	pagination = false,
	pageSize = 5,
	loading,
}: RecentSubscriberProps) => {
	const columns: TableColumnsType<TableDataType> = [
		{
			title: "Subscriber",
			dataIndex: "name",
			render: (text: string, record) => (
				<div className="flex items-center gap-2">
					<Avatar src={record.avatar} size={32}>
						{text?.charAt(0).toUpperCase()}
					</Avatar>
					<p className="!mb-0 text-sm font-semibold text-primary-text">{text}</p>
				</div>
			),
		},
		...(viewType === "creator"
			? [
				{
					title: "Plan",
					dataIndex: "plan",
					render: (text: string) => <p className="!mb-0 text-sm text-secondary-text">{text}</p>,
				},
				{
					title: "Status",
					dataIndex: "status",
					render: (text: string) => (
						<p
							className={cn(
								"!mb-0 text-sm",
								text === "Active"
									? "text-success font-medium"
									: text === "Expired" || text === "Cancelled"
										? "text-error font-medium"
										: "text-secondary-text"
							)}
						>
							{text}
						</p>
					),
					align: "center" as const,
				},
			]
			: [
				{
					title: "Email",
					dataIndex: "email",
					render: (text: string) => <p className="!mb-0 text-sm text-secondary-text truncate max-w-[150px]" title={text}>{text}</p>,
				},
				{
					title: "Address",
					dataIndex: "address",
					render: (text: string) => <p className="!mb-0 text-sm text-secondary-text truncate max-w-[150px]" title={text ?? "N/A"}>{text ?? "N/A"}</p>,
				},
			]),
		{
			title: "Join Date",
			dataIndex: "joinDate",
			render: (text: string) => <p className="!mb-0 text-sm text-muted-text">{text}</p>,
			align: "center" as const,
		},
	];

	const data: TableDataType[] = subscriptions?.map((sub) => {
		const subscriber = sub?.subscriberId || sub?.subscriber;
		const plan = sub?.subscriptionPlanId || sub?.subscriptionPlan;
		const normalizedStatus = sub?.status || sub?.paymentStatus;

		return {
			key: sub?._id,
			id: sub?._id,
			name:
				viewType === "admin"
					? sub.username || "N/A"
					: subscriber?.username || "N/A",
			avatar: viewType === "admin" ? sub?.avatar : subscriber?.avatar,
			plan: plan?.name || "N/A",
			email: sub?.email || subscriber?.email || "N/A",
			address: sub?.address,
			price:
				typeof plan?.price === "number"
					? `$${plan.price.toFixed(2)}`
					: "N/A",
			joinDate: sub?.createdAt
				? new Date(sub.createdAt).toLocaleDateString()
				: "N/A",
			status:
				normalizedStatus === "ACTIVE"
					? "Active"
					: normalizedStatus === "PAST_DUE"
						? "Past Due"
						: normalizedStatus === "CANCELLED"
							? "Cancelled"
							: normalizedStatus === "EXPIRED"
								? "Expired"
								: sub?.isExpired
									? "Expired"
									: sub?.isCancelled
										? "Cancelled"
										: "Active",
		};
	});

	return (
		<div className="w-full">
			{title && (
				<div className="flex justify-between gap-2 bg-secondary-bg rounded-t-lg pb-2">
					<h4 className="text-[20px] font-medium text-primary-text">{title}</h4>
				</div>
			)}
			<div className="w-full overflow-x-auto">
				<Table
					columns={columns}
					dataSource={data}
					loading={loading}
					size="middle"
					pagination={
						pagination
							? {
								pageSize: pageSize,
								showSizeChanger: false,
								size: "small",
								className: "pt-2",
							}
							: false
					}
					locale={{ emptyText: "No recent subscribers" }}
					className="ant-table-custom"
				/>
			</div>
		</div>
	);
};

export default RecentSubscriber;

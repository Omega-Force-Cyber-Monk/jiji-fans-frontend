"use client";

import GlobalModal from "@/components/GlobalModal";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { applyApiErrorToForm, errorAlert } from "@/lib/alerts";
import { queryFormat } from "@/lib/helpers/queryFormat";
import {
    useCreatePayoutScheduleMutation,
    useGetPayoutSchedulesQuery,
    useUpdatePayoutScheduleStatusMutation,
} from "@/redux/features/transaction/transaction.api";
import { TQuery, TUniObject } from "@/types";
import { PlusIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import {
    Button,
    ConfigProvider,
    Form,
    InputNumber,
    message,
    Select,
    Switch,
    Table,
    TableColumnsType,
} from "antd";
import React, { useState } from "react";

const PayoutSchedulePage = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [query, setQuery] = useState<TQuery>({
        page: 1,
        limit: 10
    });
    const [messageApi, contextHolder] = message.useMessage();

    const { data, isLoading, isError, error } = useGetPayoutSchedulesQuery(queryFormat(query));
    const [createPayoutSchedule, { isLoading: isCreating }] = useCreatePayoutScheduleMutation();
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePayoutScheduleStatusMutation();

    const handleCreate = async (values: any) => {
        try {
            const payload: any = { ...values };
            const daysArr = Array.isArray(values.days) ? values.days : [values.days];
            
            if (values.payoutFrequency === 'WEEKLY') {
                payload.weekDays = daysArr;
                delete payload.days;
            } else {
                payload.days = daysArr;
            }
            
            await createPayoutSchedule(payload).unwrap();
            messageApi.success("Payout schedule created successfully");
            setIsModalOpen(false);
            form.resetFields();
        } catch (err) {
            applyApiErrorToForm(err, form, [
                "payoutFrequency",
                "days",
                "minimum_threshold",
                "processing_window",
                "holding_period",
                "interval",
                "schedule_month",
            ]);
            errorAlert({ error: err, messageApi });
        }
    };

    const toggleStatus = async (record: TUniObject) => {
        try {
            const newStatus = record.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            await updateStatus({ scheduleId: record._id, status: newStatus }).unwrap();
            messageApi.success(`Schedule status updated to ${newStatus}`);
        } catch (err) {
            errorAlert({ error: err, messageApi });
        }
    };

    const columns: TableColumnsType = [
        {
            title: "Frequency",
            dataIndex: "payoutFrequency",
            key: "payoutFrequency",
            className: "whitespace-nowrap",
            render: (text) => (
                <span className="inline-flex rounded-md bg-brand-primary/10 text-brand-primary px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                    {text}
                </span>
            ),
        },
        {
            title: "Days / Weekdays",
            dataIndex: "days",
            key: "days",
            className: "whitespace-nowrap",
            render: (days: number[], record: any) => {
                const arr = (days && days.length > 0) ? days : (record.weekDays || []);
                return <p className="text-base font-normal text-secondary-text whitespace-nowrap">{arr.join(", ")}</p>;
            },
        },
        {
            title: "Min Threshold",
            dataIndex: "minimum_threshold",
            key: "minimum_threshold",
            className: "whitespace-nowrap",
            render: (val) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">${val}</p>,
        },
        {
            title: "Processing Window",
            dataIndex: "processing_window",
            key: "processing_window",
            className: "whitespace-nowrap",
            render: (val) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{val} days</p>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            className: "whitespace-nowrap",
            render: (status: string, record: TUniObject) => (
                <Switch
                    checked={status === "ACTIVE"}
                    onChange={() => toggleStatus(record)}
                    loading={isUpdatingStatus}
                />
            ),
        },
    ];

    return (
        <div className="w-full space-y-6">
            {contextHolder}
            <AppBreadcrumb
                items={[
                    { title: "Home", href: "/admin/dashboard" },
                    { title: "Payout Schedules" },
                ]}
                className="mb-6!"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-primary-text flex items-center gap-3">
                        Payout Schedules
                        <button
                            onClick={() => setIsGuideModalOpen(true)}
                            className="inline-flex items-center justify-center p-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-black transition-all group"
                            title="How it works"
                        >
                            <InformationCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </h2>
                    <p className="text-sm text-muted-text">
                        Configure rules governing automatic payout execution frequency, minimum transfer limits, and holding periods.
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-primary hover:!bg-brand-secondary border-none h-10! px-6 rounded-md"
                >
                    Create Schedule
                </Button>
            </div>

            <GlobalModal
                isModalOpen={isGuideModalOpen}
                setIsModalOpen={setIsGuideModalOpen}
                onClose={() => setIsGuideModalOpen(false)}
                maxWidth="650px"
            >
                <div className="w-full rounded-md p-4">
                    <h2 className="text-2xl font-semibold mb-8 text-center text-primary-text flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center">
                            <InformationCircleIcon className="w-8 h-8 text-brand-primary" />
                        </div>
                        How Automatic Scheduler Works
                    </h2>

                    <div className="space-y-6 text-base text-secondary-text">
                        <div className="bg-secondary-bg rounded-xl p-6 border border-border-primary">
                            <h4 className="font-bold text-lg text-primary-text mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-black text-xs font-bold">1</span>
                                Scheduler Evaluation Rules
                            </h4>
                            <ul className="list-none space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">The scheduler runs checks automatically on scheduled payout days.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">Creators must have an <strong>Approved KYC/KYB</strong> status.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">Creators must have configured valid <strong>Payout Settings</strong> (Bank Transfer or Mobile Money).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm">Creators with active <strong>Pending</strong> or <strong>Processing</strong> manual/auto withdrawal requests are automatically skipped to avoid double payouts.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-secondary-bg rounded-xl p-6 border border-border-primary">
                            <h4 className="font-bold text-lg text-primary-text mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-black text-xs font-bold">2</span>
                                Thresholds & Holding Periods
                            </h4>
                            <ul className="list-none space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm"><strong>Minimum Threshold:</strong> Wallet balance must meet or exceed this amount for the auto-payout to trigger.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm"><strong>Holding Period:</strong> Cooldown window (in days) applied to incoming earnings before they become eligible for withdrawal.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <span className="text-sm"><strong>Processing Window:</strong> Duration (in days) allocated to process/dispatch transfers through Stripe or PawaPay.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-6 flex justify-center">
                            <Button
                                type="primary"
                                onClick={() => setIsGuideModalOpen(false)}
                                className="bg-brand-primary hover:!bg-brand-secondary border-none h-12 px-10 rounded-full text-base font-semibold text-black transition-transform hover:scale-105"
                            >
                                Got it
                            </Button>
                        </div>
                    </div>
                </div>
            </GlobalModal>

            <LoaderWraperComp isLoading={isLoading} isError={isError} error={error} className="min-h-[200px]">
                <div className="w-full bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
                    <div className="w-full overflow-x-auto p-0">
                        <Table
                            columns={columns}
                            dataSource={data?.data?.results || []}
                            rowKey="_id"
                            pagination={false}
                            className="!rounded-none border-0 whitespace-nowrap"
                        />
                    </div>
                </div>
            </LoaderWraperComp>

            <GlobalModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="600px"
            >
                <ConfigProvider
                    theme={{
                        token: {
                            controlHeight: 40,
                        },
                        components: {
                            Select: { borderRadius: 6 },
                            InputNumber: { borderRadius: 6 },
                        },
                    }}
                >
                    <div className="w-full rounded-md">
                        <h2 className="text-2xl font-semibold mb-6 text-center text-primary-text">Create Payout Schedule</h2>
                        <Form form={form} layout="vertical" onFinish={handleCreate} requiredMark={false}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Payout Frequency</span>}
                                    name="payoutFrequency"
                                    rules={[{ required: true }]}
                                    initialValue="MONTHLY"
                                    tooltip={{
                                        title: "How often the automatic payout scheduler runs checks (WEEKLY, MONTHLY, BY_MONTHLY, or ON_DEMAND).",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="col-span-1 md:col-span-2 mb-2"
                                >
                                    <Select
                                        className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md"
                                        options={['WEEKLY', 'MONTHLY', 'BY_MONTHLY', 'ON_DEMAND'].map((item) => ({ value: item, label: item }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Days (e.g. 15 for mid-month)</span>}
                                    name="days"
                                    rules={[{ required: true }]}
                                    tooltip={{
                                        title: "Specific trigger day of the cycle. For monthly, enter the day number (1-31). For weekly, enter the day of the week (1-7).",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md" placeholder="Enter day" min={1} max={31} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Minimum Threshold ($)</span>}
                                    name="minimum_threshold"
                                    rules={[{ required: true }]}
                                    tooltip={{
                                        title: "The minimum wallet balance (in USD) a creator must have before automatic payout is generated.",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Processing Window (days)</span>}
                                    name="processing_window"
                                    rules={[{ required: true }]}
                                    tooltip={{
                                        title: "The number of days the system is allowed to complete processing and dispatching the payout transaction.",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Holding Period (days)</span>}
                                    name="holding_period"
                                    tooltip={{
                                        title: "Cooldown period in days applied to new incoming client payments before they can be withdrawn.",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Interval (frequency factor)</span>}
                                    name="interval"
                                    rules={[{ required: true }]}
                                    tooltip={{
                                        title: "The interval factor (e.g. 1 means every single week/month, 2 means every 2 weeks/months).",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md" min={1} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Schedule Month (day of month)</span>}
                                    name="schedule_month"
                                    rules={[{ required: true }]}
                                    tooltip={{
                                        title: "The day of the calendar month when this specific rule executes (1-31).",
                                        icon: <InformationCircleIcon className="text-brand-primary" style={{ width: 16, height: 16, display: 'inline-block', color: 'var(--brand-primary)' }} />
                                    }}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full bg-primary-bg border-border-primary text-primary-text rounded-md" min={1} max={31} />
                                </Form.Item>
                            </div>

                            <div className="flex justify-center gap-4 mt-8">
                                <Button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 !h-10 rounded-md border-border-primary text-secondary-text hover:!border-primary-text"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isCreating}
                                    className="px-8 !h-10 bg-brand-primary hover:!bg-brand-secondary border-none rounded-md"
                                >
                                    Create Schedule
                                </Button>
                            </div>
                        </Form>
                    </div>
                </ConfigProvider>
            </GlobalModal>
        </div>
    );
};

export default PayoutSchedulePage;

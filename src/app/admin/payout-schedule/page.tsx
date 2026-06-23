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
import { PlusIcon } from "@heroicons/react/24/outline";
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
            const payload = {
                ...values,
                days: Array.isArray(values.days) ? values.days : [values.days],
            };
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
            title: "Days",
            dataIndex: "days",
            key: "days",
            className: "whitespace-nowrap",
            render: (days: number[]) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{days.join(", ")}</p>,
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
                                    className="col-span-1 md:col-span-2 mb-2"
                                >
                                    <Select
                                        className="!h-10 !w-full bg-primary-bg border-border-primary text-primary-text rounded-md"
                                        options={['WEEKLY', 'MONTHLY', 'BY_MONTHLY', 'ON_DEMAND'].map((item) => ({ value: item, label: item }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Days (e.g., 15 for monthly)</span>}
                                    name="days"
                                    rules={[{ required: true }]}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full !h-10 bg-primary-bg border-border-primary text-primary-text rounded-md" placeholder="Enter day" />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Minimum Threshold ($)</span>}
                                    name="minimum_threshold"
                                    rules={[{ required: true }]}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full !h-10 bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Processing Window (days)</span>}
                                    name="processing_window"
                                    rules={[{ required: true }]}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full !h-10 bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Holding Period (days)</span>}
                                    name="holding_period"
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full !h-10 bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Interval (days)</span>}
                                    name="interval"
                                    rules={[{ required: true }]}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full !h-10 bg-primary-bg border-border-primary text-primary-text rounded-md" min={0} />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-secondary-text font-medium text-sm">Schedule Month (day of month)</span>}
                                    name="schedule_month"
                                    rules={[{ required: true }]}
                                    className="mb-2"
                                >
                                    <InputNumber className="!w-full !h-10 bg-primary-bg border-border-primary text-primary-text rounded-md" min={1} max={31} />
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

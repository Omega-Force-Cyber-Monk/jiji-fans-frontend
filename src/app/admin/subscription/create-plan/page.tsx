"use client";

import GlobalModal from "@/components/GlobalModal";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import {
  useCreateSubscriptionPlanNewMutation,
  useGetAllSubscriptionPlansNewQuery,
  useUpdateSubscriptionPlanNewMutation,
} from "@/redux/features/subscription/subscription.api";
import { TUniObject } from "@/types";
import { cn } from "@/utils/cn";
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button, Col, Form, FormProps, Input, InputNumber, message, Row, Select } from "antd";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const CreatePlanPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const isEditMode = Boolean(planId);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [successModal, setSuccessModal] = useState(false);

  // Live preview state
  const [previewName, setPreviewName] = useState("");
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);
  const [previewCycle, setPreviewCycle] = useState<string>("month");
  const [previewFacilities, setPreviewFacilities] = useState<string[]>([""]);

  const { data: allPlans } = useGetAllSubscriptionPlansNewQuery(undefined, { skip: !isEditMode });
  const [cMutation, { isLoading: cLoading }] = useCreateSubscriptionPlanNewMutation();
  const [uMutation, { isLoading: uLoading }] = useUpdateSubscriptionPlanNewMutation();

  const isLoading = cLoading || uLoading;

  // Populate form when editing
  useEffect(() => {
    if (!isEditMode || !allPlans?.data) return;
    const plan = allPlans.data.find((p: TUniObject) => p._id === planId);
    if (!plan) return;
    const billingCycle =
      plan.billingCycle ||
      (plan.interval === 365 || plan.interval === 360 ? "year" : "month");
    form.setFieldsValue({ ...plan, billingCycle });
    setPreviewName(plan.name || "");
    setPreviewPrice(plan.price ?? null);
    setPreviewCycle(billingCycle);
    setPreviewFacilities(plan.facilities?.length ? plan.facilities : [""]);
  }, [allPlans, planId, isEditMode, form]);

  const syncPreview = () => {
    const vals = form.getFieldsValue();
    setPreviewName(vals.name || "");
    setPreviewPrice(vals.price ?? null);
    setPreviewCycle(vals.billingCycle || "month");
    const facs: string[] = vals.facilities || [""];
    setPreviewFacilities(facs.filter((f: string) => f?.trim()));
  };

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      const payload = {
        ...values,
        commission:
          typeof values.commission === "string"
            ? Number(values.commission)
            : values.commission,
      };

      if (isEditMode && planId) {
        await uMutation({ body: payload, planId }).unwrap();
      } else {
        await cMutation(payload).unwrap();
      }
      setSuccessModal(true);
    } catch (error) {
      applyApiErrorToForm(error, form, [
        "name", "price", "duration", "commission", "billingCycle", "facilities",
      ]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  const displayInterval = previewCycle === "year" ? "year" : "month";
  const facilities = previewFacilities.filter((f) => f?.trim());

  return (
    <div className="space-y-6">
      {contextHolder}
      <style>{`
        /* Ant Design InputNumber dark mode overrides */
        .ant-input-number-affix-wrapper {
          background-color: var(--primary-bg) !important;
          border-color: var(--border-primary) !important;
        }
        .ant-input-number-affix-wrapper:hover {
          border-color: var(--brand-primary) !important;
        }
        .ant-input-number-affix-wrapper-focused {
          border-color: var(--brand-primary) !important;
          box-shadow: 0 0 0 2px rgba(0, 176, 90, 0.1) !important;
        }
        .ant-input-number {
          background-color: transparent !important;
        }
        .ant-input-number-input {
          color: var(--primary-text) !important;
        }
        .ant-input-number-prefix {
          background-color: transparent !important;
          color: var(--muted-text) !important;
        }
      `}</style>

      <AppBreadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Subscriptions", href: "/admin/subscription" },
          { title: isEditMode ? "Edit Plan" : "Create Plan" },
        ]}
        className="mb-6!"
      />

      {/* Main Grid: Form + Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ── Form Column ── */}
        <div className="xl:col-span-7">
          <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-primary flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-brand-primary" />
              <h3 className="text-xl font-semibold text-primary-text">Plan Details</h3>
            </div>

            <div className="p-6">
              <Form
                form={form}
                name="admin-create-plan"
                layout="vertical"
                initialValues={{ commission: 0, billingCycle: "month", facilities: [""] }}
                onFinish={onFinish}
                onValuesChange={syncPreview}
                requiredMark={false}
              >
                {/* Plan Name */}
                <Form.Item
                  name="name"
                  label={<span className="text-sm font-medium text-secondary-text">Plan Name</span>}
                  rules={[{ required: true, message: "Plan name is required!" }]}
                >
                  <Input
                    id="create-plan-name"
                    size="large"
                    placeholder="e.g. Pro Plan"
                  />
                </Form.Item>

                {/* Price + Commission */}
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="price"
                      label={<span className="text-sm font-medium text-secondary-text">Plan Price (USD)</span>}
                      rules={[{ required: true, message: "Price is required!" }]}
                    >
                      <InputNumber
                        id="create-plan-price"
                        prefix={<span className="font-semibold text-muted-text">$</span>}
                        min={0.01}
                        step={0.01}
                        size="large"
                        className="w-full!"
                        placeholder="0.00"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="commission"
                      label={<span className="text-sm font-medium text-secondary-text">Commission (%)</span>}
                    >
                      <InputNumber<number>
                        id="create-plan-commission"
                        min={0}
                        max={100}
                        step={1}
                        formatter={(value) =>
                          value !== undefined && value !== null ? `${value}%` : ""
                        }
                        parser={(value) => {
                          if (!value) return 0;
                          const parsed = Number(value.replace("%", ""));
                          return Number.isNaN(parsed) ? 0 : parsed;
                        }}
                        size="large"
                        className="w-full!"
                        placeholder="0 – 100"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Billing Cycle */}
                <Form.Item
                  name="billingCycle"
                  label={<span className="text-sm font-medium text-secondary-text">Billing Cycle</span>}
                  rules={[{ required: true, message: "Billing cycle is required!" }]}
                >
                  <Select
                    id="create-plan-billing-cycle"
                    size="large"
                    placeholder="Select cycle..."
                    options={[
                      { label: "Monthly", value: "month" },
                      { label: "Yearly", value: "year" },
                    ]}
                  />
                </Form.Item>

                {/* Facilities */}
                <Form.Item
                  label={<span className="text-sm font-medium text-secondary-text">Features / Facilities</span>}
                >
                  <Form.List name="facilities">
                    {(fields, { add, remove }) => (
                      <>
                        <div className="space-y-2">
                          {fields.map((field) => (
                            <Form.Item
                              key={field.key}
                              required={false}
                              style={{ marginBottom: 0 }}
                            >
                              <div className="flex items-center gap-2">
                                <Form.Item
                                  {...field}
                                  rules={[{ required: true, message: "Feature cannot be empty" }]}
                                  noStyle
                                  className="flex-1"
                                >
                                  <Input
                                    size="large"
                                    placeholder="e.g. HD video access"
                                    className="flex-1"
                                  />
                                </Form.Item>
                                {fields.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(field.name)}
                                    className="p-1 text-error hover:text-error/70 transition-colors shrink-0"
                                  >
                                    <MinusCircleIcon className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </Form.Item>
                          ))}
                        </div>
                        <button
                          type="button"
                          id="create-plan-add-facility"
                          onClick={() => add()}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-brand-primary border border-brand-primary/30 border-dashed rounded-md hover:bg-brand-primary/5 transition-colors"
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                          Add Feature
                        </button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Link href="/admin/subscription" className="flex-1">
                    <Button
                      id="create-plan-cancel-btn"
                      block
                      style={{ height: 44 }}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    id="create-plan-submit-btn"
                    htmlType="submit"
                    type="primary"
                    size="large"
                    loading={isLoading}
                    className="flex-1"
                    style={{ height: 44 }}
                  >
                    {isEditMode ? "Save Changes" : "Create Plan"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* ── Preview Column ── */}
        <div className="xl:col-span-5">
          <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-border-primary">
              <h3 className="text-xl font-semibold text-primary-text">Live Preview</h3>
              <p className="text-sm font-medium text-muted-text mt-0.5">
                Updates as you fill in the form
              </p>
            </div>

            <div className="p-6 flex items-center justify-center">
              {/* Plan Card Preview */}
              <div className="w-full max-w-sm bg-primary-bg border border-border-primary rounded-lg p-6 flex flex-col gap-4">
                {/* Header */}
                <div className="text-center border-b border-border-primary pb-4">
                  <h4 className="text-2xl font-semibold text-primary-text mb-2">
                    {previewName || (
                      <span className="text-muted-text italic text-base font-medium">Plan name…</span>
                    )}
                  </h4>
                  <div className="flex items-baseline justify-center gap-1">
                    <CurrencyDollarIcon className="w-5 h-5 text-brand-primary self-start mt-1" />
                    <span className="text-4xl font-semibold text-brand-primary">
                      {previewPrice !== null && previewPrice !== undefined
                        ? previewPrice.toFixed(2)
                        : <span className="text-muted-text text-3xl italic font-medium">0.00</span>}
                    </span>
                    <span className="text-sm font-medium text-muted-text">/{displayInterval}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 min-h-[80px]">
                  {facilities.length > 0 ? (
                    facilities.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-secondary-text">{f}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm font-medium text-muted-text italic">
                      Add features to see them here…
                    </li>
                  )}
                </ul>

                {/* CTA Button Preview */}
                <div
                  className={cn(
                    "w-full py-3 rounded-md text-center text-sm font-medium transition-colors",
                    "bg-brand-primary text-white"
                  )}
                >
                  Subscribe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Modal ── */}
      <GlobalModal
        isModalOpen={successModal}
        setIsModalOpen={setSuccessModal}
        onClose={() => setSuccessModal(false)}
        closeIcon={false}
      >
        <div className="flex flex-col items-center gap-4 py-6 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-primary-text">
              {isEditMode ? "Plan Updated!" : "Plan Created!"}
            </h3>
            <p className="text-base font-medium text-muted-text mt-2">
              {isEditMode
                ? `"${previewName}" has been updated successfully.`
                : `"${previewName}" is now live and available to users.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Button
              id="success-modal-create-another-btn"
              block
              onClick={() => {
                setSuccessModal(false);
                form.resetFields();
                setPreviewName("");
                setPreviewPrice(null);
                setPreviewCycle("month");
                setPreviewFacilities([""]);
              }}
              style={{ height: 44 }}
            >
              {isEditMode ? "Edit Again" : "Create Another"}
            </Button>
            <Button
              id="success-modal-back-btn"
              type="primary"
              block
              onClick={() => router.push("/admin/subscription")}
              style={{ height: 44 }}
            >
              Back to Subscriptions
            </Button>
          </div>
        </div>
      </GlobalModal>
    </div>
  );
};

export default CreatePlanPage;

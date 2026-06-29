"use client";

import { useDeleteSubscriptionPlanNewMutation, useGetAllSubscriptionPlansNewQuery } from "@/redux/features/subscription/subscription.api";
import { TUniObject } from "@/types";
import { CheckCircleIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { message, Popconfirm } from "antd";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { data, isLoading, isError, error } = useGetAllSubscriptionPlansNewQuery(undefined);
  const [dMutation, { isLoading: dLoading }] = useDeleteSubscriptionPlanNewMutation();

  const plans: TUniObject[] = data?.data || [];

  const handleDelete = async (planId: string) => {
    try {
      messageApi.open({ key: "sub-delete", type: "loading", content: "Deleting plan..." });
      await dMutation(planId).unwrap();
      messageApi.open({ key: "sub-delete", type: "success", content: "Plan deleted successfully!", duration: 3 });
    } catch {
      messageApi.open({ key: "sub-delete", type: "error", content: "Failed to delete plan.", duration: 3 });
    }
  };

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Subscriptions" },
        ]}
        className="mb-6!"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className=""></div>
        <Link href="/admin/subscription/create-plan" id="subscription-create-plan-btn">
          <button className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-5 py-2.5 rounded-md transition-colors shrink-0">
            <PlusIcon className="w-4 h-4" />
            Create Plan
          </button>
        </Link>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        /* ── Skeleton Cards ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex flex-col gap-4"
            >
              {/* Plan name + price */}
              <div className="border-b border-border-primary pb-4 space-y-2">
                <div className="h-5 w-28 bg-skeleton-bg rounded-md" />
                <div className="h-8 w-20 bg-skeleton-bg rounded-md" />
                <div className="h-3 w-32 bg-skeleton-bg rounded-md" />
              </div>
              {/* Feature lines */}
              <div className="flex-1 space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-skeleton-bg rounded-full shrink-0" />
                    <div className="h-3 flex-1 bg-skeleton-bg rounded-md" />
                  </div>
                ))}
              </div>
              {/* Action buttons */}
              <div className="pt-4 border-t border-border-primary flex gap-2">
                <div className="flex-1 h-9 bg-skeleton-bg rounded-md" />
                <div className="w-20 h-9 bg-skeleton-bg rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* ── Error State ── */
        <div className="bg-error/10 border border-error/20 rounded-lg p-6 text-center">
          <p className="text-base font-medium text-error">Failed to load subscription plans. Please refresh.</p>
        </div>
      ) : plans.length > 0 ? (
        /* ── Plan Cards ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan: TUniObject) => {
            const billingCycle =
              plan.billingCycle ||
              (plan.interval === 365 || plan.interval === 360 ? "year" : "month");
            const facilities: string[] = plan.facilities || [];

            return (
              <div
                key={plan._id}
                className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex flex-col gap-4 hover:border-brand-primary/40 transition-all shadow-sm"
              >
                {/* Plan Header */}
                <div className="border-b border-border-primary pb-4">
                  <h3 className="text-xl font-semibold text-primary-text mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-brand-primary">${plan.price}</span>
                    <span className="text-sm font-medium text-muted-text">/{billingCycle}</span>
                  </div>
                  {plan.commission > 0 && (
                    <p className="text-xs font-medium text-muted-text mt-1">
                      {plan.commission}% platform commission
                    </p>
                  )}
                </div>

                {/* Facilities */}
                <ul className="flex-1 space-y-2">
                  {facilities.length > 0 ? (
                    facilities.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium text-secondary-text">
                        <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm font-medium text-muted-text">No features listed</li>
                  )}
                </ul>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border-primary">
                  <button
                    id={`subscription-edit-${plan._id}`}
                    onClick={() => router.push(`/admin/subscription/create-plan?planId=${plan._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-md transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <Popconfirm
                    title="Delete Plan"
                    description="This action is permanent and cannot be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, loading: dLoading }}
                    onConfirm={() => handleDelete(plan._id)}
                  >
                    <button
                      id={`subscription-delete-${plan._id}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-md transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="bg-secondary-bg border border-border-primary border-dashed rounded-lg h-[40vh] flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-brand-primary/10 rounded-full">
            <PlusIcon className="w-8 h-8 text-brand-primary/60" />
          </div>
          <p className="text-base font-medium text-muted-text">No subscription plans yet.</p>
          <Link href="/admin/subscription/create-plan">
            <button className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-5 py-2.5 rounded-md transition-colors">
              <PlusIcon className="w-4 h-4" />
              Create Your First Plan
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;

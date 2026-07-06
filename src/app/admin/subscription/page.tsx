"use client";

import { useDeleteSubscriptionPlanNewMutation, useGetAllSubscriptionPlansNewQuery } from "@/redux/features/subscription/subscription.api";
import { TUniObject } from "@/types";
import { CheckCircleIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { message } from "antd";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import GlobalModal from "@/components/GlobalModal";

const Page = () => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { data, isLoading, isError, error } = useGetAllSubscriptionPlansNewQuery(undefined);
  const [dMutation, { isLoading: dLoading }] = useDeleteSubscriptionPlanNewMutation();
  const [deletingPlan, setDeletingPlan] = useState<TUniObject | null>(null);

  const plans: TUniObject[] = data?.data || [];

  const handleDelete = async (planId: string) => {
    try {
      messageApi.open({ key: "sub-delete", type: "loading", content: "Deleting plan..." });
      await dMutation(planId).unwrap();
      messageApi.open({ key: "sub-delete", type: "success", content: "Plan deleted successfully!", duration: 3 });
    } catch (error: any) {
      const errMsg = error?.data?.message || error?.message || "Failed to delete plan.";
      messageApi.open({ key: "sub-delete", type: "error", content: errMsg, duration: 4 });
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
                  <button
                    id={`subscription-delete-${plan._id}`}
                    onClick={() => setDeletingPlan(plan)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-md transition-colors cursor-pointer"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
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

      <GlobalModal
        isModalOpen={!!deletingPlan}
        setIsModalOpen={(open) => {
          if (!open) setDeletingPlan(null);
        }}
        maxWidth="400px"
      >
        <div className="p-6 text-center space-y-5 ">
          <div className="w-12 h-12 mx-auto bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-primary-text">Delete Plan</h3>
            <p className="text-sm text-secondary-text leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-primary-text">{deletingPlan?.name}</span>? This action is permanent and cannot be undone.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full pt-2">
            <button
              onClick={() => setDeletingPlan(null)}
              className="flex-1 px-5 py-2.5 rounded-md border border-border-primary text-secondary-text text-sm font-medium hover:bg-primary-bg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (deletingPlan) {
                  handleDelete(deletingPlan._id);
                  setDeletingPlan(null);
                }
              }}
              disabled={dLoading}
              className="flex-1 px-5 py-2.5 rounded-md bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {dLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </GlobalModal>
    </div>
  );
};

export default Page;

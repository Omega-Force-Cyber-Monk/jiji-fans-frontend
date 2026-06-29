"use client";

import {
  useGetMySubscriptionsQuery,
  useCancelSubscriptionMutation,
} from "@/redux/features/subscription/subscription.api";
import { useGetUserStatsQuery } from "@/redux/features/dashboard/dashboard.api";
import { Breadcrumb } from "antd";
import Image from "@/components/ui/CImage";
import React from "react";
import { TMySubscription } from "@/types/subscription.type";
import MembershipSkeleton from "@/Common/Skeleton/app/(dashboard)/membership/MembershipSkeleton";
import { sweetAlertConfirmation } from "@/lib/alerts/sweetAlertConfirmation";
import { successAlert, errorAlert, TResError } from "@/lib/alerts";
import { useIdempotency } from "@/hooks/useIdempotency";


const Page = () => {
  const { data, isLoading } = useGetMySubscriptionsQuery({});
  const { data: statsData, isLoading: isStatsLoading } = useGetUserStatsQuery({});
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const { idempotencyKey, regenerateKey } = useIdempotency();

  const subscriptions = (data?.data?.subscriptions || []).filter(
    (sub: TMySubscription) => sub && sub.channel
  );

  const handleCancelSubscription = async (subscriptionId: string, channelName: string) => {
    sweetAlertConfirmation({
      object: `cancel your membership to ${channelName}`,
      icon: "warning",
      okay: "Yes, Cancel",
      conBtnColor: "#EF4444",
      func: async () => {

        try {
          await cancelSubscription({ subscriptionId, idempotencyKey }).unwrap();
          successAlert({
            title: "Cancelled!",
            text: `Your membership to ${channelName} has been successfully cancelled.`,
          });
          regenerateKey();
        } catch (err) {
          errorAlert({
            error: err as TResError,
            title: "Failed to cancel membership",
          });
        }
      },
    });
  };

  if (isLoading || isStatsLoading) {
    return <MembershipSkeleton />;
  }

  return (
    <div className="w-full container mx-auto">
      <Breadcrumb
        items={[
          { title: "Home", href: "/overview" },
          { title: "Memberships" },
        ]}
        className="mb-6"
      />

      {/* Stats Row */}
      {(subscriptions.length > 0 || statsData?.data) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex items-center justify-between">
            <div className="space-y-6">
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">Active Memberships</p>
              <h3 className="text-2xl font-semibold text-primary-text mt-6">
                {statsData?.data?.activeSubscriptions ?? subscriptions.length}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex items-center justify-between">
            <div className="space-y-6">
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">Total Amount Spent</p>
              <h3 className="text-2xl font-semibold text-primary-text mt-6">
                ${statsData?.data?.totalAmountSpent ?? 0}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex items-center justify-between">
            <div className="space-y-6">
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">Total Watch Time</p>
              <h3 className="text-2xl font-semibold text-success mt-6">
                {statsData?.data?.totalWatchTime ?? 0} Mins
              </h3>
            </div>
            <div className="h-12 w-12 rounded-md bg-success/10 flex items-center justify-center text-success">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="w-full mt-6">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-border-primary rounded-lg bg-secondary-bg p-8">
            <div className="h-16 w-16 bg-muted-text/10 rounded-md flex items-center justify-center text-muted-text mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.275-.626-6.04-1.708v-.109A11.386 11.386 0 018.5 11.75v-.003a3.73 3.73 0 00-.785-3.07M15 19.128a9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.275-.626-6.04-1.708v-.109A11.386 11.386 0 018.5 11.75v-.003a3.73 3.73 0 00-.785-3.07M12 9.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-primary-text mb-6">No Memberships Yet</h3>
            <p className="text-sm font-normal text-secondary-text">
              You haven't joined any channel memberships yet. Subscribe to your favorite creators to unlock exclusive content, posts, and perks!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription: TMySubscription) => (
              <div
                key={subscription._id}
                className="group relative rounded-lg bg-secondary-bg border border-border-primary overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                {/* Decorative Card Banner */}
                <div className="h-16 bg-gradient-to-r from-brand-primary/20 via-brand-primary/10 to-transparent w-full border-b border-border-primary/50 relative overflow-hidden">
                  <span className="absolute top-6 right-6 inline-flex items-center rounded-sm h-6 px-6 text-xs font-medium bg-success/10 text-success border border-success/20">
                    Active
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="p-6 pt-0 flex-1 flex flex-col">
                  {/* Channel Avatar overlapping the banner */}
                  <div className="relative -mt-8 mb-6 h-16 w-16 rounded-md overflow-hidden border border-primary-bg bg-primary-bg shadow-sm shrink-0">
                    <Image
                      src={
                        subscription.channel?.avatar ||
                        "/static/demo/channel_1.png"
                      }
                      alt={subscription.channel?.name || "Channel"}
                      height={500}
                      width={500}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Channel Meta */}
                  <div className="space-y-6 flex-1">
                    <h5 className="text-lg font-semibold text-primary-text group-hover:text-brand-primary transition-colors duration-200 truncate">
                      {subscription.channel?.name || "Unknown Channel"}
                    </h5>
                    <p className="text-sm font-normal text-secondary-text line-clamp-3 leading-relaxed">
                      {subscription.channel?.description || "No description available."}
                    </p>
                  </div>
                </div>

                {/* Action Row Footer */}
                <div className="p-6 border-t border-border-primary/50 bg-primary-bg/50 flex items-center justify-between gap-6 mt-6">
                  <div className="text-xs text-muted-text">
                    Renews: <span className="font-medium text-secondary-text">June 15, 2026</span>
                  </div>
                  <button
                    onClick={() => handleCancelSubscription(subscription._id, subscription.channel?.name || "Channel")}
                    disabled={isCancelling}
                    className="inline-flex items-center justify-center h-8 px-6 text-sm font-medium text-error bg-error/10 hover:bg-error hover:text-white border border-error/20 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Membership
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

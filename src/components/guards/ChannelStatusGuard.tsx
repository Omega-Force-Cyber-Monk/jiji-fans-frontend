"use client";

import React from "react";
import SectionContainer from "@/components/ui/SectionContainer";
import StatusSeal from "./StatusSeal";
import ChannelStatusGuardSkeleton from "@/Common/Skeleton/components/guards/ChannelStatusGuardSkeleton";

interface ChannelStatusGuardProps {
  channelStatus: string | undefined;
  isLoading: boolean;
  children: React.ReactNode;
}

const STATUS_CONFIG = {
  SUSPENDED: {
    title: "Channel Suspended",
    message:
      "Your channel has been suspended by administration. You currently cannot upload content or manage your channel. You will receive an email with further details regarding this suspension.",
  },
  REJECTED: {
    title: "Channel Application Rejected",
    message:
      "Your channel application has been rejected by our administration team. Please review the rejection reason sent to your email. If you believe this is an error, please contact our support team.",
  },
  PENDING: {
    title: "Your channel is under review",
    message:
      "You'll receive a response by email and in your dashboard once the review is complete. Reminder: Your channel content and subscriber data remain securely stored during this process.",
  },
};

export default function ChannelStatusGuard({
  channelStatus,
  isLoading,
  children,
}: ChannelStatusGuardProps) {

  if (isLoading) {
    return <ChannelStatusGuardSkeleton />;
  }

  if (!channelStatus || channelStatus === "APPROVED" || channelStatus === "PENDING") {
    return <>{children}</>;
  }

  const config = channelStatus && STATUS_CONFIG[channelStatus as keyof typeof STATUS_CONFIG];

  if (!config) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-[70vh] w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <SectionContainer className="flex justify-center items-center">
        <div className="w-full flex flex-col items-center justify-center">

          {/* Retro Circular Seal Stamp Pattern */}
          {/* <StatusSeal status={channelStatus as "PENDING" | "REJECTED" | "SUSPENDED"} /> */}

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary-text text-center mb-4">
            {config.title}
          </h2>

          {/* Description */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-base font-normal text-muted-text leading-relaxed">
              {config.message}
            </p>
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}


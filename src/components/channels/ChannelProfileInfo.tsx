"use client";

import Image from "@/components/ui/CImage";
import { Button, Select } from "antd";
import { CheckBadgeIcon, SparklesIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { TMyChannel, TChannelStatus } from "@/redux/features/channel/channel.api";
import ChannelProfileInfoSkeleton from "@/Common/Skeleton/Channels/ChannelProfileInfoSkeleton";

interface ChannelProfileInfoProps {
  channelData?: TMyChannel;
  isLoading?: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
  userRole?: string;
  userId?: string;
  isUpdatingStatus: boolean;
  isCreatingConversation: boolean;
  vanitySlug: string;
  origin: string;
  onCopyLink: () => void;
  onGetMembership: () => void;
  onChatWithUs: () => void;
  onStatusChange: (status: TChannelStatus) => void;
}

const ChannelProfileInfo = ({
  channelData,
  isLoading,
  isOwner,
  isAdmin,
  isSubscribed,
  userRole,
  userId,
  isUpdatingStatus,
  isCreatingConversation,
  vanitySlug,
  origin,
  onCopyLink,
  onGetMembership,
  onChatWithUs,
  onStatusChange,
}: ChannelProfileInfoProps) => {
  if (isLoading || !channelData) {
    return <ChannelProfileInfoSkeleton />;
  }

  const isUser = userRole === "user";
  const isNotOwner = userId !== channelData.owner;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16">
      {/* Avatar — overlapping banner */}
      <div className="relative -mt-22 h-32 sm:h-40 lg:h-48 w-32 sm:w-40 lg:w-48 shrink-0 rounded-full overflow-hidden border-[6px] border-primary-bg bg-secondary-bg z-20">
        <Image
          src={channelData.avatar || "/static/2Fans-01.svg"}
          alt="channel avatar"
          width={1000}
          height={1000}
          className="w-full h-full object-cover !relative"
        />
      </div>

      {/* Info & CTAs Container */}
      <div className="flex-1 flex flex-col md:flex-row justify-between items-center sm:items-start md:items-start mt-4 sm:mt-0 pt-0 sm:pt-4 gap-6 w-full">
        {/* Info block (Left side) */}
        <div className="space-y-2 text-center sm:text-left">
          {/* Name + status badge */}
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight h-auto sm:h-12">
              {channelData.name}
            </h1>
            {channelData.status === "APPROVED" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-sm font-semibold text-brand-primary tracking-wide">
                <CheckBadgeIcon className="size-6 text-brand-primary shrink-0" />
                Verified
              </span>
            )}
          </div>

          {/* Vanity URL (owner only) */}
          {isOwner && vanitySlug && (
            <div className="flex items-center gap-2 text-[11px] text-secondary-text bg-secondary-bg border border-border-primary rounded-sm px-3 py-1 w-fit mx-auto sm:mx-0 mt-1">
              <span className="font-medium truncate opacity-70">
                {origin ? `${origin}/${vanitySlug}` : `/${vanitySlug}`}
              </span>
              <button
                onClick={onCopyLink}
                className="text-brand-primary font-semibold hover:underline"
              >
                Copy
              </button>
            </div>
          )}

          {/* Description */}
          <p className="text-base text-secondary-text font-medium leading-relaxed max-w-xl mt-3">
            {channelData.description ||
              "Exploring the latest in technology, innovations, and breakthroughs"}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-base text-muted-text font-medium mt-3">
            <span>{channelData.totalSubscribers?.toLocaleString() || "0"} Members</span>
            <span className="opacity-40">•</span>
            <span>{channelData.totalVideos || "0"} videos</span>
          </div>
        </div>

        {/* CTA buttons (Right side) */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
          {isUser && !isSubscribed && (
            <Button
              type="primary"
              shape="round"
              className="!h-12 !px-6 !bg-brand-primary hover:!bg-brand-primary/90 !text-white !font-bold !text-base !rounded-full !shadow-md !border-none !flex !items-center !gap-2 hover:!-translate-y-0.5 transition-all duration-300"
              onClick={onGetMembership}
            >
              <SparklesIcon className="size-5" />
              Get Membership
            </Button>
          )}

          {isUser && isNotOwner && (
            <Button
              onClick={onChatWithUs}
              loading={isCreatingConversation}
              shape="round"
              className="!h-12 !px-6 !bg-secondary-bg hover:!bg-brand-primary/10 !text-primary-text hover:!text-brand-primary !border-border-primary hover:!border-brand-primary/50 !font-semibold !text-base !rounded-full !flex !items-center !gap-2 hover:!-translate-y-0.5 transition-all duration-300"
            >
              <ChatBubbleLeftRightIcon className="size-5" />
              Chat With Us
            </Button>
          )}

          {isAdmin && (
            <div className="flex items-center gap-3 bg-secondary-bg p-1.5 rounded-xl border border-border-primary shadow-sm">
              <span className="text-xs text-secondary-text font-semibold ml-2 uppercase tracking-wider">
                Admin Status:
              </span>
              <Select
                value={channelData.status || "PENDING"}
                onChange={(value) => onStatusChange(value as TChannelStatus)}
                loading={isUpdatingStatus}
                disabled={isUpdatingStatus}
                className="w-36 custom-select-small font-medium"
                options={[
                  { value: "APPROVED", label: "Approved" },
                  { value: "PENDING", label: "Pending" },
                  { value: "REJECTED", label: "Rejected" },
                  { value: "SUSPENDED", label: "Suspended" },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelProfileInfo;

"use client";

import Image from "@/components/ui/CImage";
import { Button } from "antd";
import { DocumentDuplicateIcon, PencilIcon } from "@heroicons/react/24/outline";
import { TMyChannel } from "@/redux/features/channel/channel.api";
import ChannelBannerSkeleton from "@/Common/Skeleton/Channels/ChannelBannerSkeleton";

interface ChannelBannerProps {
  channelData?: TMyChannel;
  isLoading?: boolean;
  isOwner: boolean;
  onCopyLink: () => void;
  onEditClick: () => void;
}

const ChannelBanner = ({
  channelData,
  isLoading,
  isOwner,
  onCopyLink,
  onEditClick,
}: ChannelBannerProps) => {
  if (isLoading || !channelData) {
    return <ChannelBannerSkeleton />;
  }

  return (
    <div className="relative overflow-hidden w-full h-[250px] sm:h-[350px] lg:h-[300px] bg-secondary-bg rounded-t-lg rounded-b-md">
      <Image
        src={channelData.banner || "/static/2Fans-01.svg"}
        alt="channel cover"
        fill
        unoptimized
        priority
        className="object-cover"
      />

      {isOwner && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
          <Button
            type="primary"
            shape="circle"
            size="large"
            onClick={onCopyLink}
            className="!bg-brand-primary !border-none !flex !items-center !justify-center shadow-lg"
          >
            <DocumentDuplicateIcon className="w-5 h-5 text-white" />
          </Button>
          <Button
            type="primary"
            shape="circle"
            size="large"
            onClick={onEditClick}
            className="!bg-brand-primary !border-none !flex !items-center !justify-center shadow-lg"
          >
            <PencilIcon className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChannelBanner;

import ChannelBannerSkeleton from "@/Common/Skeleton/Channels/ChannelBannerSkeleton";
import ChannelProfileInfoSkeleton from "@/Common/Skeleton/Channels/ChannelProfileInfoSkeleton";

const ChannelInfoSkeleton = () => {
  return (
    <div className="space-y-0">
      <ChannelBannerSkeleton />
      <ChannelProfileInfoSkeleton />
    </div>
  );
};

export default ChannelInfoSkeleton;

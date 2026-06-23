import VideoCardSkeleton from "@/Common/Skeleton/Channels/VideoCardSkeleton";

const VideosSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 2xl:grid-cols-4 gap-x-2 gap-y-5 sm:gap-x-5 2xl:gap-x-6 2xl:gap-y-7">
      {Array.from({ length: 8 }, (_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default VideosSkeleton;

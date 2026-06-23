import React from "react";
import { TMyChannel } from "@/redux/features/channel/channel.api";
import ChannelAboutSkeleton from "@/Common/Skeleton/Channels/ChannelAboutSkeleton";
import { UsersIcon, VideoCameraIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface ChannelAboutProps {
  channelData?: TMyChannel;
}

const ChannelAbout = ({ channelData }: ChannelAboutProps) => {
  if (!channelData) {
    return <ChannelAboutSkeleton />;
  }

  return (
    <div className=" space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {channelData.status === "SUSPENDED" && (
        <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-r-lg shadow-sm flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="font-medium">
            This channel is currently suspended and is not visible to the public.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* About text section (takes up more space) */}
        <div className="md:col-span-8 bg-secondary-bg/80 backdrop-blur-md border border-border-primary rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-primary/50">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <InformationCircleIcon className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary-text tracking-tight">About the Channel</h3>
          </div>

          <div className="prose prose-invert max-w-none">
            {channelData.about ? (
              <p className="text-secondary-text leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                {channelData.about}
              </p>
            ) : (
              <p className="text-muted-text italic text-center py-8">
                No about information provided by the creator.
              </p>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">
          {/* Members Stat Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/20 rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/40">
            <div className="absolute right-5 p-4 opacity-40 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
              <UsersIcon className="size-18 text-brand-primary" />
            </div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary mb-2">
                <UsersIcon className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider">Community</span>
              </div>
              <p className="text-4xl font-bold text-primary-text">
                {channelData.totalSubscribers?.toLocaleString() || "0"}
              </p>
              <p className="text-muted-text font-medium">Total Members</p>
            </div>
          </div>

          {/* Videos Stat Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/40">
            <div className="absolute right-5 p-4 opacity-40 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
              <VideoCameraIcon className="size-18 text-emerald-500" />
            </div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <VideoCameraIcon className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider">Content</span>
              </div>
              <p className="text-4xl font-bold text-primary-text">
                {channelData.totalVideos?.toLocaleString() || "0"}
              </p>
              <p className="text-muted-text font-medium">Published Videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelAbout;

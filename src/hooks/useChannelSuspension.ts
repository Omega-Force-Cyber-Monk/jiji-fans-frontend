import { useGetMyChannelQuery } from "@/redux/features/channel/channel.api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to check if the user's channel has status issues
 * Automatically redirects based on channel status:
 * - SUSPENDED → /channel-suspended
 * - REJECTED → /channel-rejected
 * - PENDING → /channel-under-review
 */
export const useChannelSuspensionGuard = (enabled: boolean = true) => {
  const router = useRouter();
  const { data: channelData, error, isLoading } = useGetMyChannelQuery(
    { limit: 1 },
    {
      skip: !enabled,
      pollingInterval: 0, // Don't poll, just check once
    }
  );

  useEffect(() => {
    if (isLoading) return;

    // Check if error indicates status issue
    if (error) {
      const errorMessage = (error as any)?.data?.message || "";
      
      if (errorMessage.includes("CHANNEL_SUSPENDED") || errorMessage.includes("channel has been suspended")) {
        router.replace("/channel-suspended");
        return;
      }
      
      if (errorMessage.includes("CHANNEL_REJECTED") || errorMessage.includes("channel application has been rejected")) {
        router.replace("/channel-rejected");
        return;
      }
      
      if (errorMessage.includes("CHANNEL_PENDING") || errorMessage.includes("channel is currently under review")) {
        router.replace("/channel-under-review");
        return;
      }
    }

    // Check if channel data shows status issues
    if (channelData?.data?.status) {
      const status = channelData.data.status;
      
      if (status === "SUSPENDED") {
        router.replace("/channel-suspended");
      } else if (status === "REJECTED") {
        router.replace("/channel-rejected");
      } else if (status === "PENDING") {
        router.replace("/channel-under-review");
      }
    }
  }, [channelData, error, isLoading, router]);

  return {
    channelStatus: channelData?.data?.status,
    isLoading,
    error,
  };
};

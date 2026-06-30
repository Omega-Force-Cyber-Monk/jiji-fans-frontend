"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import Cookies from "js-cookie";

import { useAppSelector } from "@/redux/hook";
import { useAppContext } from "@/lib/providers/ContextProvider";
import {
  TMyChannel,
  TChannelStatus,
  useUpdateChannelStatusMutation,
} from "@/redux/features/channel/channel.api";
import {
  useGetCurrentChannelSubscriptionQuery,
  ISubscription,
} from "@/redux/features/subscription/subscription.api";
import { errorAlert, TResError } from "@/lib/alerts";
import { apiUrl } from "@/config";
import { copyToClipboard } from "@/utils/copyToClipBoard";
import {
  getChannelShareUrl,
  resolveChannelSlug,
} from "@/lib/helpers/channelSlug";
import { useCreateConversationMutation } from "@/redux/features/messages/messages.api";

import ChannelBanner from "./ChannelBanner";
import ChannelProfileInfo from "./ChannelProfileInfo";
import ChannelReportModal from "./ChannelReportModal";
import ChannelEditModal from "./ChannelEditModal";

interface ChannelInfoProps {
  channelData?: TMyChannel;
  isLoading?: boolean;
  onSelectTab?: (key: string) => void;
  backFallbackPath?: string;
}

const ChannelInfo = ({
  channelData,
  isLoading,
  onSelectTab,
}: ChannelInfoProps) => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();
  const { socket, messageApi: globalMessageApi } = useAppContext();

  const [openReportModal, setOpenReportModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [createConversation] = useCreateConversationMutation();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [origin, setOrigin] = useState("");

  const userRole = user?.role?.toLowerCase();
  const channelId = channelData?._id || "";
  const isAdmin = userRole === "admin";
  const isOwner = user?._id === channelData?.owner;
  const vanitySlug = resolveChannelSlug(channelData);
  const shareUrl = getChannelShareUrl(channelData, origin);

  const { data: subscriptionData } = useGetCurrentChannelSubscriptionQuery(
    channelId,
    { skip: !channelData?._id || userRole !== "user" },
  );

  const [updateChannelStatus, { isLoading: isUpdatingStatus }] =
    useUpdateChannelStatusMutation();

  const isSubscribed = Boolean(
    (subscriptionData?.data as ISubscription | undefined)?.status === "ACTIVE",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopyLink = () => {
    if (shareUrl) {
      copyToClipboard(shareUrl);
      message.success("Channel link copied to clipboard!");
    }
  };

  const handleStatusChange = async (status: TChannelStatus) => {
    if (!channelData?._id) return;
    const key = "channel-status";
    messageApi.open({
      key,
      type: "loading",
      content: `Updating channel status to ${status.toLowerCase()}...`,
    });
    try {
      await updateChannelStatus({ channelId: channelData._id, status }).unwrap();
      messageApi.open({
        key,
        type: "success",
        content: `Channel status updated to ${status.toLowerCase()} successfully`,
        duration: 3,
      });
    } catch (error) {
      errorAlert({ error: error as TResError, messageApi });
      messageApi.destroy(key);
    }
  };

  const handleGetMembership = () => {
    if (onSelectTab) {
      onSelectTab("membership");
      return;
    }
    if (typeof window !== "undefined") {
      window.location.hash = "membership";
    }
  };

  const handleChatWithUs = async () => {
    if (!channelData?.owner) {
      globalMessageApi.error("Creator not found.");
      return;
    }
    setIsCreatingConversation(true);
    try {
      const result = await createConversation({
        conversationType: "PRIVATE",
        participants: [channelData.owner],
        title: "",
        avatar: "",
      }).unwrap();

      if (!result?.data?.conversationId) {
        throw new Error("Failed to create conversation.");
      }

      const newConversationId = result.data.conversationId;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("activeConversationId", newConversationId);
      }
      if (socket && !socket.connected) socket.connect();
      router.push(
        `/messages/${newConversationId}?receiver=${channelData.owner}`,
      );
    } catch (error: unknown) {
      errorAlert({ error: error as TResError, messageApi });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <>
      {contextHolder}

      <ChannelBanner
        channelData={channelData}
        isLoading={isLoading}
        isOwner={isOwner}
        onCopyLink={handleCopyLink}
        onEditClick={() => setOpenEditModal(true)}
      />

      <ChannelProfileInfo
        channelData={channelData}
        isLoading={isLoading}
        isOwner={isOwner}
        isAdmin={isAdmin}
        isSubscribed={isSubscribed}
        userRole={userRole}
        userId={user?._id}
        isUpdatingStatus={isUpdatingStatus}
        isCreatingConversation={isCreatingConversation}
        vanitySlug={vanitySlug}
        origin={origin}
        onCopyLink={handleCopyLink}
        onGetMembership={handleGetMembership}
        onChatWithUs={handleChatWithUs}
        onStatusChange={handleStatusChange}
      />

      <ChannelReportModal
        isOpen={openReportModal}
        onClose={() => setOpenReportModal(false)}
        channelId={channelId}
      />

      <ChannelEditModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        channelData={channelData}
      />
    </>
  );
};

export default ChannelInfo;

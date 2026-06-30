"use client";
import { message, Modal, Checkbox, Input, Avatar } from "antd";
import { useEffect, useState } from "react";
import { TQuery, TUniObject } from "@/types";
import { useParams, useRouter } from "next/navigation";
import LoaderWraperComp from "../LoaderWraperComp";
import { cn } from "@/utils/cn";
import { handleImageError } from "@/lib/handleImageError";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import { useAppSelector } from "@/redux/hook";
import { errorAlert } from "@/lib/alerts";
import Image from "@/components/ui/CImage";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useLazyGetConversationsQuery, useCreateConversationMutation } from "@/redux/features/messages/messages.api";
import { useLazyGetMySubscribersQuery } from "@/redux/features/channel/channel.api";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { apiUrl } from "@/config";
import Cookies from "js-cookie";

const ConversationList = ({
  className,
  basePath = "/messages",
}: {
  className: string;
  basePath?: string;
}) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { conversation: conversationId } = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const { socket } = useAppContext();
  const [data, setData] = useState<TUniObject[]>([]);
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });

  const [triggerGetConversations] = useLazyGetConversationsQuery();
  const [triggerGetSubscribers, { isLoading: isFetchingSubscribers }] = useLazyGetMySubscribersQuery();
  const [createConversation, { isLoading: isCreatingGroup }] = useCreateConversationMutation();

  const isCreatorUser = user?.role === "Creator" || user?.role?.toLowerCase() === "creator";

  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(user?.avatar || "/static/demo-image.jpg");
  const [subscribersList, setSubscribersList] = useState<any[]>([]);
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<string[]>([]);
  const [subscribersSearchQuery, setSubscribersSearchQuery] = useState("");

  const handleOpenCreateGroupModal = async () => {
    setIsCreateGroupModalVisible(true);
    setGroupTitle("");
    setGroupAvatar(user?.avatar || "/static/demo-image.jpg");
    setSelectedSubscriberIds([]);
    try {
      const subscribersRes = await triggerGetSubscribers({ limit: 1000 }).unwrap();
      const rawList = subscribersRes?.data?.subscribers || [];
      const formattedList = rawList
        .map((sub: any) => ({
          id: sub?.subscriber?._id,
          username: sub?.subscriber?.username || "N/A",
          email: sub?.subscriber?.email || "N/A",
          avatar: sub?.subscriber?.avatar || "",
        }))
        .filter((u: any) => !!u.id);
      setSubscribersList(formattedList);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to load subscribers.");
    }
  };

  const handleCreateGroupSubmit = async () => {
    if (!groupTitle.trim()) {
      messageApi.error("Please enter a group title.");
      return;
    }
    if (selectedSubscriberIds.length < 2) {
      messageApi.error("Please select at least 2 subscribers for a group conversation.");
      return;
    }

    try {
      const result = await createConversation({
        conversationType: "GROUP",
        participants: selectedSubscriberIds,
        title: groupTitle.trim(),
        avatar: groupAvatar || "/static/demo-image.jpg",
      }).unwrap();

      if (result?.data?.conversationId) {
        messageApi.success("Group chat created successfully!");
        setIsCreateGroupModalVisible(false);
        fetchData({});
        router.push(`${basePath}/${result.data.conversationId}`);
      } else {
        messageApi.error("Failed to create group conversation.");
      }
    } catch (error) {
      console.error(error);
      messageApi.error("An error occurred while creating group conversation.");
    }
  };

  const filteredSubscribers = subscribersList.filter(
    (sub) =>
      sub.username.toLowerCase().includes(subscribersSearchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(subscribersSearchQuery.toLowerCase())
  );

  const fetchData = async ({
    searchTerm: search,
    type,
  }: {
    searchTerm?: string;
    type?: "search" | "next";
  }) => {
    try {
      if (type === "next") {
        if (!query.page) return;
      } else {
        setIsLoading(true);
      }

      const res = await triggerGetConversations({
        page: type === "next" ? (query.page as number) : 1,
        search: search || undefined,
        limit: query.limit,
      }).unwrap();

      const resData = res?.data;
      const nextPage = resData?.page < resData?.totalPages ? resData?.page + 1 : null;
      setQuery((c) => ({
        ...c,
        page: nextPage,
      }));
      const fetchedResults = resData?.result || resData?.results || [];
      const dataArray = Array.isArray(fetchedResults) ? fetchedResults : [];

      if (type === "next") {
        setData((c) => [...c, ...dataArray]);
      } else {
        console.log("CONVERSATIONS RESPONSE DATA:", dataArray);
        setData(dataArray);
      }
    } catch (error) {
      console.error(error);
      errorAlert({ error: error as any, messageApi });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData({});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: any) => {
      const incomingConversationId =
        msg?.conversationId ||
        (typeof msg?.conversation === "string"
          ? msg.conversation
          : msg?.conversation?._id);

      if (!incomingConversationId) return;

      // Update local message map
      setLastMessagesMap((prev) => ({
        ...prev,
        [incomingConversationId]: msg.text || "sent an attachment",
      }));

      setData((prevData) => {
        const exists = prevData.some((c) => c._id === incomingConversationId);

        if (!exists) {
          setTimeout(() => {
            fetchData({});
          }, 0);
          return prevData;
        }

        const isMessagesPage = typeof window !== "undefined" && window.location.pathname.startsWith("/messages/");
        const isViewingThis = isMessagesPage && conversationId === incomingConversationId;

        const updated = prevData.map((c) => {
          if (c._id === incomingConversationId) {
            const currentUnread = c.unreadCount || 0;
            return {
              ...c,
              updatedAt: msg.createdAt || new Date().toISOString(),
              unreadCount: isViewingThis ? 0 : currentUnread + 1,
              lastMessage: {
                text: msg.text || "",
                attachments: msg.attachments || [],
                createdAt: msg.createdAt || new Date().toISOString(),
              },
            };
          }
          return c;
        });

        return [...updated].sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });
    };
    socket.on("new-message", handler);
    return () => {
      socket.off("new-message", handler);
    };
  }, [socket, conversationId]);

  // Fetch the last message for each conversation when the list is loaded or refreshed
  useEffect(() => {
    if (!data.length) return;
    const token = Cookies.get("accessToken");
    if (!token) return;

    data.forEach((conv) => {
      const convId = conv._id;
      if (!convId || lastMessagesMap[convId]) return;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      fetch(`${apiUrl}/messages/${convId}?limit=1`, { headers })
        .then((r) => r.json())
        .then((res) => {
          const fetchedResults = res?.data?.result || res?.data?.results || [];
          const lastMsg = fetchedResults[0];
          if (lastMsg) {
            setLastMessagesMap((prev) => ({
              ...prev,
              [convId]: lastMsg.text || "sent an attachment",
            }));
          }
        })
        .catch((err) => {
          console.error(`Failed to fetch last message for conv ${convId}:`, err);
        });
    });
  }, [data]);

  useEffect(() => {
    if (!conversationId) return;
    setData((prevData) =>
      prevData.map((c) => {
        if (c._id === conversationId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  }, [conversationId]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    fetchData({ type: "search", searchTerm: val });
  };

  const resolveParticipants = (conversation: TUniObject) => {
    return (
      conversation?.participants ||
      conversation?.users ||
      conversation?.user ||
      []
    );
  };

  const getOtherParticipant = (participants: TUniObject[]) => {
    if (!participants?.length) return null;
    return (
      participants.find((p) => p?._id !== user?._id) || participants[0] || null
    );
  };

  return (
    <div className={cn("w-full p-4 pr-1 bg-secondary-bg/40 flex flex-col h-full", className)}>
      {contextHolder}
      <div className="mr-3 mb-4 relative shrink-0">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-secondary-bg border border-border-primary/80 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/5 transition-all duration-200"
        />
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-text" />
      </div>

      <div className="mb-3 pr-3 flex justify-between items-center shrink-0">
        <span className="font-semibold text-primary-text text-base tracking-wide">Conversations</span>
        <div className="flex items-center gap-2">
          {isCreatorUser && (
            <button
              onClick={handleOpenCreateGroupModal}
              disabled={isFetchingSubscribers}
              className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              title="Create a group chat with selected subscribers"
            >
              {isFetchingSubscribers ? (
                <span className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>👥 Create Group</span>
              )}
            </button>
          )}
          <span className="text-xs font-medium text-muted-text bg-secondary-bg/60 px-2 py-0.5 rounded-full">
            {data?.length} chat{data?.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <LoaderWraperComp
        isError={false}
        isLoading={isLoading}
        loader={<LoadingContent />}
        dataEmpty={data?.length < 1}
      >
        <div
          className="flex-1 overflow-y-auto max-h-[calc(100vh-180px)] max-w-full overflow-x-hidden pr-2 custom-scrollbar"
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.scrollTop + target.offsetHeight ===
              target.scrollHeight
            ) {
              fetchData({ type: "next", searchTerm });
            }
          }}
        >
          {data.map((conversation: TUniObject, index: number) => {
            const participants = resolveParticipants(conversation);
            const other = getOtherParticipant(participants);
            const receiverId = other?._id || participants?.[0]?._id;
            const isCreator = other?.role?.toLowerCase?.() === "creator";
            const title =
              conversation?.title ||
              (isCreator
                ? other?.channel?.name || other?.username
                : other?.username || other?.name) ||
              "Unknown";
            const avatar =
              (isCreator ? other?.channel?.avatar : other?.avatar) ||
              "/static/demo-image.jpg";

            const getPreviewText = (conv: TUniObject) => {
              const lastMsg = conv?.lastMessage;
              if (lastMsg) {
                if (typeof lastMsg === "string") return lastMsg.trim();
                if (Array.isArray(lastMsg) && lastMsg.length > 0) {
                  return (lastMsg[0]?.text || "sent an attachment").trim();
                }
                if (typeof lastMsg === "object") {
                  return (lastMsg.text || "sent an attachment").trim();
                }
              }
              if (conv?.latestMessage?.text) return conv.latestMessage.text.trim();
              if (conv?.message?.text) return conv.message.text.trim();
              if (typeof conv?.text === "string") return conv.text.trim();
              return "Start a conversation";
            };

            const previewText =
              lastMessagesMap[conversation._id] ||
              getPreviewText(conversation);
            const isSelected = conversationId === conversation._id;
            const isUnread = conversation.unreadCount > 0;
            return (
              <div
                key={conversation?._id || index}
                className={cn(
                  "relative text-primary-text px-4 py-3.5 mb-2 rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden",
                  "hover:bg-secondary-bg hover:border-border-primary/60",
                  {
                    "bg-primary-bg border-border-primary/50": !isSelected,
                    "bg-secondary-bg border-emerald-500/30": isSelected,
                  },
                )}
                onClick={() =>
                  router.push(
                    `${basePath}/${conversation._id}?receiver=${receiverId || ""}`,
                  )
                }
              >
                {/* Left side green accent indicator for active conversation */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md" />
                )}

                <div className="flex items-center gap-3.5 w-full">
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "rounded-full overflow-hidden w-[46px] h-[46px] p-[1px] bg-primary-bg border transition-all duration-300",
                        {
                          "border-border-primary": !isSelected,
                          "border-emerald-500/40": isSelected,
                        },
                      )}
                    >
                      <Image
                        src={avatar}
                        alt={title}
                        width={46}
                        height={46}
                        onError={handleImageError}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {conversation.isActive && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-primary-bg animate-pulse-slow" />
                    )}
                  </div>
                  <div className="flex justify-between items-center w-full min-w-0 gap-3">
                    <div className="min-w-0 flex-1">
                      <h1 className={cn("text-base text-primary-text truncate line-clamp-1", {
                        "font-bold": isUnread,
                        "font-semibold": !isUnread,
                      })}>
                        {title}
                      </h1>
                      <p className={cn("text-xs truncate mt-0.5", {
                        "text-primary-text font-semibold": isUnread,
                        "text-muted-text": !isUnread,
                      })}>
                        {previewText}
                      </p>
                    </div>
                    <div className="text-xs text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className={cn("font-medium", isUnread ? "text-emerald-500 font-semibold" : "text-muted-text")}>
                        {compareByCTime({
                          preTime: conversation.updatedAt,
                        })}
                      </span>
                      {isUnread && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-emerald-500/10">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </LoaderWraperComp>

      {/* Create Group Modal */}
      <Modal
        title={<span className="text-lg font-semibold text-primary-text">Create Group Conversation</span>}
        open={isCreateGroupModalVisible}
        onOk={handleCreateGroupSubmit}
        onCancel={() => setIsCreateGroupModalVisible(false)}
        confirmLoading={isCreatingGroup}
        okText="Create Group"
        okButtonProps={{
          className: "bg-emerald-500 hover:bg-emerald-600 border-none text-white font-semibold rounded-md",
          disabled: selectedSubscriberIds.length < 2 || !groupTitle.trim(),
        }}
        cancelButtonProps={{
          className: "border-border-primary text-secondary-text hover:text-primary-text rounded-md",
        }}
        className="dark-modal"
      >
        <div className="space-y-4 my-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-secondary-text">Group Title</label>
            <Input
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="Enter group chat title..."
              className="bg-secondary-bg border-border-primary text-primary-text placeholder:text-muted-text rounded-md h-10 focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-secondary-text">Group Avatar (Optional)</label>
            <Input
              value={groupAvatar}
              onChange={(e) => setGroupAvatar(e.target.value)}
              placeholder="Enter group avatar URL..."
              className="bg-secondary-bg border-border-primary text-primary-text placeholder:text-muted-text rounded-md h-10 focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-secondary-text">
                Select Subscribers ({selectedSubscriberIds.length} selected)
              </label>
              <div className="flex items-center gap-3">
                {filteredSubscribers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const allFilteredIds = filteredSubscribers.map((sub) => sub.id);
                      const allAreSelected = allFilteredIds.every((id) => selectedSubscriberIds.includes(id));
                      if (allAreSelected) {
                        setSelectedSubscriberIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
                      } else {
                        setSelectedSubscriberIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
                      }
                    }}
                    className="text-xs text-emerald-500 font-semibold hover:text-emerald-600 cursor-pointer bg-none border-none p-0"
                  >
                    {filteredSubscribers.map((sub) => sub.id).every((id) => selectedSubscriberIds.includes(id))
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
                <span className="text-xs text-muted-text font-medium">Requires at least 2</span>
              </div>
            </div>
            <Input
              value={subscribersSearchQuery}
              onChange={(e) => setSubscribersSearchQuery(e.target.value)}
              placeholder="Search subscribers..."
              className="bg-secondary-bg border-border-primary text-primary-text placeholder:text-muted-text rounded-md mb-2 h-9 text-xs focus:border-emerald-500/50"
            />

            <div className="max-h-56 overflow-y-auto border border-border-primary/80 rounded-md p-2 divide-y divide-border-primary/40 space-y-1 bg-secondary-bg/20 custom-scrollbar">
              {isFetchingSubscribers ? (
                <div className="py-8 text-center text-xs text-muted-text animate-pulse">Loading subscribers...</div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-text">No subscribers found</div>
              ) : (
                filteredSubscribers.map((sub) => {
                  const isChecked = selectedSubscriberIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubscriberIds((prev) =>
                          isChecked ? prev.filter((id) => id !== sub.id) : [...prev, sub.id]
                        );
                      }}
                      className="flex items-center justify-between py-2 px-1.5 hover:bg-secondary-bg rounded-md cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={sub.avatar}
                          size={28}
                          className="border border-border-primary bg-secondary-bg text-primary-text text-xs shrink-0"
                        >
                          {sub.username?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary-text truncate">{sub.username}</p>
                          <p className="text-[10px] text-muted-text truncate">{sub.email}</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => { }} // Handled by outer click
                        className="pointer-events-none custom-checkbox"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConversationList;

const LoadingContent = () => {
  return (
    <div className="w-full h-full space-y-4 px-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="mx-auto w-full p-4">
          <div className="flex animate-pulse space-x-4">
            <div className="size-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-2 rounded bg-gray-200"></div>
                <div className="col-span-1 h-2 rounded bg-none"></div>
              </div>
              <div className="h-2 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

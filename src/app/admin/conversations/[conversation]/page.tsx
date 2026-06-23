"use client";

import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { Button, Empty, Image, message, Spin } from "antd";
import { TQuery, TUniObject } from "@/types";
import { useAppSelector } from "@/redux/hook";
import { apiUrl } from "@/config";
import { useParams, useSearchParams } from "next/navigation";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import { cn } from "@/utils/cn";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import {
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
} from "@/redux/features/users/users.api";
import { handleImageError } from "@/lib/handleImageError";
import { errorAlert } from "@/lib/alerts";

const AdminConversation = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();
  const conversationId = Array.isArray(params.conversation)
    ? params.conversation[0]
    : params.conversation;
  const receiverId = searchParams.get("receiver");
  const { data: receiver } = useGetUserDetailsQuery(receiverId || "", {
    skip: !receiverId,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const inFlightRef = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const [messages, setMessages] = useState<TUniObject[]>([]);
  const [participants, setParticipants] = useState<TUniObject[]>([]);
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });
  const [openSuspend, setOpenSuspend] = useState(false);
  const [updateUserStatus, { isLoading: isUpdatingUserStatus }] =
    useUpdateUserStatusMutation();

  const receiverStatus =
    typeof receiver?.status === "string" &&
      receiver.status.toUpperCase() === "SUSPENDED"
      ? "SUSPENDED"
      : "ACTIVE";
  const nextReceiverStatus =
    receiverStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

  const handleManageUserStatus = async () => {
    if (!receiver?._id) return;

    messageApi.open({
      key: "manage-user-status",
      type: "loading",
      content: `Updating user status to ${nextReceiverStatus}...`,
    });

    try {
      await updateUserStatus({
        userId: receiver._id,
        status: nextReceiverStatus,
      }).unwrap();
      messageApi.open({
        key: "manage-user-status",
        type: "success",
        content: `User ${nextReceiverStatus === "SUSPENDED" ? "suspended" : "activated"} successfully`,
        duration: 3,
      });
      setOpenSuspend(false);
    } catch (err) {
      errorAlert({ error: err as never, messageApi });
      messageApi.destroy("manage-user-status");
    }
  };
  const tryLoadNextPage = (scrollTop: number, isScrollingUp: boolean) => {
    if (
      (isScrollingUp || scrollTop <= 5) &&
      scrollTop <= 5 &&
      !isLoading &&
      !nextLoading &&
      !!query.page &&
      !inFlightRef.current
    ) {
      fetchMessages({ type: "next" });
    }
  };

  const fetchMessages = async ({ type }: { type?: "next" } = {}) => {
    if (!conversationId) return;
    if (inFlightRef.current) return;
    if (type === "next" && !query.page) return;
    try {
      inFlightRef.current = true;
      if (type === "next") {
        setNextLoading(true);
      } else {
        setIsLoading(true);
      }
      const token = Cookies.get("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const params = new URLSearchParams();
      params.set("page", String(type === "next" ? query.page : 1));
      params.set("limit", String(query.limit));
      const response = await fetch(
        `${apiUrl}/messages/${conversationId}?${params.toString()}`,
        { method: "GET", headers },
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      const res = await response.json();
      const participantsFromResponse = extractParticipants(res);
      if (participantsFromResponse.length) {
        setParticipants(participantsFromResponse);
      }
      const currentPage = res?.data?.page || 1;
      const total = res?.data?.totalPages || 1;
      setQuery((c) => ({
        ...c,
        page: currentPage < total ? currentPage + 1 : null,
      }));
      const fetchedResults = res?.data?.results || res?.data || [];
      const pageResults = (Array.isArray(fetchedResults) ? [...fetchedResults] : []).reverse();
      if (type === "next") {
        setMessages((c) => [...pageResults, ...c]);
      } else {
        setMessages(pageResults);
      }
    } catch (err: unknown) {
      errorAlert({
        error:
          err instanceof Error
            ? { message: err.message }
            : { message: "Failed to load messages" },
        messageApi,
      });
    } finally {
      setIsLoading(false);
      setNextLoading(false);
      inFlightRef.current = false;
    }
  };

  const fetchConversationParticipants = async () => {
    if (!conversationId) return;
    try {
      const token = Cookies.get("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${apiUrl}/conversations/${conversationId}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) return;
      const res = await response.json();
      const foundParticipants = extractParticipants(res);
      if (foundParticipants.length) {
        setParticipants(foundParticipants);
      }
    } catch {
      // Best-effort enrichment for sender labels; message list still renders.
    }
  };

  useEffect(() => {
    setMessages([]);
    setParticipants([]);
    setQuery((c) => ({ ...c, page: 1 }));
    setIsLoading(true);
    setNextLoading(false);
    inFlightRef.current = false;
    lastScrollTopRef.current = 0;
    fetchMessages({});
    fetchConversationParticipants();
  }, [conversationId, receiverId]);

  const groupedMessages = groupMessagesByDate(messages);
  const adminUserId = normalizeId(user?._id);
  const reviewedUserId = normalizeId(receiverId);
  const participantsById = buildParticipantsById(participants);

  return (
    <div className="h-full w-full flex flex-col bg-primary-bg">
      {contextHolder}
      <div className="sticky top-0 z-20 bg-secondary-bg border-b border-border-primary px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1 hover:bg-primary-bg rounded-md transition-colors text-primary-text"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <div className="flex items-center gap-3">
              <Image
                width={44}
                height={44}
                src={receiver?.avatar || "/static/demo-image.jpg"}
                alt="User"
                className="rounded-full border border-border-primary object-cover"
                onError={handleImageError}
                fallback="/static/demo-image.jpg"
              />
              <div className="flex flex-col">
                <h1 className="text-base font-semibold text-primary-text leading-tight capitalize">
                  {receiver?.username || "Unknown User"}
                </h1>
                <p className="text-sm font-medium text-muted-text">
                  {receiver?.email || receiverId}
                </p>
              </div>
            </div>
          </div>
          <Button
            type="primary"
            danger={receiverStatus !== "SUSPENDED"}
            className={cn("shadow-sm", {
              "bg-emerald-500 hover:!bg-emerald-600": receiverStatus === "SUSPENDED"
            })}
            onClick={() => setOpenSuspend(true)}
          >
            {receiverStatus === "SUSPENDED" ? "Activate User" : "Suspend User"}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div
          ref={chatRef}
          onWheel={(e) => {
            const target = e.currentTarget;
            const isWheelUp = e.deltaY < 0;
            if (!isWheelUp) return;
            tryLoadNextPage(target.scrollTop, true);
          }}
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            const isScrollingUp = target.scrollTop < lastScrollTopRef.current;
            lastScrollTopRef.current = target.scrollTop;
            tryLoadNextPage(target.scrollTop, isScrollingUp);
          }}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar"
        >
          <div
            className={cn(
              "w-full flex justify-center items-center h-0 overflow-hidden duration-300",
              {
                "pt-3 h-7": !isLoading && nextLoading,
              },
            )}
          >
            <Spin size="small" />
          </div>
          {isLoading ? (
            <div className="h-full w-full flex justify-center items-center pb-[20%]">
              <Spin size="large" />
            </div>
          ) : Object.keys(groupedMessages)?.length < 1 ? (
            <div className="h-full w-full flex justify-center items-center">
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                styles={{ image: { height: 60 } }}
                description={<span className="text-muted-text">No messages yet.</span>}
              />
            </div>
          ) : (
            Object.keys(groupedMessages).map((date, index) => (
              <div key={index} className="space-y-4">
                <div className="flex justify-center my-4 sticky top-0 z-10">
                  <span className="bg-secondary-bg/85 backdrop-blur-sm text-muted-text text-sm px-3 py-1 rounded-full shadow-xs border border-border-primary/50">
                    {new Date(date).toDateString() !== new Date().toDateString()
                      ? dayjs(date).format("MMMM D, YYYY")
                      : "Today"}
                  </span>
                </div>
                {groupedMessages[date].map(
                  (message: TUniObject, msgIndex: number) => {
                    const senderId = getMessageSenderId(message);
                    const senderName = getMessageSenderName({
                      message,
                      senderId,
                      participantsById,
                      adminUserId,
                      reviewedUserId,
                      reviewedUsername: receiver?.username,
                    });
                    const isReviewedUserMessage =
                      !!reviewedUserId && senderId === reviewedUserId;
                    const isRightAligned = !isReviewedUserMessage;
                    return (
                      <div key={msgIndex} className="w-full flex flex-col">
                        <div
                          className={cn("max-w-[85%] flex flex-col", {
                            "ml-auto items-end": isRightAligned,
                            "mr-auto items-start": !isRightAligned,
                          })}
                        >
                          <div className="text-sm font-medium text-muted-text mb-1 px-1">
                            {senderName}
                          </div>
                          {isRightAligned ? (
                            <div className="px-4 py-2.5 bg-emerald-500 text-white rounded-2xl rounded-tr-none shadow-sm text-sm">
                              {message.text}
                            </div>
                          ) : (
                            <div className="px-4 py-2.5 bg-secondary-bg border border-border-primary text-primary-text rounded-2xl rounded-tl-none shadow-xs text-sm">
                              {message.text}
                            </div>
                          )}
                          <span className="mt-1 px-1 text-sm text-muted-text">
                            {dayjs(message.createdAt).format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-3 bg-secondary-bg border-t border-border-primary z-20">
          <p className="text-sm font-medium text-muted-text text-center">
            Admin conversations are read-only.
          </p>
        </div>
      </div>

      {openSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold text-center">
              {nextReceiverStatus === "SUSPENDED"
                ? "Suspend User"
                : "Activate User"}
            </h2>
            <p className="text-center text-gray-600 mt-2">
              Are you sure you want to{" "}
              {nextReceiverStatus === "SUSPENDED" ? "suspend " : "activate "}
              <strong>{receiver?.username || "this user"}</strong>?
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <Button onClick={() => setOpenSuspend(false)}>Cancel</Button>
              <Button
                type="primary"
                danger={nextReceiverStatus === "SUSPENDED"}
                loading={isUpdatingUserStatus}
                onClick={handleManageUserStatus}
              >
                {nextReceiverStatus === "SUSPENDED"
                  ? "Confirm Suspend"
                  : "Confirm Activate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <React.Suspense fallback={<div className="flex w-full h-full items-center justify-center"><Spin /></div>}>
      <AdminConversation />
    </React.Suspense>
  );
}

const groupMessagesByDate = (messages: TUniObject[]) => {
  return messages.reduce(
    (grouped, message) => {
      const date = dayjs(message.createdAt).format("YYYY-MM-DD");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
      return grouped;
    },
    {} as Record<string, TUniObject[]>,
  );
};

const normalizeId = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const rawId =
      (value as { _id?: unknown; id?: unknown })._id ??
      (value as { _id?: unknown; id?: unknown }).id;
    if (typeof rawId === "string") return rawId;
  }
  return "";
};

const getMessageSenderId = (message: TUniObject): string => {
  return normalizeId(
    message?.senderId ??
    message?.sender?._id ??
    message?.sender?.id ??
    message?.sender,
  );
};

const getMessageSenderName = ({
  message,
  senderId,
  participantsById,
  adminUserId,
  reviewedUserId,
  reviewedUsername,
}: {
  message: TUniObject;
  senderId: string;
  participantsById: Record<string, TUniObject>;
  adminUserId: string;
  reviewedUserId: string;
  reviewedUsername?: string;
}): string => {
  const participant = senderId ? participantsById[senderId] : null;
  const participantName =
    participant?.username || participant?.name || participant?.email;
  if (typeof participantName === "string" && participantName.trim()) {
    return participantName;
  }
  const senderObj = message?.sender;
  if (senderObj && typeof senderObj === "object") {
    const senderLabel =
      senderObj?.username || senderObj?.name || senderObj?.email;
    if (typeof senderLabel === "string" && senderLabel.trim()) {
      return senderLabel;
    }
  }
  if (reviewedUserId && senderId === reviewedUserId) {
    return reviewedUsername || "Reviewed User";
  }
  if (adminUserId && senderId === adminUserId) {
    return "Admin";
  }
  return senderId ? `User (${senderId.slice(-6)})` : "Unknown Sender";
};

const buildParticipantsById = (
  participants: TUniObject[],
): Record<string, TUniObject> => {
  return participants.reduce(
    (acc, participant) => {
      const id = normalizeId(
        participant?._id ?? participant?.id ?? participant,
      );
      if (id) acc[id] = participant;
      return acc;
    },
    {} as Record<string, TUniObject>,
  );
};

const extractParticipants = (response: TUniObject): TUniObject[] => {
  return (
    response?.data?.participants ||
    response?.data?.conversation?.participants ||
    response?.data?.result?.participants ||
    response?.data?.attributes?.participants ||
    response?.participants ||
    []
  );
};

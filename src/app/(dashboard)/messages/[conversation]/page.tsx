"use client";
import React, { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";
import { Empty, Skeleton } from "antd";
import { TQuery, TUniObject } from "@/types";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { useAppSelector } from "@/redux/hook";
import { useParams, useSearchParams } from "next/navigation";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import { cn } from "@/utils/cn";
import ChatInput from "@/components/messages/ChatInput";
import Participant from "@/components/messages/Participant";
import { errorAlert } from "@/lib/alerts";
import { useLazyGetMessagesQuery, useMarkAsReadMutation, useGetConversationDetailsQuery } from "@/redux/features/messages/messages.api";

const Conversation = () => {
  const { socket, messageApi, reconnect } = useAppContext();
  const searchParams = useSearchParams();
  const params = useParams();
  const conversationId = Array.isArray(params.conversation)
    ? params.conversation[0]
    : params.conversation;
  const [isLoading, setIsLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const initialFetchDoneRef = useRef(false);
  const inFlightRef = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const shouldScrollToBottomRef = useRef(false);
  const prependAnchorRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<TUniObject[]>([]);
  const [participantsById, setParticipantsById] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnectionTimeout, setIsConnectionTimeout] = useState(false);

  useEffect(() => {
    setIsConnectionTimeout(false);

    if (socket) {
      setIsConnected(socket.connected);
      if (socket.connected) {
        return;
      }
    } else {
      setIsConnected(false);
    }

    const timer = setTimeout(() => {
      if (!socket || !socket.connected) {
        setIsConnectionTimeout(true);
      }
    }, 4000);

    const handleConnect = () => {
      setIsConnected(true);
      setIsConnectionTimeout(false);
      clearTimeout(timer);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
    }

    return () => {
      clearTimeout(timer);
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      }
    };
  }, [socket]);

  const handleReconnect = () => {
    setIsConnectionTimeout(false);
    reconnect();
  };

  const { data: conversationDetails } = useGetConversationDetailsQuery(conversationId || "", {
    skip: !conversationId,
  });

  // Build participants map when conversation details load
  useEffect(() => {
    const participants = conversationDetails?.data?.participants || [];
    if (participants.length > 0) {
      const map: Record<string, string> = {};
      participants.forEach((p: TUniObject) => {
        if (p?._id) {
          map[p._id] = p.username || p.name || p.email || "Unknown";
        }
      });
      setParticipantsById(map);
    }
  }, [conversationDetails]);
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const groupedMessages = groupMessagesByDate(messages);
  const messageSkeletons = Array.from({ length: 8 });

  const [triggerGetMessages] = useLazyGetMessagesQuery();
  const [markAsRead] = useMarkAsReadMutation();

  const isOwnMessage = (message: TUniObject) => {
    const senderId =
      typeof message?.sender === "string"
        ? message.sender
        : message?.sender?._id || message?.senderId;
    return senderId === user?._id;
  };
  const tryLoadNextPage = (scrollTop: number, isScrollingUp: boolean) => {
    if (
      (isScrollingUp || scrollTop <= 24) &&
      scrollTop <= 24 &&
      !isLoading &&
      !nextLoading &&
      !!query.page &&
      !inFlightRef.current
    ) {
      fetchData({ type: "next" });
    }
  };
  // console.log(searchParams.get("receiver"))
  const fetchData = async ({
    searchTerm,
    type,
  }: {
    searchTerm?: string;
    type?: "search" | "next";
  }) => {
    if (!conversationId) return;
    if (inFlightRef.current) return;
    if (type === "next" && (!query.page || query.page > totalPages)) return;

    try {
      inFlightRef.current = true;
      if (type === "next") {
        setNextLoading(true);
        if (chatRef.current) {
          prependAnchorRef.current = {
            scrollTop: chatRef.current.scrollTop,
            scrollHeight: chatRef.current.scrollHeight,
          };
        }
      } else {
        setIsLoading(true);
        shouldScrollToBottomRef.current = true;
      }

      const res = await triggerGetMessages({
        conversationId,
        page: type === "next" ? (query.page as number) : 1,
        limit: query.limit,
        searchTerm: searchTerm || undefined,
      }).unwrap();

      const resData = res?.data;
      const currentPage = resData?.page || 1;
      const total = resData?.totalPages || 1;
      setTotalPages(total);
      setQuery((c) => ({
        ...c,
        page: currentPage < total ? currentPage + 1 : null,
      }));
      const fetchedResults = resData?.results || resData?.result || [];
      const pageResults = (Array.isArray(fetchedResults) ? [...fetchedResults] : []).reverse();
      if (type === "next") {
        setMessages((c) => [...pageResults, ...c]);
      } else {
        setMessages(pageResults);
      }
    } catch (error) {
      console.error(error);
      errorAlert({ error: error as any, messageApi });
    } finally {
      setIsLoading(false);
      setNextLoading(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    setMessages([]);
    setQuery((c) => ({ ...c, page: 1 }));
    setTotalPages(1);
    setIsLoading(true);
    setNextLoading(false);
    initialFetchDoneRef.current = false;
    inFlightRef.current = false;
    lastScrollTopRef.current = 0;
    shouldScrollToBottomRef.current = false;
    prependAnchorRef.current = null;

    if (conversationId) {
      markAsRead(conversationId).catch((err) => console.error("Failed to mark as read:", err));
    }
  }, [conversationId]);
  useEffect(() => {
    if (!initialFetchDoneRef.current && conversationId) {
      fetchData({});
      initialFetchDoneRef.current = true;
    }
  }, [conversationId]);
  useEffect(() => {
    if (!socket || !conversationId) return;
    const handler = (res: TUniObject) => {
      const incomingConversationId =
        res?.conversationId ||
        (typeof res?.conversation === "string"
          ? res.conversation
          : res?.conversation?._id);
      if (incomingConversationId !== conversationId) return;
      if (chatRef.current) {
        const { scrollTop, clientHeight, scrollHeight } = chatRef.current;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 80;
        shouldScrollToBottomRef.current = isNearBottom;
      }
      setMessages((c) => {
        if (res?._id && c.some((m) => m?._id === res._id)) return c;

        const incomingSenderId =
          typeof res?.sender === "string" ? res.sender : res?.sender?._id;
        const pendingIndex = c.findIndex((m) => {
          const pendingSenderId =
            typeof m?.sender === "string" ? m.sender : m?.sender?._id;
          return (
            m?.status === "sending" &&
            m?.text === res?.text &&
            pendingSenderId === incomingSenderId
          );
        });

        if (pendingIndex > -1) {
          const next = [...c];
          next[pendingIndex] = { ...next[pendingIndex], ...res, status: "sent" };
          return next;
        }

        return [...c, { ...res, status: "sent" }];
      });
    };
    socket.on("new-message", handler);
    return () => {
      socket.off("new-message", handler);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (!chatRef.current) return;
    if (prependAnchorRef.current) {
      const prev = prependAnchorRef.current;
      const nextTop =
        chatRef.current.scrollHeight - prev.scrollHeight + prev.scrollTop;
      chatRef.current.scrollTo({
        top: Math.max(nextTop, 0),
        behavior: "instant",
      });
      lastScrollTopRef.current = Math.max(nextTop, 0);
      prependAnchorRef.current = null;
      return;
    }
    if (shouldScrollToBottomRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "instant",
      });
      lastScrollTopRef.current = chatRef.current.scrollHeight;
      shouldScrollToBottomRef.current = false;
    }
  }, [messages]);

  return (
    <div className="h-full w-full flex flex-col bg-primary-bg">
      <Participant
        data={{ receiver: searchParams.get("receiver") }}
        className="sticky top-0 z-20"
      />
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {!isConnected && isConnectionTimeout && (
          <div className="absolute inset-0 bg-primary-bg/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-6">
              <div className="w-14 h-14 mx-auto bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary-text">Chat Disconnected</h3>
                <p className="text-sm text-secondary-text">
                  We're having trouble connecting to the chat server. This could be due to a brief network interruption.
                </p>
              </div>
              <button
                onClick={handleReconnect}
                className="inline-flex items-center justify-center px-6 py-2 bg-brand-primary hover:bg-brand-primary/95 text-black font-semibold text-sm rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Try Reconnecting
              </button>
            </div>
          </div>
        )}

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
              }
            )}
          >
            <div className="w-24 h-4 bg-zinc-200/30 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/25 rounded-full animate-pulse" />
          </div>
          {isLoading || (!isConnected && !isConnectionTimeout) ? (
            <div className="space-y-6">
              {messageSkeletons.map((_, index) => {
                const isOwn = index % 2 === 0;
                const width = index % 3 === 0 ? "w-[260px]" : index % 3 === 1 ? "w-[180px]" : "w-[220px]";
                return (
                  <div
                    key={index}
                    className={cn("w-full flex flex-col", {
                      "items-end": isOwn,
                      "items-start": !isOwn,
                    })}
                  >
                    {!isOwn && (
                      <div className="w-16 h-3 bg-slate-200/40 dark:bg-zinc-800/50 rounded-md animate-pulse mb-1.5" />
                    )}
                    <div
                      className={cn(
                        "h-11 rounded-2xl animate-pulse border",
                        width,
                        isOwn
                          ? "rounded-tr-none bg-emerald-200/50 dark:bg-emerald-900/40 border-emerald-300/20 dark:border-emerald-800/20"
                          : "rounded-tl-none bg-slate-200/30 dark:bg-zinc-800/65 border-zinc-200/50 dark:border-zinc-700/25"
                      )}
                    />
                    <div className="w-10 h-2.5 bg-slate-200/30 dark:bg-zinc-800/40 rounded-md animate-pulse mt-1.5 px-1" />
                  </div>
                );
              })}
            </div>
          ) : Object.keys(groupedMessages)?.length < 1 ? (
            <div className="h-full w-full flex justify-center items-center">
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                styles={{ image: { height: 60 }, description: { color: "var(--primary-text)" } }}
                description="No messages yet."
              />
            </div>
          ) : (
            Object.keys(groupedMessages).map((date, index) => (
              <div key={index} className="space-y-5">
                <div className="flex items-center my-6 justify-center w-full relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-border-primary/30"></div>
                  </div>
                  <span className="relative z-10 bg-primary-bg px-4 text-[11px] font-semibold text-muted-text tracking-wider uppercase select-none">
                    {new Date(date).toDateString() !== new Date().toDateString()
                      ? dayjs(date).format("MMMM D, YYYY")
                      : "Today"}
                  </span>
                </div>
                {groupedMessages[date].map(
                  (message: TUniObject, msgIndex: number) => (
                    <div key={msgIndex} className="w-full flex flex-col">
                      {isOwnMessage(message) ? (
                        <div className="max-w-[80%] ml-auto flex flex-col items-end group">
                          <div className="px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl rounded-tr-none shadow-sm shadow-emerald-500/5 text-sm font-normal tracking-wide leading-relaxed">
                            {message.text}
                          </div>
                          <div className="mt-1 flex items-center gap-1 px-1">
                            <span className="text-[10px] text-muted-text">
                              {dayjs(message.createdAt).format("HH:mm")}
                            </span>
                            {message?.status === "sent" && (
                              <span className="text-emerald-500 text-[10px] font-bold select-none">✓✓</span>
                            )}
                            {message?.status === "sending" && (
                              <span className="text-muted-text/80 animate-pulse text-[10px]">sending...</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[80%] mr-auto flex flex-col items-start group">
                          {/* Sender name label for incoming messages */}
                          {(() => {
                            const senderId =
                              typeof message?.sender === "string"
                                ? message.sender
                                : message?.sender?._id || message?.senderId;
                            const senderName =
                              (typeof message?.sender === "object" && message?.sender !== null
                                ? message.sender?.username || message.sender?.name
                                : null) ||
                              (senderId ? participantsById[senderId] : null);
                            return senderName ? (
                              <span className="text-[10px] font-semibold text-emerald-500 mb-0.5 px-1 tracking-wide">
                                {senderName}
                              </span>
                            ) : null;
                          })()}
                          <div className="px-4 py-2.5 bg-secondary-bg/80 border border-border-primary/40 text-primary-text rounded-2xl rounded-tl-none shadow-xs text-sm font-normal tracking-wide leading-relaxed">
                            {message.text}
                          </div>
                          <span className="mt-1 px-1 text-[10px] text-muted-text">
                            {dayjs(message.createdAt).format("HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ChatInput
        disabled={!isConnected}
        className="p-3 lg:p-4 bg-primary-bg border-t border-border-primary"
        receiver={searchParams.get("receiver")}
        conversationId={conversationId}
        onLocalMessage={(localMessage: TUniObject) => {
          shouldScrollToBottomRef.current = true;
          setMessages((current) => [...current, localMessage]);
        }}
        onMessageAck={(localId: string, serverMessage?: TUniObject) => {
          setMessages((current) => {
            const index = current.findIndex((m) => m?.localId === localId);
            if (index < 0) return current;
            const next = [...current];
            next[index] = {
              ...next[index],
              ...(serverMessage || {}),
              _id: serverMessage?._id || next[index]?._id,
              createdAt: serverMessage?.createdAt || next[index]?.createdAt,
              status: "sent",
            };
            return next;
          });
        }}
      />
    </div>
  );
};
export default function Page() {
  return (
    <React.Suspense fallback={<div className="flex w-full h-full items-center justify-center"><Skeleton active /></div>}>
      <Conversation />
    </React.Suspense>
  );
}

const groupMessagesByDate = (messages: TUniObject[]) => {
  return messages.reduce((grouped: Record<string, TUniObject[]>, message) => {
    const date = dayjs(message.createdAt).format("YYYY-MM-DD");
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(message);
    // console.log({grouped, message})
    return grouped;
  }, {});
};

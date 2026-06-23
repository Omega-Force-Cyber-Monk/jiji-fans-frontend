"use client";
import { GetProps, Input, message } from "antd";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { TQuery, TUniObject } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { apiUrl } from "@/config";
import LoaderWraperComp from "../LoaderWraperComp";
import { cn } from "@/utils/cn";
import { handleImageError } from "@/lib/handleImageError";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import { useAppSelector } from "@/redux/hook";
import { errorAlert } from "@/lib/alerts";
import Image from "@/components/ui/CImage";
type SearchProps = GetProps<typeof Input.Search>;

const ConversationList = ({
  className,
  basePath = "/messages",
}: //   onReceiver,
  {
    className: string;
    basePath?: string;
    //   onReceiver: (id: string) => void;
  }) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { conversation: conversationId } = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<TUniObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });

  const fetchData = async ({
    searchTerm,
    type,
  }: {
    searchTerm?: string;
    type?: "search" | "next";
  }) => {
    let params = `?page=1`;
    if (type === "search") {
      params = `?search=${searchTerm}&page=1`;
    } else if (type === "next") {
      params = !!searchTerm
        ? `?search=${searchTerm}&page=${query.page}`
        : `?page=${query.page}`;
    }
    try {
      if (type === "next") {
        if (!query.page) return;
      } else {
        setIsLoading(true);
      }
      const token = Cookies.get("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Custom-Header": "custom-value",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(apiUrl + "/conversations" + params, {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setQuery((c) => ({
        ...c,
        page: data?.pagination?.nextPage ?? null,
      }));
      if (type === "next") {
        setData((c) => [
          ...c,
          ...(data?.data?.result || data?.data?.results || data?.data || []),
        ]);
      } else {
        setData(data?.data?.result || data?.data?.results || data?.data || []);
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

  const onSearch: SearchProps["onSearch"] = (value, _e, _info) => {
    fetchData({ type: "search", searchTerm: value });
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
    <div className={cn("w-full p-4 pr-1 bg-secondary-bg/30", className)}>
      {contextHolder}
      <div className="mr-3">
        <Input.Search
          allowClear
          placeholder="Search here..."
          onSearch={onSearch}
          enterButton
          size="large"
          className="mb-3"
        />
      </div>
      <div className="mb-2 pr-3">
        <p className="font-semibold text-primary-text text-base">Conversations</p>
        <p className="text-sm text-muted-text">
          {data?.length} chat{data?.length === 1 ? "" : "s"}
        </p>
      </div>
      <LoaderWraperComp
        isError={false}
        isLoading={isLoading}
        loader={<LoadingContent />}
        dataEmpty={data?.length < 1}
      >
        <div
          className="h-full overflow-y-scroll max-h-[calc(100vh-140px)] max-w-full overflow-x-hidden pr-2"
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.scrollTop + target.offsetHeight ===
              target.scrollHeight
            ) {
              fetchData({ type: "next" });
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
            const previewText =
              conversation?.lastMessage?.[0]?.text?.trim() ||
              "Start a conversation";
            const isSelected = conversationId === conversation._id;
            return (
              <div
                key={conversation?._id || index}
                className={cn(
                  "text-primary-text px-3 py-3.5 mb-2 rounded-xl border cursor-pointer transition-all duration-200",
                  "hover:bg-secondary-bg hover:border-emerald-500/30 hover:shadow-sm",
                  {
                    "bg-primary-bg border-border-primary": !isSelected,
                    "bg-emerald-500/10 border-emerald-500/30 shadow-sm": isSelected,
                  },
                )}
                onClick={() =>
                  router.push(
                    `${basePath}/${conversation._id}?receiver=${receiverId || ""}`,
                  )
                }
              >
                <div className="flex items-center gap-4 w-full">
                  <div
                    className={cn(
                      "rounded-full overflow-hidden w-[50px] h-[50px] shrink-0 p-[1px] bg-primary-bg border",
                      {
                        "border-border-primary": !isSelected,
                        "border-emerald-500/30": isSelected,
                      },
                    )}
                  >
                    <Image
                      src={avatar}
                      alt={title}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center w-full gap-3">
                    <div className="min-w-0">
                      <h1 className="font-semibold text-[19px] text-primary-text truncate max-w-full line-clamp-1">
                        {title}
                      </h1>
                      <p className="text-sm text-muted-text line-clamp-1">
                        {previewText}
                      </p>
                    </div>
                    <div className="text-sm text-right shrink-0">
                      {conversation.isActive ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="text-muted-text">
                          {compareByCTime({
                            preTime: conversation.updatedAt,
                          })}
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

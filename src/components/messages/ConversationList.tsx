"use client";
import { message } from "antd";
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
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
  const [data, setData] = useState<TUniObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });

  const fetchData = async ({
    searchTerm: search,
    type,
  }: {
    searchTerm?: string;
    type?: "search" | "next";
  }) => {
    let params = `?page=1`;
    if (type === "search") {
      params = `?search=${search}&page=1`;
    } else if (type === "next") {
      params = !!search
        ? `?search=${search}&page=${query.page}`
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

      const resData = await response.json();
      setQuery((c) => ({
        ...c,
        page: resData?.pagination?.nextPage ?? null,
      }));
      const fetchedResults = resData?.data?.result || resData?.data?.results || resData?.data || [];
      const dataArray = Array.isArray(fetchedResults) ? fetchedResults : [];

      if (type === "next") {
        setData((c) => [...c, ...dataArray]);
      } else {
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
        <span className="text-xs font-medium text-muted-text bg-secondary-bg/60 px-2 py-0.5 rounded-full">
          {data?.length} chat{data?.length === 1 ? "" : "s"}
        </span>
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
            const previewText =
              conversation?.lastMessage?.[0]?.text?.trim() ||
              "Start a conversation";
            const isSelected = conversationId === conversation._id;
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
                      <h1 className="font-semibold text-base text-primary-text truncate line-clamp-1">
                        {title}
                      </h1>
                      <p className="text-xs text-muted-text truncate mt-0.5">
                        {previewText}
                      </p>
                    </div>
                    <div className="text-xs text-right shrink-0">
                      <span className="text-muted-text font-medium">
                        {compareByCTime({
                          preTime: conversation.updatedAt,
                        })}
                      </span>
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

"use client";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import PageHeading from "@/components/ui/PageHeading";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import { useDashboardContentDetailsQuery } from "@/redux/features/content/content.api";
import Image from "@/components/ui/CImage";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const { video } = useParams();
  const contentId =
    typeof video === "string"
      ? video
      : Array.isArray(video)
        ? video[0]
        : undefined;

  const { data, isLoading, isError, error } = useDashboardContentDetailsQuery(
    contentId as string,
    {
      skip: !contentId,
    },
  );

  const content = data?.data;

  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
      }
    };
    
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const status = content?.status || "UNKNOWN";
  const statusClassName =
    status === "APPROVED"
      ? "bg-success/10 text-success border-success/20"
      : status === "REJECTED"
        ? "bg-error/10 text-error border-error/20"
        : "bg-warning/10 text-warning border-warning/20";
  console.log(content, "Content")
  return (
    <LoaderWraperComp
      isError={isError}
      isLoading={isLoading}
      error={error}
      className="h-[40vh]"
    >
      <PageHeading title="Content Details" />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        {/* Creator Info Card */}
        <div className="xl:col-span-4 bg-secondary-bg border border-border-primary rounded-xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-16 lg:h-20 w-16 lg:w-20 shrink-0 rounded-full overflow-hidden border-2 border-brand-primary/20">
              <Image
                src={content?.channel?.avatar || "/static/2Fans-02.svg"}
                alt="Channel avatar"
                height={200}
                width={200}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-xl xl:text-2xl font-semibold text-primary-text truncate">
                {content?.channel?.name || "Unknown Channel"}
              </h3>
              <p className="text-sm text-secondary-text mt-1.5 line-clamp-2">
                {content?.channel?.tagline ||
                  content?.channel?.description ||
                  "No channel summary"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border-primary p-4 bg-primary-bg/30">
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">Subscribers</p>
              <p className="text-2xl font-semibold text-primary-text mt-1">
                {content?.totalSubscribers ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-border-primary p-4 bg-primary-bg/30">
              <p className="text-xs text-muted-text font-medium uppercase tracking-wider">Total Videos</p>
              <p className="text-2xl font-semibold text-primary-text mt-1">
                {content?.totalVideos ?? 0}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-primary/50 space-y-3 text-sm text-secondary-text">
            <p className="flex justify-between">
              <span className="text-muted-text">Creator</span>
              <span className="font-medium text-primary-text">{content?.owner?.username ?? "N/A"}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-text">Email</span>
              <span className="font-medium text-primary-text break-all ml-4">{content?.owner?.email ?? "N/A"}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-text">Country</span>
              <span className="font-medium text-primary-text">{content?.owner?.country ?? "N/A"}</span>
            </p>
          </div>
        </div>

        {/* Video Player & Details Card */}
        <div className="xl:col-span-8 bg-secondary-bg border border-border-primary rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-xl lg:text-2xl font-semibold text-primary-text line-clamp-2">
                {content?.title || "Untitled Content"}
              </h4>
              <p className="text-sm text-muted-text mt-1">
                Uploaded{" "}
                {content?.createdAt
                  ? compareByCTime({ preTime: content.createdAt })
                  : "Just Now"}
              </p>
            </div>

            <span
              className={`inline-flex items-center justify-center px-4 py-1.5 rounded-sm text-xs font-semibold uppercase border ${statusClassName}`}
            >
              {status}
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border border-border-primary">
            <VideoPlayer content={content} />
          </div>

          <div className="rounded-lg border border-border-primary bg-primary-bg/30 p-5 space-y-2">
            <p className="text-sm font-semibold text-primary-text uppercase tracking-wider">
              Description
            </p>
            <div
              className="text-sm lg:text-base text-secondary-text no-tailwind break-words leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: content?.description || "No description provided.",
              }}
            />
          </div>
        </div>
      </div>
    </LoaderWraperComp>
  );
};

export default Page;

"use client";

import LoaderWraperComp from "@/components/LoaderWraperComp";
import { LoadingScreen } from "@/components/ui";
import PageHeading from "@/components/ui/PageHeading";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { errorAlert } from "@/lib/alerts";
import { compareByCTime } from "@/lib/helpers/compareByCTime";
import {
  useContentManageMutation,
  useDashboardContentDetailsQuery,
} from "@/redux/features/content/content.api";
import { Button, message } from "antd";
import Image from "@/components/ui/CImage";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const params = useParams();
  const contentId =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : undefined;

  const [messageApi, contextHolder] = message.useMessage();
  const [manageContent] = useContentManageMutation();

  const { data, isLoading, isError, error } = useDashboardContentDetailsQuery(
    contentId as string,
    {
      skip: !contentId,
    },
  );

  const content = data?.data;

  const status = content?.status || "UNKNOWN";
  const statusClassName =
    status === "APPROVED"
      ? "bg-success/10 text-success border-success/20"
      : status === "REJECTED"
        ? "bg-error/10 text-error border-error/20"
        : status === "SUSPENDED"
          ? "bg-muted-text/10 text-secondary-text border-muted-text/20"
          : "bg-warning/10 text-warning border-warning/20";

  const handleManage = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "SUSPENDED",
  ) => {
    messageApi.open({
      key: "content-manage",
      type: "loading",
      content: `Updating content status to ${status}...`,
    });

    try {
      await manageContent({ id, status }).unwrap();
      messageApi.open({
        key: "content-manage",
        type: "success",
        content: `Video ${status.toLowerCase()} successfully`,
        duration: 3,
      });
    } catch (err) {
      errorAlert({ error: err, messageApi });
      messageApi.destroy("content-manage");
    }
  };

  return (
    <LoaderWraperComp
      isError={isError}
      isLoading={isLoading}
      error={error}
      loader={<LoadingScreen />}
      className="h-[40vh]"
    >
      {contextHolder}
      <PageHeading title="Content Details" />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-4 bg-secondary-bg border border-border-primary rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 lg:h-20 w-16 lg:w-20 shrink-0 rounded-lg overflow-hidden border-2 border-border-primary">
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
              <p className="text-sm text-muted-text mt-1 line-clamp-2">
                {content?.channel?.tagline ||
                  content?.channel?.description ||
                  "No channel summary"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-md border border-border-primary p-3 bg-primary-bg">
              <p className="text-xs text-muted-text">Subscribers</p>
              <p className="text-lg font-semibold text-primary-text">
                {content?.totalSubscribers ?? 0}
              </p>
            </div>
            <div className="rounded-md border border-border-primary p-3 bg-primary-bg">
              <p className="text-xs text-muted-text">Total Videos</p>
              <p className="text-lg font-semibold text-primary-text">
                {content?.totalVideos ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm text-secondary-text">
            <p>
              <span className="inline-block w-20 text-muted-text">Creator</span>:{" "}
              {content?.owner?.username ?? "N/A"}
            </p>
            <p>
              <span className="inline-block w-20 text-muted-text">Email</span>:{" "}
              {content?.owner?.email ?? "N/A"}
            </p>
            <p>
              <span className="inline-block w-20 text-muted-text">Country</span>:{" "}
              {content?.owner?.country ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="xl:col-span-8 bg-secondary-bg border border-border-primary rounded-lg p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
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
              className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold border ${statusClassName}`}
            >
              {status}
            </span>
          </div>

          {(status === "REJECTED" || status === "SUSPENDED") && (
            <div
              className={`mb-5 p-3 rounded-md border text-sm ${status === "REJECTED"
                  ? "bg-error/10 text-error border-error/20"
                  : "bg-muted-text/10 text-secondary-text border-muted-text/20"
                }`}
            >
              {status === "REJECTED" ? (
                <p>
                  <span className="font-semibold">Note:</span> This content has been rejected and is
                  not visible to users on the platform.
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Note:</span> This content is currently suspended. It
                  is hidden from the public view until activated.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center items-center gap-3 mb-5">
            <Button
              onClick={() => handleManage(content?._id, "REJECTED")}
              type="text"
              color="danger"
              variant="solid"
              className="w-full px-7!"
              disabled={content?.status === "REJECTED"}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleManage(content?._id, "APPROVED")}
              htmlType="submit"
              type="primary"
              className="w-full px-7!"
              disabled={content?.status === "APPROVED"}
            >
              Approve
            </Button>
            <Button
              onClick={() => handleManage(content?._id, "SUSPENDED")}
              type="default"
              className="w-full px-7!"
              danger
              disabled={content?.status === "SUSPENDED"}
            >
              Suspend
            </Button>
          </div>

          <VideoPlayer content={content} />

          <div className="mt-5 rounded-md border border-border-primary bg-primary-bg p-4">
            <p className="text-sm font-semibold text-primary-text mb-2">
              Description
            </p>
            <div
              className="no-tailwind text-sm lg:text-base text-secondary-text break-words"
              dangerouslySetInnerHTML={{ __html: content?.description || "No description provided." }}
            />
          </div>
        </div>
      </div>
    </LoaderWraperComp>
  );
};

export default Page;

"use client";

import React from "react";
import PageHeading from "@/components/ui/PageHeading";
import Image from "@/components/ui/CImage";
import { useGetReportDetailsQuery } from "@/redux/features/reports/reports.api";
import { useParams } from "next/navigation";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import { formatTwoDigits } from "@/lib/helpers/getTwoDisit";
import { handleImageError } from "@/lib/handleImageError";

const getStatusClassName = (status?: string) => {
  const value = (status || "").toUpperCase();
  if (value === "OPEN") return "bg-amber-100 text-amber-700 border-amber-200";
  if (value === "RESOLVED")
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (value === "REJECTED") return "bg-red-100 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Page = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, error } = useGetReportDetailsQuery(slug!);

  const status = data?.status || "UNKNOWN";
  const channelAvatar = data?.channel?.avatar || "/static/demo-image.jpg";
  const reportedUserAvatar = data?.user?.avatar || "/static/demo-image.jpg";
  const ownerAvatar = data?.owner?.avatar || "/static/demo-image.jpg";

  return (
    <div>
      <PageHeading title="Report Details" />
      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="h-[50vh]"
      >
        <div className="space-y-5 mt-6">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Report #{data?.id || slug}
                </p>
                <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 break-words">
                  {data?.title || "Untitled Report"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Created: {formatDate(data?.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClassName(
                    status,
                  )}`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">
                  Reported User
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-200">
                    <Image
                      src={reportedUserAvatar}
                      alt="Reported user avatar"
                      height={200}
                      width={200}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {data?.user?.username || "N/A"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {data?.user?.email || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {data?.user?.country || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">
                  Channel
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-200">
                    <Image
                      src={channelAvatar}
                      alt="Channel avatar"
                      height={200}
                      width={200}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {data?.channel?.name || "N/A"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {data?.channel?.description || "No channel description"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <p>
                    {formatTwoDigits({ num: data?.totalSubscribers })} Members
                  </p>
                  <p>{formatTwoDigits({ num: data?.totalVideo })} Videos</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">
                  Channel Owner
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-200">
                    <Image
                      src={ownerAvatar}
                      alt="Owner avatar"
                      height={200}
                      width={200}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {data?.owner?.username || "N/A"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {data?.owner?.email || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {data?.owner?.country || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold text-slate-900">
                Report Description
              </h2>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Submitted by {data?.user?.username || "N/A"}
              </p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {data?.description || "No description provided by the user."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </LoaderWraperComp>
    </div>
  );
};

export default Page;

"use client";

import React from "react";
import PageHeading from "@/components/ui/PageHeading";
import Image from "@/components/ui/CImage";
import { useGetReportDetailsQuery } from "@/redux/features/reports/reports.api";
import { useParams } from "next/navigation";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import { formatTwoDigits } from "@/lib/helpers/getTwoDisit";
import { handleImageError } from "@/lib/handleImageError";
import {
  UserIcon,
  TvIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  TagIcon,
  VideoCameraIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const getStatusClassName = (status?: string) => {
  const value = (status || "").toUpperCase();
  if (value === "OPEN") return "bg-warning/10 text-warning border-warning/25";
  if (value === "RESOLVED") return "bg-success/10 text-success border-success/25";
  if (value === "REJECTED") return "bg-error/10 text-error border-error/25";
  return "bg-primary-bg/30 text-muted-text border-border-primary/50";
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
    <div className="space-y-6 max-w-none pb-8">
      <PageHeading title="Report Details" />

      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="h-[50vh]"
      >
        <div className="space-y-6">
          {/* Top Banner Card */}
          <div className="relative overflow-hidden rounded-xl border border-border-primary bg-secondary-bg p-6 shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-transparent to-brand-secondary/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary uppercase tracking-widest">
                  <TagIcon className="w-4 h-4" />
                  <span>Report #{data?.id || slug}</span>
                </div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary-text break-words tracking-tight">
                  {data?.title || "Untitled Report"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-text">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>Created: {formatDate(data?.createdAt)}</span>
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <span
                  className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${getStatusClassName(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

            {/* Left Column: Users and Channels */}
            <div className="xl:col-span-4 space-y-6">

              {/* Reported User */}
              <div className="rounded-xl border border-border-primary/80 bg-secondary-bg/80 backdrop-blur-md p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border-primary/40">
                  <UserIcon className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-primary-text uppercase tracking-wider">
                    Reported User
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-border-primary ring-2 ring-brand-primary/10 ring-offset-1">
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
                    <p className="font-bold text-primary-text truncate">
                      {data?.user?.username || "N/A"}
                    </p>
                    <p className="text-sm text-secondary-text truncate">
                      {data?.user?.email || "N/A"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold tracking-widest uppercase bg-primary-bg px-2 py-0.5 rounded text-brand-secondary">
                      Country: {data?.user?.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Channel Info */}
              <div className="rounded-xl border border-border-primary/80 bg-secondary-bg/80 backdrop-blur-md p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border-primary/40">
                  <TvIcon className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-primary-text uppercase tracking-wider">
                    Target Channel
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-border-primary ring-2 ring-brand-primary/10 ring-offset-1">
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
                    <p className="font-bold text-primary-text truncate">
                      {data?.channel?.name || "N/A"}
                    </p>
                    <p className="text-xs text-muted-text line-clamp-2 mt-0.5 leading-normal">
                      {data?.channel?.description || "No channel description"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-primary/40 text-sm">
                  <div className="flex items-center gap-2 text-secondary-text bg-primary-bg/50 p-2 rounded border border-border-primary/20">
                    <UsersIcon className="w-4 h-4 text-brand-secondary" />
                    <span>
                      <strong className="text-primary-text font-semibold">
                        {formatTwoDigits({ num: data?.totalSubscribers })}
                      </strong> Members
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-text bg-primary-bg/50 p-2 rounded border border-border-primary/20">
                    <VideoCameraIcon className="w-4 h-4 text-success" />
                    <span>
                      <strong className="text-primary-text font-semibold">
                        {formatTwoDigits({ num: data?.totalVideo })}
                      </strong> Videos
                    </span>
                  </div>
                </div>
              </div>

              {/* Channel Owner */}
              <div className="rounded-xl border border-border-primary/80 bg-secondary-bg/80 backdrop-blur-md p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border-primary/40">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-primary" />
                  <h3 className="text-sm font-bold text-primary-text uppercase tracking-wider">
                    Channel Owner
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-border-primary ring-2 ring-brand-primary/10 ring-offset-1">
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
                    <p className="font-bold text-primary-text truncate">
                      {data?.owner?.username || "N/A"}
                    </p>
                    <p className="text-sm text-secondary-text truncate">
                      {data?.owner?.email || "N/A"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold tracking-widest uppercase bg-primary-bg px-2 py-0.5 rounded text-brand-secondary">
                      Country: {data?.owner?.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Description */}
            <div className="xl:col-span-8 rounded-xl border border-border-primary/80 bg-secondary-bg/80 backdrop-blur-md p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border-primary/40">
                <DocumentTextIcon className="w-5 h-5 text-brand-primary" />
                <h2 className="text-base font-bold text-primary-text uppercase tracking-wider">
                  Report Description
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-text">
                  Submitted by <span className="text-primary-text font-semibold">{data?.user?.username || "Anonymous User"}</span>
                </p>
                <div className="rounded-xl border border-border-primary/60 bg-primary-bg/40 p-5 border-l-4 border-l-brand-primary">
                  <p className="text-primary-text/90 text-base whitespace-pre-wrap leading-relaxed">
                    {data?.description || "No description provided by the user."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </LoaderWraperComp>
    </div>
  );
};

export default Page;

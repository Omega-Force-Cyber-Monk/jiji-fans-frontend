"use client";
import React from "react";
import Image from "@/components/ui/CImage";
import { cn } from "@/utils/cn";
import { useDiviceStatusQuery } from "@/redux/features/adminHome/adminHome.api";
import { formatTwoDigits } from "@/lib/helpers/getTwoDisit";

const UsedDevices = ({ className }: { className?: string }) => {
  const { data, isLoading } = useDiviceStatusQuery(undefined);
  type DeviceCard = {
    key: string;
    device: string;
    count: number;
    percentage: string;
    icon: string;
  };

  const iconByDevice: Record<string, string> = {
    MOBILE: "/static/utils/circum_mobile-3.svg",
    TABLET: "/static/utils/mynaui_tablet.svg",
    TAB: "/static/utils/mynaui_tablet.svg",
    DESKTOP: "/static/utils/proicons_computer.svg",
    COMPUTER: "/static/utils/proicons_computer.svg",
  };

  const labelByDevice: Record<string, string> = {
    MOBILE: "Mobile",
    TABLET: "Tablet",
    TAB: "Tablet",
    DESKTOP: "Computer",
    COMPUTER: "Computer",
  };

  const mappedDevices: DeviceCard[] = (data?.deviceStats || [])
    .map((item: { device: string; count: number; percentage: number }) => {
      const normalizedDevice = String(item.device || "").toUpperCase();
      return {
        key: normalizedDevice,
        device:
          labelByDevice[normalizedDevice] || normalizedDevice || "Unknown",
        count: item.count || 0,
        percentage: formatTwoDigits({ num: item.percentage || 0 }),
        icon:
          iconByDevice[normalizedDevice] ||
          "/static/utils/proicons_computer.svg",
      };
    })
    .sort((a: { percentage: string }, b: { percentage: string }) => {
      return Number(b.percentage) - Number(a.percentage);
    });

  const defaultDevices: DeviceCard[] = [
    {
      key: "MOBILE",
      device: "Mobile",
      count: 0,
      percentage: "0",
      icon: "/static/utils/circum_mobile-3.svg",
    },
    {
      key: "TABLET",
      device: "Tablet",
      count: 0,
      percentage: "0",
      icon: "/static/utils/mynaui_tablet.svg",
    },
    {
      key: "DESKTOP",
      device: "Computer",
      count: 0,
      percentage: "0",
      icon: "/static/utils/proicons_computer.svg",
    },
  ];

  const mergedMap = new Map(defaultDevices.map((item) => [item.key, item]));
  mappedDevices.forEach((item) => {
    mergedMap.set(item.key, item);
  });
  const dataDevices = Array.from(mergedMap.values());

  return (
    <div
      className={cn(
        "bg-secondary-bg border border-border-primary shadow-sm rounded-xl p-6 h-full min-h-[300px] flex flex-col",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2 border-b border-border-primary/50 pb-4">
        <h3 className="text-xl font-bold text-primary-text">
          Device Stats - {formatTwoDigits({ num: data?.totalViews })}
        </h3>
        <p className="text-sm font-medium text-muted-text">{dataDevices.length} devices</p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {isLoading
          ? [...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-primary-bg border border-border-primary/50 p-4 animate-pulse min-h-[170px]"
              />
            ))
          : null}

        {!isLoading && !dataDevices.length ? (
          <div className="col-span-full h-[180px] flex items-center justify-center text-sm font-medium text-muted-text bg-primary-bg rounded-lg border border-border-primary border-dashed">
            No device usage data found.
          </div>
        ) : null}

        {!isLoading &&
          dataDevices.map((device, index) => (
            <div
              key={index}
              className="text-center rounded-xl bg-primary-bg p-5 border border-border-primary/50 transition-colors hover:border-brand-primary/30 flex flex-col items-center justify-center"
            >
              <div className="bg-brand-primary/10 p-3 rounded-full mb-3">
                <Image
                  src={device.icon}
                  alt={device.device}
                  className="w-10 h-10 object-contain [filter:var(--icon-filter)] dark:invert"
                  width={40}
                  height={40}
                />
              </div>
              <p className="font-semibold text-primary-text text-lg">
                {device.device}:{" "}
                <span className="text-brand-primary">
                  {device.percentage}%
                </span>
              </p>
              <p className="text-sm font-medium text-muted-text mt-1">{device.count} views</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UsedDevices;

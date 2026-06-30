"use client";

import RecentViewers from "@/components/admin/RecentViewers";
import UsedDevices from "@/components/admin/UsedDevices";
import ViewsRatioChart from "@/components/admin/ViewsRatioChart";
import PaymentMethodsPieChart from "@/components/admin/PaymentMethodsPieChart";
import FailedTransactionsAreaChart from "@/components/admin/FailedTransactionsAreaChart";
import RegionalRevenueSplit from "@/components/admin/RegionalRevenueSplit";
// import ActiveRegionsMap from "@/components/admin/ActiveRegionsMap";
import AnalyticsMetricsGrid from "@/components/admin/AnalyticsMetricsGrid";
import { Breadcrumb } from "antd";
import React from "react";
import "leaflet/dist/leaflet.css";

const Page = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Breadcrumb
          items={[
            { title: "Admin", href: "/admin/home" },
            { title: "Analytics" },
          ]}
          className="text-sm"
        />
      </div>
      <AnalyticsMetricsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <ViewsRatioChart className="lg:col-span-7" />
        <PaymentMethodsPieChart className="lg:col-span-5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <FailedTransactionsAreaChart className="lg:col-span-8" />
        <RegionalRevenueSplit className="lg:col-span-4" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <RecentViewers className="xl:col-span-5" />
        <UsedDevices className="xl:col-span-7" />
      </div>
      {/* <ActiveRegionsMap /> */}
    </div>
  );
};

export default Page;

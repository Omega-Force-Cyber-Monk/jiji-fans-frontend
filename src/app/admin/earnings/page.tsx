"use client";

import React, { useState } from "react";
import { useAdminStatsQuery } from "@/redux/features/adminHome/adminHome.api";
import { useGetAdminTotalTransitionsQuery } from "@/redux/features/wallet/wallet.api";
import { TQuery } from "@/types";
import { queryFormat } from "@/lib/helpers/queryFormat";
import SectionContainer from "@/components/ui/SectionContainer";
import EarningsStats from "./components/EarningsStats";
import EarningsTable from "./components/EarningsTable";
import EarningsLayoutSkeleton from "@/Common/Skeleton/app/admin/earnings/EarningsLayoutSkeleton";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";

const Page = () => {
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });

  const { data: statusData, isLoading: statusLoading } =
    useAdminStatsQuery(undefined);
  const {
    data: transitionsData,
    isLoading: transitionsLoading,
  } = useGetAdminTotalTransitionsQuery(queryFormat(query));

  const safeTransitionsData = transitionsData || {};
  const results = safeTransitionsData?.data?.results || [];
  const totalResults = safeTransitionsData?.data?.totalResults || 0;

  if (statusLoading || (transitionsLoading && results.length === 0)) {
    return <EarningsLayoutSkeleton />;
  }

  return (
    <div className="w-full space-y-6">
      <AppBreadcrumb
        items={[
          { title: "Home", href: "/admin/dashboard" },
          { title: "Earnings" },
        ]}
        className="!mb-6"
      />

      <EarningsStats
        totalEarnings={statusData?.data?.totalEarnings || 0}
        totalWithdrawalsAmount={statusData?.data?.totalWithdrawalsAmount || 0}
        totalUsers={statusData?.data?.totalUsers || 0}
      />

      <EarningsTable
        data={results}
        totalResults={totalResults}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
};

export default Page;

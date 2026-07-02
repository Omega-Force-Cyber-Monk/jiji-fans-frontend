"use client";

import React from "react";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import KycTable from "./components/KycTable";
import { KYC_TYPES } from "@/constants/kyc.const";

const Page = () => {


  return (
    <div className="w-full space-y-6">
      <AppBreadcrumb
        items={[
          { title: "Home", href: "/admin/dashboard" },
          { title: "KYC Applications" },
        ]}
        className="mb-6!"
      />

      <div className="space-y-10">
        <KycTable title="KYC Applications" type={KYC_TYPES.KYC} />
        {/* <KycTable title="KYB Applications" type={KYC_TYPES.KYB} /> */}
      </div>
    </div>
  );
};

export default Page;

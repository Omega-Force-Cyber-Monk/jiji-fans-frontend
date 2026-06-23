"use client";

import React from "react";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import WaitlistTable from "./components/WaitlistTable";

const WaitlistPage = () => {
  return (
    <div className="w-full space-y-6">
      <AppBreadcrumb
        items={[
          { title: "Home", href: "/admin/home" },
          { title: "Waitlist" },
        ]}
        className="mb-6!"
      />

      <WaitlistTable />
    </div>
  );
};

export default WaitlistPage;

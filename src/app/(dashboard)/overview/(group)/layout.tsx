import React from "react";
import { TLayoutProps } from "@/types";
import Fansfavorites from "@/components/dashboard/Fansfavorites";

const OverviewLayout = ({ children }: TLayoutProps) => {
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-13 gap-5 2xl:gap-10 overflow-hidden md:overflow-visible w-full">
      <div className="md:col-span-10 min-w-0">
        <div className="pt-1 sm:pt-2 space-y-4 sm:space-y-5">
        </div>
        {children}
      </div>
      <Fansfavorites className="md:col-span-3 sticky top-25" />
    </div>
  );
};

export default OverviewLayout;

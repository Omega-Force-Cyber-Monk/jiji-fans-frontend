import React from "react";
import { TLayoutProps } from "@/types";
import Footer from "@/components/shared/Footer";
import HomeNav from "@/components/shared/HomeNav";
import DevAccessGate from "@/components/prelaunch/DevAccessGate";

const MainLayout = ({ children }: TLayoutProps) => {
  return (
    <DevAccessGate>
      <div className="relative overflow-x-hidden">
        <HomeNav />
        {children}
        <Footer />
      </div>
    </DevAccessGate>
  );
};

export default MainLayout;

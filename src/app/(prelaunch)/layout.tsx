import React from "react";
import type { TLayoutProps } from "@/types";

const PrelaunchLayout = ({ children }: TLayoutProps) => {
  return (
    <div className="h-screen overflow-hidden bg-[#050D0A] text-primary-text">
      {children}
    </div>
  );
};

export default PrelaunchLayout;

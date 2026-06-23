"use client";

import React, { useState } from "react";
import { TLayoutProps } from "@/types";
import Sidebar from "@/components/shared/Sidebar";

import DesktopHeader from "@/components/shared/DesktopHeader";


const Layout = ({ children }: TLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-primary-bg transition-colors duration-300">
      {/* Desktop Sidebar - fixed height, sticky, hidden on mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="lg:hidden"
      />
      <Sidebar className="hidden lg:block sticky top-0 h-screen flex-shrink-0" />
      {/* Main content area */}
      <main className="flex-1 w-full min-w-0 flex flex-col pb-4 bg-primary-bg transition-colors duration-300">
        <div className="w-full flex flex-col h-full">
          {/* Top Header */}
          <DesktopHeader onMenuClick={() => setIsSidebarOpen((open) => !open)} />
          <div className="flex-1 p-4 lg:p- mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

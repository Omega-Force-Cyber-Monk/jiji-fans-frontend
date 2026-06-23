"use client";

import React, { useState } from "react";
import { TLayoutProps } from "@/types";
import Sidebar from "@/components/shared/Sidebar";
import AdminHeader from "@/components/shared/AdminHeader";

const Layout = ({ children }: TLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-primary-bg transition-colors duration-300">
      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAdmin
        className="lg:hidden"
      />

      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block sticky top-0 h-screen flex-shrink-0" isAdmin />

      <main className="flex-1 w-full min-w-0 flex flex-col pb-6 bg-primary-bg transition-colors duration-300">
        <div className="w-full flex flex-col h-full">
          <AdminHeader onMenuClick={() => setIsSidebarOpen((open) => !open)}/>
          <div className="flex-1 p-6 lg:p-6 mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

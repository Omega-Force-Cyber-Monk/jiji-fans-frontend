"use client";

import React from "react";
import { Drawer } from "antd";
import Sidebar from "./Sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

const MobileSidebar = ({ isOpen, onClose, isAdmin }: MobileSidebarProps) => {
  return (
    <Drawer
      placement="left"
      onClose={onClose}
      open={isOpen}
      width="min(90vw, 320px)"
      classNames={{
        body: "bg-primary-bg transition-colors duration-300",
      }}
      styles={{
        body: {
          padding: 0,
          paddingTop: "calc(3.5rem + env(safe-area-inset-top))",
          height: "100dvh",
          overflowY: "auto",
          paddingBottom: "env(safe-area-inset-bottom)",
        },
      }}
      closable={false}
      aria-label="Mobile Navigation Menu"
    >
      <Sidebar
        isAdmin={isAdmin}
        onClose={onClose}
        showBrand={false}
        className="border-none"
      />
    </Drawer>
  );
};

export default MobileSidebar;

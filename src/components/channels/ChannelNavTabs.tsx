"use client";

import { Tabs, TabsProps } from "antd";

interface ChannelNavTabsProps {
  activeKey: string;
  onChange: (key: string) => void;
}

const TAB_ITEMS: TabsProps["items"] = [
  { key: "videos", label: "Videos" },
  { key: "membership", label: "Memberships" },
  { key: "about", label: "About" },
];

const ChannelNavTabs = ({ activeKey, onChange }: ChannelNavTabsProps) => {
  return (
    <div className="container mx-auto">
      <Tabs activeKey={activeKey} items={TAB_ITEMS} onChange={onChange} />
    </div>
  );
};

export default ChannelNavTabs;

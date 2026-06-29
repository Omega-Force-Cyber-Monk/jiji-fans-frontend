"use client";

import { Tabs, TabsProps } from "antd";

interface ChannelNavTabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  hideMembership?: boolean;
}

const ChannelNavTabs = ({ activeKey, onChange, hideMembership }: ChannelNavTabsProps) => {
  const items = hideMembership
    ? [
        { key: "videos", label: "Videos" },
        { key: "about", label: "About" },
      ]
    : [
        { key: "videos", label: "Videos" },
        { key: "membership", label: "Memberships" },
        { key: "about", label: "About" },
      ];

  return (
    <div className="container mx-auto">
      <Tabs activeKey={activeKey} items={items} onChange={onChange} />
    </div>
  );
};

export default ChannelNavTabs;

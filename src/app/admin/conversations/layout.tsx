"use client";

import ConversationList from "@/components/messages/ConversationList";
import { TLayoutProps } from "@/types";
import { useParams } from "next/navigation";
import React from "react";
import { cn } from "@/utils/cn";

const Layout = ({ children }: TLayoutProps) => {
  const params = useParams();
  const isConversationActive = !!params.conversation;

  return (
    <div className="flex w-full relative h-[calc(100dvh-64px)] lg:h-[calc(100dvh-16px)] overflow-hidden bg-primary-bg rounded-xl border border-border-primary shadow-sm">
      <ConversationList
        className={cn(
          "w-full lg:w-1/3 xl:w-1/4 h-full overflow-y-auto border-r border-border-primary transition-all duration-300",
          isConversationActive ? "hidden lg:block" : "block"
        )}
        basePath="/admin/conversations"
      />
      <div
        className={cn(
          "flex-1 h-full transition-all duration-300",
          !isConversationActive ? "hidden lg:flex" : "flex"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;

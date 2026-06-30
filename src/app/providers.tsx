"use client";

import ContextProvider from "@/lib/providers/ContextProvider";
import ReduxProvider from "@/lib/providers/ReduxProvider";
import React from "react"; // adjust path

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ContextProvider>{children}</ContextProvider>
    </ReduxProvider>
  );
}

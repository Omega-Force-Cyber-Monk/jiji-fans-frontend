"use client";

import React from "react";
import { TComponentProps } from "@/types";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";

// Define the conditional type for props
type ClientButtonProps = TComponentProps &
  (
    | {
        type: "push";
        path: string;
      }
    | {
        type?: "back" | "forword";
        path?: string;
      }
  );

const ClientButton = ({
  children,
  className,
  path,
  type = "back",
}: ClientButtonProps) => {
  const router = useRouter();

  const handleAction = () => {
    switch (type) {
      case "push":
        router.push(path!);
        break;
      case "forword":
        router.forward();
        break;
      default:
        if (path && typeof window !== "undefined") {
          try {
            const referrer = document.referrer ? new URL(document.referrer) : null;
            const sameOriginReferrer =
              referrer && referrer.origin === window.location.origin;

            if (!sameOriginReferrer) {
              router.push(path);
              return;
            }
          } catch {
            router.push(path);
            return;
          }
        }

        router.back();
        break;
    }
  };

  return (
    <button
      onClick={handleAction}
      className={cn("outline-none cursor-pointer", className)}
    >
      {children}
    </button>
  );
};

export default ClientButton;

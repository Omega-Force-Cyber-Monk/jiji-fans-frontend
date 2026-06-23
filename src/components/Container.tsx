import { TContainerProps } from "@/types";
import { cn } from "@/utils/cn";
import React from "react";

const Container = ({
  children,
  mClassName,
  className,
  ...pProps
}: TContainerProps) => {
  return (
    <div {...pProps} className={cn("w-full relative", className)}>
      <div
        className={cn(
          "container w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20",
          mClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Container;

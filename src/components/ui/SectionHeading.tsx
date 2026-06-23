import { TComponentProps } from "@/types";
import { cn } from "@/utils/cn";
import React from "react";

const SectionHeading = ({ children, title, className }: TComponentProps) => {
  return (
    <h3
      className={cn(
        "text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold leading-tight",
        className
      )}
    >
      {children || title}
    </h3>
  );
};

export default SectionHeading;

"use client";

import React from "react";
import { Button, Input } from "antd";
import { SearchProps } from "antd/es/input";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";

const { Search } = Input;

const SearchField = ({
  path = "/overview",
  size,
  className,
  fieldClass,
}: {
  path?: string;
  size?: "large" | "middle";
  className?: string;
  fieldClass?: string;
}) => {
  const router = useRouter()
  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    // console.log(info?.source, value, path);
    router.push(`${path}?search=${value}`)
  };
  return (
    <div className={cn("w-full", className)}>
      <Search
        className={cn("lg:max-w-2xl w-full", fieldClass)}
        placeholder="Search channel....."
        onSearch={onSearch}
        // style={{ maxWidth: "500px", width: "100%" }}
        size={size || "large"}
        enterButton={
          <Button>
            <MagnifyingGlassIcon className="w-5 text-gray-300" />
          </Button>
        }
      />
    </div>
  );
};

export default SearchField;

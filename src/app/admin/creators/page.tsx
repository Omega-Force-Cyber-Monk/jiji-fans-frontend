"use client";

import React, { useState } from "react";
import PageHeading from "@/components/ui/PageHeading";
import { Button, ConfigProvider, Input, Table, TableColumnsType } from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { TQuery, TRole } from "@/types";
import { useAllUsersQuery } from "@/redux/features/users/users.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import Image from "@/components/ui/CImage";
import { debounceSearch } from "@/utils/debounce";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";

const Page = () => {
  const [query, setQuery] = useState<TQuery<{ role?: TRole }>>({
    page: 1,
    limit: 10,
    role: "Creator",
  });
  const { data, isLoading, isError, error } = useAllUsersQuery(
    queryFormat(query),
  );
  const columns: TableColumnsType = [
    {
      title: "#ID",
      dataIndex: "_id",
      render: (text) => <p>{text}</p>,
    },
    {
      title: <span className="pl-11">{"Name"}</span>,
      // dataIndex: "username",
      render: (user) => (
        <div className="flex gap-2 items-center">
          <Image
            src={user.avatar}
            alt={"profile"}
            className="w-10 h-10 object-cover rounded-full "
            width={500}
            height={500}
          />
          <p>{user.username}</p>
        </div>
      ),
    },
    {
      title: "Email ",
      dataIndex: "email",
      render: (text: string) => <p>{text}</p>,
    },

    {
      title: "Address",
      dataIndex: "address",
      render: (text: string) => (
        <p
        // className={cn("text-green-400", {
        //   "text-red-400": text === "Absent",
        // })}
        >
          {text || "N/A"}
        </p>
      ),
    },
    {
      title: "Status",
      dataIndex: "isVerified",
      render: (isVerified: boolean) => (
        <p
        // className={cn("text-green-400", {
        //   "text-red-400": text === "Absent",
        // })}
        >
          {isVerified ? "Verified" : "Unverified"}
        </p>
      ),
      align: "center",
    },
    {
      title: "Action",
      render: (record) => (
        <Link href={record.channel?._id ? `/admin/creators/${record.channel._id}` : "#"}>
          <Button type="primary" disabled={!record.channel?._id}>
            View details
          </Button>
        </Link>
      ),
      align: "center",
    },
  ];
  return (
    <div>
      {/* <PageHeading title={`Content (${376})`} /> */}
      <div className="flex justify-between gap-2 bg-secondery rounded-t-lg py-4">
        <PageHeading title={`Creators (${data?.data?.totalResults})`} />
        <ConfigProvider
          theme={{
            components: {
              Input: {
                borderRadius: 30,
              },
              Select: {
                borderRadius: 30,
              },
            },
          }}
        >
          <div className="flex justify-end gap-3">
            <Input
              onChange={(e) =>
                debounceSearch({
                  setter: setQuery,
                  newValue: e.target.value,
                  name: "search",
                })
              }
              placeholder="Search here.."
              suffix={<MagnifyingGlassIcon className="w-5" />}
              // style={{ width: "100%", height: 40, borderRadius: 20 }}
              className="!w-full md:!w-52 lg:!w-72 !h-10"
            />
            {/* <Select
              defaultValue="Recent content"
              // onChange={handleChange}
              className="!w-full md:!w-42 !h-10"
              options={[
                { value: "Recent content", label: "Recent content" },
                { value: "Approved content", label: "Approved content" },
              ]}
            /> */}
          </div>
        </ConfigProvider>
      </div>
      <LoaderWraperComp
        isError={isError}
        isLoading={false}
        error={error}
        className="h-[40vh]"
      >
        <div className="w-full overflow-x-auto">
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={data?.data?.results || []}
            pagination={false}
            rowKey={"_id"}
          />
        </div>
        <CPagination
          setQuery={setQuery}
          query={query}
          totalData={data?.data?.totalResults}
          showSizeChanger={false}
          showQuickJumper={false}
          customNavigation={false}
          size="default"
          className="py-0 pt-2.5"
        />
      </LoaderWraperComp>
    </div>
  );
};

export default Page;

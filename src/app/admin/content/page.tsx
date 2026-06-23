"use client";

import React, { useState } from "react";
import PageHeading from "@/components/ui/PageHeading";
import {
  Button,
  ConfigProvider,
  Input,
  Select,
  Table,
  TableColumnsType,
} from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { TQuery } from "@/types";
import { useDashboardContentQuery } from "@/redux/features/content/content.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import { debounceSearch } from "@/utils/debounce";

const Page = () => {
  const [query, setQuery] = useState<TQuery<{ status: string }>>({
    page: 1,
    limit: 10,
    status: "PENDING",
  });
  const { data, isLoading, isError, error } = useDashboardContentQuery(
    queryFormat(query)
  );
  const columns: TableColumnsType = [
    {
      title: "#Creator Id",
      dataIndex: "owner",
      render: (owner) => <p>{owner._id}</p>,
    },
    {
      title: "Creator",
      dataIndex: "owner",
      render: (owner) => <p>{owner.username}</p>,
    },
    // {
    //   title: "Email ",
    //   dataIndex: "email",
    //   render: (text: string) => <p>{text}</p>,
    // },
    {
      title: "Title ",
      dataIndex: "title",
      // render: () => <p>{"Mousemind 3D"}</p>,
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      render: (text: string) => (
        <p
        // className={cn("text-green-400", {
        //   "text-red-400": text === "Absent",
        // })}
        >
          {new Date(text).toDateString()}
        </p>
      ),
      // align: "center",
    },
    {
      title: "Action",
      // dataIndex: "email",
      render: (record) => (
        <Link href={`/admin/content/${record._id}`}>
          <Button type="primary" className="">
            View details
          </Button>
        </Link>
      ),
      align: "center",
    },
  ];
  // const data = [
  //   {
  //     key: 1,
  //     id: "#1234",
  //     name: "Al-helal",
  //     email: "example@gmail.com",
  //     companiesRegistered: 0,
  //     commissionEarned: "$0",
  //   },
  //   {
  //     key: 2,
  //     id: "#1234",
  //     name: "Al-Jamil",
  //     email: "example@gmail.com",
  //     companiesRegistered: 0,
  //     commissionEarned: "$0",
  //   },
  //   {
  //     key: 3,
  //     id: "#1234",
  //     name: "Al-Jamil",
  //     email: "example@gmail.com",
  //     companiesRegistered: 4,
  //     commissionEarned: "$800",
  //   },
  //   {
  //     key: 4,
  //     id: "#1234",
  //     name: "Al-Jamil",
  //     email: "example@gmail.com",
  //     companiesRegistered: 8,
  //     commissionEarned: "$1,200",
  //   },
  //   {
  //     key: 5,
  //     id: "#1234",
  //     name: "Al-Jamil",
  //     email: "example@gmail.com",
  //     companiesRegistered: 6,
  //     commissionEarned: "$1,500",
  //   },
  //   {
  //     key: 6,
  //     id: "#1234",
  //     name: "Al-Jamil",
  //     email: "example@gmail.com",
  //     companiesRegistered: 10,
  //     commissionEarned: "$1,500",
  //   },
  //   {
  //     key: 7,
  //     id: "#5678",
  //     name: "Sara Khan",
  //     email: "sara.k@example.com",
  //     companiesRegistered: 12,
  //     commissionEarned: "$1,800",
  //   },
  //   {
  //     key: 8,
  //     id: "#9101",
  //     name: "Mohammed Ali",
  //     email: "m.ali@example.com",
  //     companiesRegistered: 5,
  //     commissionEarned: "$750",
  //   },
  //   {
  //     key: 9,
  //     id: "#1123",
  //     name: "Noura Fahd",
  //     email: "noura.f@example.com",
  //     companiesRegistered: 15,
  //     commissionEarned: "$2,000",
  //   },
  //   {
  //     key: 10,
  //     id: "#1415",
  //     name: "Omar Said",
  //     email: "omar.s@example.com",
  //     companiesRegistered: 9,
  //     commissionEarned: "$1,350",
  //   },
  // ];
  return (
    <div>
      {/* <PageHeading title={`Content (${376})`} /> */}
      <div className="flex justify-between gap-2 bg-secondery rounded-t-lg py-4">
        <PageHeading title={`Content(${data?.data?.results?.length})`} />
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
            <Select
              defaultValue="PENDING"
              onChange={(value) => {
                setQuery((c) => ({
                  ...c,
                  status: value,
                }));
              }}
              className="!w-full md:!w-42 !h-10"
              options={[
                { value: "PENDING", label: "Recent content" },
                { value: "APPROVED", label: "Approved content" },
                { value: "REJECTED", label: "Rejected content" },
                { value: "SUSPENDED", label: "Suspended content" },
              ]}
            />
          </div>
        </ConfigProvider>
      </div>
      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        // loader={<LoadingContent />}
        dataEmpty={data?.data?.results?.length === 0}
        className="h-[40vh]"
      >
        <div className="w-full overflow-y-hidden overflow-x-auto">
          <Table
            // scroll={{y: 100,}}
            // rowSelection={ { type: "checkbox", ...rowSelection }}
            columns={columns}
            dataSource={data?.data?.results}
            pagination={false}
          />
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
        </div>
      </LoaderWraperComp>
    </div>
  );
};

export default Page;

"use client";

import React, { useState } from "react";
import PageHeading from "@/components/ui/PageHeading";
import {
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  Table,
  TableColumnsType,
} from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { TQuery } from "@/types";
import { useGetAllReportsQuery } from "@/redux/features/reports/reports.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import { debounceSearch } from "@/utils/debounce";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const Page = () => {
  const [query, setQuery] = useState<TQuery>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isError, error } = useGetAllReportsQuery(
    queryFormat(query)
  );
  const columns: TableColumnsType = [
    {
      title: "IDN.",
      dataIndex: ["user", "_id"],
      render: (text) => <p>{text}</p>,
    },
    {
      title: "Viewer",
      dataIndex: ["user", "username"],
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: "Email ",
      dataIndex: ["user", "email"],
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: "Req. Date",
      dataIndex: ["createdAt"],
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
      render: (record) => (
        <Link href={`/admin/report/${record._id}`}>
          <Button type="primary" className="">
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
        <PageHeading title={`All Reports`} />
        <ConfigProvider
          theme={{
            components: {
              Input: {
                borderRadius: 30,
              },
              DatePicker: {
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
              className="!w-full md:!w-52 lg:!w-72 !h-10"
            />
            <RangePicker
              className="!w-full md:!w-52 lg:!w-60"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              // defaultPickerValue={[dayjs().subtract(1, "month"), dayjs()]}
              onChange={(
                _date: Dayjs[] | null,
                dateString: string[] | null
              ) => {
                setQuery((prev) => ({
                  ...prev,
                  startDate: dateString ? dateString[0] : undefined,
                  endDate: dateString ? dateString[1] : undefined,
                }));
              }}
              // defaultValue={[
              //   dayjs().subtract(1, "month").startOf("month"),
              //   dayjs().endOf("month"),
              // ]}
            />
          </div>
        </ConfigProvider>
      </div>
      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        // loader={<LoadingContent />}
        // dataEmpty={data?.data?.results?.length === 0}
        className="h-[40vh]"
      >
        <div className="w-full overflow-x-auto">
          <Table
            // scroll={{y: 100,}}
            // rowSelection={ { type: "checkbox", ...rowSelection }}
            columns={columns}
            dataSource={data?.data?.results}
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

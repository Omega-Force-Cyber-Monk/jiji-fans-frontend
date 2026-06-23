import React from "react";
import { Input, Table, TableColumnsType, ConfigProvider, Typography } from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { formatTwoDigits } from "@/lib/helpers/getTwoDisit";
import { debounceSearch } from "@/utils/debounce";
import CPagination from "@/components/ui/CPagination";
import { TQuery } from "@/types";

const { Paragraph } = Typography;

interface EarningsTableProps {
  data: any[];
  totalResults: number;
  query: TQuery;
  setQuery: React.Dispatch<React.SetStateAction<TQuery>>;
}

const EarningsTable = ({
  data,
  totalResults,
  query,
  setQuery,
}: EarningsTableProps) => {
  const columns: TableColumnsType = [
    {
      title: "#Tr.ID",
      dataIndex: "transactionId",
      render: (text) => (
        <Paragraph copyable className="!mb-0 text-base font-normal text-secondary-text">
          {text}
        </Paragraph>
      ),
    },
    {
      title: "User Id",
      dataIndex: ["user", "_id"],
      render: (text) => <p className="text-base font-normal text-secondary-text">{text}</p>,
    },
    {
      title: "Name",
      dataIndex: ["user", "username"],
      render: (text: string) => <p className="text-base font-normal text-secondary-text">{text}</p>,
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      render: (text: string) => <p className="text-base font-normal text-secondary-text">{text}</p>,
    },
    {
      title: "Amount",
      render: (record) => (
        <p className="text-base font-medium text-primary-text text-center">
          {record.amount?.toFixed(2)}
          <span className="text-muted-text ml-1">({record.currency})</span>
        </p>
      ),
      align: "center",
    },
  ];

  return (
    <div className="w-full bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary-bg border-b border-border-primary px-6 py-4">
        <h3 className="text-2xl font-semibold text-primary-text m-0">
          Total Transition ({formatTwoDigits({ num: totalResults })})
        </h3>
        <ConfigProvider
          theme={{
            components: {
              Input: {
                borderRadius: 6,
              },
            },
          }}
        >
          <div className="w-full sm:w-72">
            <Input
              onChange={(e) =>
                debounceSearch({
                  setter: setQuery,
                  newValue: e.target.value,
                  name: "search",
                })
              }
              placeholder="Search transitions..."
              suffix={<MagnifyingGlassIcon className="w-5 h-5 text-muted-text" />}
              className="w-full h-10 bg-primary-bg border-border-primary text-primary-text text-base"
            />
          </div>
        </ConfigProvider>
      </div>

      <div className="p-0">
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey={"_id"}
            locale={{ emptyText: "No transitions found" }}
            className="!rounded-none border-0"
          />
        </div>
        {totalResults > 0 && (
          <div className="p-4 border-t border-border-primary bg-primary-bg">
            <CPagination
              setQuery={setQuery}
              query={query}
              totalData={totalResults}
              showSizeChanger={false}
              showQuickJumper={false}
              customNavigation={false}
              size="default"
              className="!m-0 flex justify-end"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTable;

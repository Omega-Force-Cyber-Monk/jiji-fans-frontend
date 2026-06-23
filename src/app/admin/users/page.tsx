"use client";

import React, { useState } from "react";
import PageHeading from "@/components/ui/PageHeading";
import {
  Button,
  ConfigProvider,
  Input,
  Table,
  TableColumnsType,
  message,
} from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import GlobalModal from "@/components/GlobalModal";
import { TQuery, TRole, TUniObject } from "@/types";
import Image from "@/components/ui/CImage";
import {
  TUserAccountStatus,
  useAllUsersQuery,
  useUpdateUserStatusMutation,
} from "@/redux/features/users/users.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import { debounceSearch } from "@/utils/debounce";
import { errorAlert } from "@/lib/alerts";

const getAccountStatus = (user: TUniObject): TUserAccountStatus => {
  const statusValue =
    typeof user?.status === "string" ? user.status.toUpperCase() : "";
  if (statusValue === "SUSPENDED") return "SUSPENDED";
  if (statusValue === "ACTIVE") return "ACTIVE";
  if (typeof user?.isSuspended === "boolean") {
    return user.isSuspended ? "SUSPENDED" : "ACTIVE";
  }
  return "ACTIVE";
};

const Page = () => {
  const [query, setQuery] = useState<TQuery<{ role?: TRole }>>({
    page: 1,
    limit: 10,
    role: "User",
  });
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState<TUniObject | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [updateUserStatus, { isLoading: isUpdatingUserStatus }] =
    useUpdateUserStatusMutation();

  const { data, isLoading, isError, error } = useAllUsersQuery(
    queryFormat(query),
  );

  const showModal = (record: TUniObject) => {
    setModalData(record);
    setOpenModal(true);
  };
  const onClose = () => {
    setOpenModal(false);
  };

  const handleStatusChange = async (
    user: TUniObject,
    status: TUserAccountStatus,
  ) => {
    if (!user?._id) return;
    const key = `user-status-${user._id}`;
    setUpdatingUserId(user._id);
    messageApi.open({
      key,
      type: "loading",
      content: `Updating user status to ${status}...`,
    });

    try {
      await updateUserStatus({ userId: user._id, status }).unwrap();
      setModalData((prev) =>
        prev?._id === user._id ? { ...prev, status } : prev,
      );
      messageApi.open({
        key,
        type: "success",
        content: `User ${status === "SUSPENDED" ? "suspended" : "activated"} successfully`,
        duration: 3,
      });
    } catch (err) {
      errorAlert({ error: err as never, messageApi });
      messageApi.destroy(key);
    } finally {
      setUpdatingUserId(null);
    }
  };

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
      render: (user) => {
        const status = getAccountStatus(user);
        return (
          <p
            className={
              status === "SUSPENDED" ? "text-red-500" : "text-green-600"
            }
          >
            {status}
          </p>
        );
      },
      align: "center",
    },
    {
      title: "Verification",
      dataIndex: "isVerified",
      render: (isVerified: boolean) => (
        <p>{isVerified ? "Verified" : "Unverified"}</p>
      ),
      align: "center",
    },
    {
      title: "Action",
      // dataIndex: "email",
      render: (record) => {
        const currentStatus = getAccountStatus(record);
        const nextStatus: TUserAccountStatus =
          currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
        return (
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => showModal(record)} type="primary">
              View details
            </Button>
            <Button
              type={nextStatus === "SUSPENDED" ? "primary" : "default"}
              danger={nextStatus === "SUSPENDED"}
              loading={isUpdatingUserStatus && updatingUserId === record?._id}
              onClick={() => handleStatusChange(record, nextStatus)}
            >
              {nextStatus === "SUSPENDED" ? "Suspend" : "Activate"}
            </Button>
          </div>
        );
      },
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
      {contextHolder}
      {/* <PageHeading title={`Content (${376})`} /> */}
      <div className="flex justify-between gap-2 bg-secondery rounded-t-lg py-4">
        <PageHeading title={`Users (${data?.data?.totalResults})`} />
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
      <GlobalModal
        isModalOpen={openModal}
        setIsModalOpen={setOpenModal}
        onClose={onClose}
        // maxWidth="444px"
      >
        <div className="w-full flex flex-col items-center gap-4 py-6">
          <h1 className="text-xl xl:text-2xl font-semibold capitalize mb-2 text-center">
            User Details
          </h1>
          <div className="h-16 xl:h-40 w-16 xl:w-40 shrink-0 rounded-full overflow-hidden border-4 border-blue-300/20 ">
            <Image
              src={modalData?.avatar || "/static/demo-image.jpg"}
              alt="Profile"
              height={1000}
              width={1000}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1 text-center text-lg">
            <p className="">Name : {modalData?.username}</p>
            <p className="">Email : {modalData?.email}</p>
            <p className="">Country : {modalData?.country || "N/A"}</p>
            <p className="">Address : {modalData?.address || "N/A"}</p>
            <p className="">
              Status :{" "}
              <span
                className={
                  getAccountStatus(modalData || {}) === "SUSPENDED"
                    ? "text-red-500"
                    : "text-green-600"
                }
              >
                {getAccountStatus(modalData || {})}
              </span>
            </p>
          </div>
          {getAccountStatus(modalData || {}) === "SUSPENDED" && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-sm text-center max-w-sm">
              <p>
                <strong>Note:</strong> This user account is currently suspended.
                The user cannot access their account features until it is
                activated.
              </p>
            </div>
          )}
          <Button
            type={
              getAccountStatus(modalData || {}) === "SUSPENDED"
                ? "default"
                : "primary"
            }
            danger={getAccountStatus(modalData || {}) !== "SUSPENDED"}
            loading={isUpdatingUserStatus && updatingUserId === modalData?._id}
            onClick={() =>
              modalData &&
              handleStatusChange(
                modalData,
                getAccountStatus(modalData) === "SUSPENDED"
                  ? "ACTIVE"
                  : "SUSPENDED",
              )
            }
          >
            {getAccountStatus(modalData || {}) === "SUSPENDED"
              ? "Activate User"
              : "Suspend User"}
          </Button>
          <div className="space-y-1 text-center text-sm text-gray-500">
            <p>
              Verification : {modalData?.isVerified ? "Verified" : "Unverified"}
            </p>
          </div>
        </div>
      </GlobalModal>
    </div>
  );
};

export default Page;

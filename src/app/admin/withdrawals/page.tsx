"use client";

import GlobalModal from "@/components/GlobalModal";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { errorAlert } from "@/lib/alerts";
import { useRequestProcessingMutation } from "@/redux/features/wallet/wallet.api";
import { TUniObject } from "@/types";
import { Button, ConfigProvider, Input, message } from "antd";
import React, { useState } from "react";
import WithdrawalsTable from "./components/WithdrawalsTable";

const Page = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState<TUniObject | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [modalType, setModalType] = useState<"request" | "history">("request");
  const [messageApi, contextHolder] = message.useMessage();

  const [mutation, { isLoading: muLoading }] = useRequestProcessingMutation();

  const handlePayment = async (status: "COMPLETED" | "REJECTED") => {
    try {
      if (status === "REJECTED" && rejectReason.trim().length < 3) {
        messageApi.open({
          key: "reject-reason",
          type: "error",
          content: "Please add a reject reason before rejecting.",
          duration: 3,
        });
        return;
      }
      await mutation({
        id: modalData?._id,
        body: {
          status,
          ...(status === "REJECTED" ? { rejectReason: rejectReason.trim() } : {}),
        },
      }).unwrap();
      messageApi.open({
        key: "payment",
        type: "success",
        content:
          status === "COMPLETED"
            ? "Payment completed successfully!"
            : "Withdrawal request rejected successfully!",
        duration: 3,
      });
      setOpenModal(false);
      setRejectReason("");
    } catch (error) {
      errorAlert({ error: error, messageApi });
    }
  };

  const showModal = (record: TUniObject, type: "request" | "history") => {
    setModalData(record);
    setModalType(type);
    setRejectReason("");
    setOpenModal(true);
  };

  const onClose = () => {
    setOpenModal(false);
    setRejectReason("");
  };

  return (
    <div className="w-full space-y-6">
      {contextHolder}
      <AppBreadcrumb
        items={[
          { title: "Home", href: "/admin/dashboard" },
          { title: "Withdrawals" },
        ]}
        className="mb-6!"
      />

      <div className="space-y-6">
        <WithdrawalsTable title="Pending Withdrawals" status="request" onViewDetails={showModal} />
        <WithdrawalsTable title="Withdrawal History" status="history" onViewDetails={showModal} />
      </div>

      <GlobalModal
        isModalOpen={openModal}
        setIsModalOpen={setOpenModal}
        onClose={onClose}
        maxWidth="500px"
      >
        <ConfigProvider
          theme={{
            components: {
              Input: { borderRadius: 6 },
            },
          }}
        >
          <div className="w-full rounded-md">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold capitalize mb-2 text-center text-primary-text">
                Withdrawal Details
              </h1>
              <p className="text-base text-center text-muted-text">
                {modalData?.user?.username || "This user"} requested withdrawal of $
                {modalData?.amount}. Review the full record below.
              </p>
              <div className="mt-6 rounded-lg bg-secondary-bg border border-border-primary p-4 text-left">
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium text-muted-text">User</p>
                    <p className="text-primary-text break-words">
                      {modalData?.user?.username || "N/A"}{" "}
                      {modalData?.user?.email ? `(${modalData.user.email})` : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium text-muted-text">Status</p>
                    <p className="text-primary-text capitalize">
                      {modalData?.status || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium text-muted-text">Description</p>
                    <p className="text-primary-text break-words">
                      {modalData?.description || "No description provided."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium text-muted-text">Requested At</p>
                    <p className="text-primary-text">
                      {modalData?.createdAt
                        ? new Date(modalData.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium text-muted-text">Updated At</p>
                    <p className="text-primary-text">
                      {modalData?.updatedAt
                        ? new Date(modalData.updatedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="font-medium text-muted-text">Payout Schedule</p>
                    <p className="text-primary-text font-mono text-xs break-all">
                      {modalData?.payoutScheduleId || "-"}
                    </p>
                  </div>
                  {modalData?.rejectReason && (
                    <div className="grid grid-cols-2 gap-2">
                      <p className="font-medium text-muted-text">Reject Reason</p>
                      <p className="text-primary-text break-words">
                        {modalData.rejectReason}
                      </p>
                    </div>
                  )}
                  {modalType !== "history" && modalData?.status === "pending" && (
                    <div className="pt-2">
                      <p className="font-medium text-muted-text mb-2">
                        Reject Reason
                      </p>
                      <Input.TextArea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Add a reason before rejecting..."
                        maxLength={300}
                        className="w-full bg-primary-bg border-border-primary text-primary-text rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
              <Button
                onClick={onClose}
                className="px-6 h-10 rounded-md border-border-primary text-secondary-text  hover:!border-primary-text"
              >
                Close
              </Button>
              {modalType !== "history" && modalData?.status === "pending" && (
                <>
                  <Button
                    onClick={() => handlePayment("COMPLETED")}
                    type="primary"
                    className="px-6 h-10 bg-brand-primary hover:!bg-brand-secondary border-none rounded-md"
                    loading={muLoading}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    onClick={() => handlePayment("REJECTED")}
                    danger
                    className="px-6 h-10 rounded-md"
                    loading={muLoading}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </ConfigProvider>
      </GlobalModal>
    </div>
  );
};

export default Page;

"use client";

import { Button, Form, FormProps, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import GlobalModal from "@/components/GlobalModal";
import { useSubmitReportMutation } from "@/redux/features/reports/reports.api";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";

interface ChannelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
}

type TReportFormValues = {
  title: string;
  description: string;
};

const ChannelReportModal = ({
  isOpen,
  onClose,
  channelId,
}: ChannelReportModalProps) => {
  const [form] = Form.useForm<TReportFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [submitReport, { isLoading: isSubmitting }] = useSubmitReportMutation();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish: FormProps<TReportFormValues>["onFinish"] = async (values) => {
    try {
      await submitReport({
        channel: channelId,
        title: values.title,
        description: values.description,
      }).unwrap();
      messageApi.open({
        key: "report",
        type: "success",
        content: "Report submitted successfully!",
        duration: 3,
      });
      form.resetFields();
      onClose();
    } catch (error) {
      applyApiErrorToForm(error, form, ["title", "description"]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  return (
    <GlobalModal
      isModalOpen={isOpen}
      setIsModalOpen={() => handleClose()}
      onClose={handleClose}
      maxWidth="444px"
    >
      {contextHolder}
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl xl:text-2xl font-semibold capitalize mb-2 text-center text-primary-text">
            Write your report
          </h2>
        </div>
        <Form
          form={form}
          name="report_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please enter report title!" },
              { min: 5, message: "Title must be at least 5 characters long." },
              { max: 200, message: "Title must be at most 200 characters long." },
            ]}
          >
            <Input size="large" maxLength={200} placeholder="Write report title..." />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter report description!" },
              { min: 10, message: "Description must be at least 10 characters long." },
              { max: 1000, message: "Description must be at most 1000 characters long." },
            ]}
          >
            <TextArea
              showCount
              rows={6}
              maxLength={1000}
              placeholder="Describe the issue..."
            />
          </Form.Item>

          <div className="flex justify-center items-center gap-3 mt-4">
            <Button
              onClick={handleClose}
              type="text"
              color="danger"
              variant="filled"
              className="px-7!"
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              className="px-7!"
              loading={isSubmitting}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </GlobalModal>
  );
};

export default ChannelReportModal;

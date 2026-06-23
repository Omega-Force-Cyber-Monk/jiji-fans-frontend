import { Button, Form, Input, message } from "antd";
import type { FormProps } from "antd";
import GlobalModal from "../GlobalModal";
import PageHeading from "./PageHeading";
import Link from "next/link";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import Swal from "sweetalert2";

type FieldType = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};
const ChangePassword = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      const res = await changePassword(values).unwrap();
      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.message,
        });
        form.resetFields();
        setIsModalOpen(false);
      }
    } catch (error) {
      applyApiErrorToForm(error, form, [
        "currentPassword",
        "newPassword",
        "confirmPassword",
      ]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };
  return (
    <GlobalModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen}>
      {contextHolder}
      <div className="p-4">
        <PageHeading
          backPath={"/auth"}
          title={"Change Password"}
          hideIcon={true}
        />
        <p className="drop-shadow text-secondary-text my-3">
          Your password must be 8-10 character long.
        </p>
        <Form
          form={form}
          name="normal_login"
          layout="vertical"
          initialValues={{
            remember: true,
          }}
          requiredMark={false}
          onFinish={onFinish}
        >
          <Form.Item
            label={<span className="font-medium text-base">Old Password</span>}
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Please input old password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="**********" />
          </Form.Item>
          <Form.Item
            label={<span className="font-medium text-base">New Password</span>}
            name="newPassword"
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject("New password is required!");
                  }
                  const pattern =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
                  if (!pattern.test(value)) {
                    return Promise.reject(
                      "Include uppercase, lowercase, number, special character!"
                    );
                  }
                  if (value.length < 8) {
                    return Promise.reject("Must be at least 8 characters!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="**********" />
          </Form.Item>
          <Form.Item
            label={
              <span className="font-medium text-base">
                Confirm New Password
              </span>
            }
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Please Re-Enter new password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The new password that you entered do not match!")
                  );
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="**********" />
          </Form.Item>
          <div className="text-end">
            <Link href={`/forget-pass`}>
              <Button size="small" type="link" color="pink" variant="link">
                Forgot Password ?
              </Button>
            </Link>
          </div>
          <div className="w-full flex justify-center pt-4 ">
            <Button
              loading={isLoading}
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full px-2 "
            >
              Save Password
            </Button>
          </div>
        </Form>
      </div>
    </GlobalModal>
  );
};

export default ChangePassword;

"use client";

import React, { useState } from "react";
import { Button, ConfigProvider, Form, FormProps, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import ClientButton from "../ui/ClientButtton";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import SuccessAnimation from "../ui/SuccessAnimation";

type FieldType = {
  email: string;
};

const ForgetPass = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [mutation, { isLoading }] = useForgotPasswordMutation();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      const response = await mutation(values).unwrap();
      if (response.success) {
        setSuccessMessage(response.message);
        setShowSuccessAnimation(true);
      }
    } catch (error) {
      applyApiErrorToForm(error, form, ["email"]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  const handleAnimationComplete = () => {
    router.push(`/verify-email?type=forgot&query=${form.getFieldValue("email")}`);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: "var(--primary-bg)",
          colorText: "var(--primary-text)",
        },
        components: {
          Input: {
            borderRadiusLG: 30,
            colorBgContainer: "var(--primary-bg)",
            colorText: "var(--primary-text)",
            colorTextPlaceholder: "var(--muted-text)",
          },
          Button: {
            borderRadiusLG: 30,
            colorBgContainer: "var(--brand-primary)",
            colorText: "#fff",
          },
        },
      }}
    >
      {showSuccessAnimation && (
        <SuccessAnimation
          message={successMessage}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      <div className=" w-full">
        {contextHolder}
        <h3 className="text-2xl mb-3 font-medium text-center text-primary-text">
          <ClientButton>
            <ArrowLeftIcon className="w-5 xl:w-6" />
          </ClientButton>{" "}
          Forget Password
        </h3>
        <p className="text-muted-text mb-8 text-center">
          Please provide your email address to receive a verification code for
          resetting your password.
        </p>
        <Form
          form={form}
          // name={"normal_login"}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className="w-full"
        >
          <Form.Item
            // label={"User Email"}
            name="email"
            rules={[
              {
                type: "email",
                message: "Input a valid email!",
              },
              {
                required: true,
                message: "Email is required!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="E-mail"
              prefix={<EnvelopeIcon className="w-5 mr-1" />}
            />
          </Form.Item>
          <div className="w-full flex justify-center pt-1">
            <Button
              loading={isLoading}
              type="primary"
              size="large"
              htmlType="submit"
              className="px-2 w-full"
            >
              Send OTP
            </Button>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default ForgetPass;

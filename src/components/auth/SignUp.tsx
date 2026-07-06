"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Col,
  ConfigProvider,
  Form,
  FormProps,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { cn } from "@/utils/cn";
import { AtSymbolIcon, KeyIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { countries } from "countries-list";
import { ALLOWED_COUNTRY_CODES } from "@/constants/countries.const";
import { useRegistrationMutation } from "@/redux/features/auth/authApi";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import Link from "next/link";

type FieldType = {
  name: string;
  email: string;
  country: string;
  language: string;
  address: string;
  password: string;
  confirmPassword: string;
  terms?: boolean;
};

const SignUp = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { messageApi } = useAppContext();
  const [mutation, { isLoading }] = useRegistrationMutation();

  // Load signup form data if exists in sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem("signup_form_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        form.setFieldsValue(parsed);
      } catch (e) {
        console.error("Failed to parse saved signup form data", e);
      }
    }

    const termsAccepted = sessionStorage.getItem("signup_terms_accepted");
    if (termsAccepted === "true") {
      form.setFieldsValue({ terms: true });
    }
  }, [form]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      if (values.terms !== true) {
        messageApi.open({
          key: "registration",
          type: "error",
          content: "Please accept terms and conditions",
          duration: 2,
        });
        return;
      }

      // Store credentials temporarily for auto-login after verification
      sessionStorage.setItem("pending_email", values.email);
      sessionStorage.setItem("pending_password", values.password);

      const response = await mutation({
        username: values.name,
        email: values.email,
        country: values.country,
        address: values.address,
        languagePreference: values.language,
        password: values.password,
      }).unwrap();

      // Clear the temporary signup draft storage upon successful registration
      sessionStorage.removeItem("signup_form_data");
      sessionStorage.removeItem("signup_terms_accepted");

      messageApi.open({
        key: "registration",
        type: "success",
        content: "Please verify your email to complete registration",
        duration: 2,
      });
      router.replace(`/verify-email?type=verify&query=${values.email}`);
    } catch (error) {
      applyApiErrorToForm(error, form, [
        "name",
        "email",
        "country",
        "language",
        "address",
        "password",
        "confirmPassword",
      ]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  // Redirect to Terms and Conditions page saving the form state
  const handleTermsRedirect = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const currentValues = form.getFieldsValue();
    sessionStorage.setItem("signup_form_data", JSON.stringify(currentValues));
    router.push("/terms?from=signup");
  };


  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: "var(--primary-bg)",
          colorText: "var(--primary-text)",
          colorTextPlaceholder: "var(--muted-text)",
          colorIcon: "var(--muted-text)",
          colorIconHover: "var(--primary-text)",
        },
        components: {
          Input: {
            borderRadiusLG: 30,
            colorBgContainer: "var(--primary-bg)",
            colorText: "var(--primary-text)",
            colorTextPlaceholder: "var(--muted-text)",
            colorIcon: "var(--muted-text)",
            colorIconHover: "var(--primary-text)",
            colorBgContainerDisabled: "var(--primary-bg)",
            colorTextDisabled: "var(--primary-text)",
          },
          Button: {
            borderRadiusLG: 30,
            colorBgContainer: "var(--brand-primary)",
            colorText: "#fff",
          },
          Select: {
            borderRadiusLG: 30,
            colorBgContainer: "var(--primary-bg)",
            colorText: "var(--primary-text)",
            colorTextPlaceholder: "var(--muted-text)",
            colorIcon: "var(--muted-text)",
            colorIconHover: "var(--primary-text)",
            colorBgContainerDisabled: "var(--primary-bg)",
            colorTextDisabled: "var(--primary-text)",
          },
          Checkbox: {
            colorText: "var(--primary-text)",
            colorTextDisabled: "var(--primary-text)",
          }
        },
      }}
    >
      <div className={cn("w-full")}>
        <style>{`
          input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 30px var(--primary-bg) inset !important;
            -webkit-text-fill-color: var(--primary-text) !important;
          }
          input:-webkit-autofill:hover {
            -webkit-box-shadow: 0 0 0 30px var(--primary-bg) inset !important;
          }
          input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 30px var(--primary-bg) inset !important;
          }
          input:-webkit-autofill:disabled {
            -webkit-box-shadow: 0 0 0 30px var(--primary-bg) inset !important;
            -webkit-text-fill-color: var(--primary-text) !important;
          }
        `}</style>
        <h3 className="text-2xl font-semibold mb-6 text-center text-primary-text">
          Sign Up
        </h3>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            language: "en",
          }}
          onFinish={onFinish}
          requiredMark={false}
          className="w-full"
          disabled={isLoading}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Name is required!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter your name"
              prefix={<UserIcon className="w-5 mr-0.5" />}
            />
          </Form.Item>
          <Form.Item
            label={"Email"}
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
              placeholder="user@ac.com"
              prefix={<AtSymbolIcon className="w-5 mr-0.5" />}
            />
          </Form.Item>
          <Row
            gutter={[
              { xs: 8, lg: 16 },
              { xs: 8, lg: 16 },
            ]}
          >
            <Col xs={12}>
              <Form.Item
                label="Country"
                name="country"
                rules={[
                  {
                    required: true,
                    message: "Country is required!",
                  },
                ]}
              >
                <Select
                  size="large"
                  showSearch
                  placeholder="Select..."
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={Object.entries(countries)
                    .filter(([code]) => ALLOWED_COUNTRY_CODES.has(code.toUpperCase()))
                    .map((country) => ({
                      label: country[1].name,
                      value: country[1].name,
                    }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                label="Language"
                name="language"
                rules={[
                  {
                    required: true,
                    message: "Language is required!",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select..."
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      label: "English",
                      value: "en",
                    },
                    {
                      label: "Spanish",
                      value: "es",
                    },
                    {
                      label: "French",
                      value: "fr",
                    },
                    {
                      label: "German",
                      value: "de",
                    },
                    {
                      label: "Chinese (Simplified)",
                      value: "zh-CN",
                    },
                    {
                      label: "Chinese (Traditional)",
                      value: "zh-TW",
                    },
                    {
                      label: "Portuguese",
                      value: "pt",
                    },
                    {
                      label: "Japanese",
                      value: "ja",
                    },
                    {
                      label: "Italian",
                      value: "it",
                    },
                    {
                      label: "Hindi",
                      value: "hi",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Address"
            name="address"
            rules={[
              {
                required: true,
                message: "Address is required!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter your address"
              prefix={<MapPinIcon className="w-5 mr-0.5" />}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject("Password is required!");
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
            <Input.Password
              size="large"
              placeholder="**********"
              prefix={<KeyIcon className="w-5 mr-0.5" />}
            />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Re-Enter the password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The password that you entered do not match!")
                  );
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              size="large"
              placeholder="**********"
              prefix={<KeyIcon className="w-5 mr-0.5" />}
            />
          </Form.Item>
          <Form.Item name="terms" valuePropName="checked">
            <Checkbox className="text-primary-text">
              <span className="text-primary-text">I&#39;ve read and agree with your </span>
              <a
                href="#"
                onClick={handleTermsRedirect} // Redirect to terms page on link click
                className="text-brand-primary underline"
              >
                Terms of use
              </a>
            </Checkbox>
          </Form.Item>
          <div className="w-full flex justify-center ">
            <Button
              loading={isLoading}
              type="primary"
              size="large"
              htmlType="submit"
              className="px-2 w-full"
            >
              Create account
            </Button>
          </div>
        </Form>
        <p className="text-muted-text mt-8 text-center">
          Already have an account?{" "}
          <Link
            href={"/sign-in"}
            className="hover:text-brand-primary text-primary-text transition-all underline underline-offset-2"
          >
            Log In
          </Link>
        </p>
      </div>
    </ConfigProvider>
  );
};

export default SignUp;

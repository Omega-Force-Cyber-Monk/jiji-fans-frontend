"use client";

import { cn } from "@/utils/cn";
import {
  ArrowUpTrayIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  LockClosedIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button, Form, FormProps, Input, message, Upload, UploadFile, UploadProps } from "antd";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { useAppSelector } from "@/redux/hook";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import { TUniObject } from "@/types";
import Image from "@/components/ui/CImage";
import Swal from "sweetalert2";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import {
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/redux/features/users/users.api";
import {
  extractFileFromUploadValue,
  RESOURCE_PURPOSE,
  uploadResource,
} from "@/lib/resources/uploadResource";

const settingOptions = [
  {
    label: "About Us",
    description: "Manage your platform's about page content",
    href: "/admin/settings/about",
    icon: InformationCircleIcon,
  },
  {
    label: "Privacy Policy",
    description: "Update your privacy policy document",
    href: "/admin/settings/privacy",
    icon: ShieldCheckIcon,
  },
  {
    label: "Terms & Conditions",
    description: "Edit the terms and conditions for your platform",
    href: "/admin/settings/terms",
    icon: DocumentTextIcon,
  },
];

const Settings = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editAble, setEditAble] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAppSelector((state) => state.auth);
  const [mutation, { isLoading }] = useUpdateProfileMutation();
  const [avatarMutation, { isLoading: isAvatarLoading }] = useUpdateAvatarMutation();
  const [changePassword, { isLoading: isChangePasswordLoading }] = useChangePasswordMutation();

  const onChangePasswordFinish = async (values: any) => {
    try {
      const res = await changePassword(values).unwrap();
      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.message,
        });
        passwordForm.resetFields();
      }
    } catch (error) {
      applyApiErrorToForm(error, passwordForm, [
        "currentPassword",
        "newPassword",
        "confirmPassword",
      ]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  useEffect(() => {
    if (user?._id) {
      form.setFieldsValue({ ...user, address: "N/A" });
    }
    if (user?.avatar) {
      setImageUrl(user.avatar);
    }
  }, [form, user]);

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    accept: "image/png,image/jpeg",
    beforeUpload: (file) => {
      setFileList([file]);
      setImageUrl(URL.createObjectURL(file));
      return false;
    },
    showUploadList: false,
  };

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      if (fileList.length > 0) {
        const file = extractFileFromUploadValue(fileList[0]);
        if (!file) {
          messageApi.error("Please select an image first");
          return;
        }
        const uploadedResource = await uploadResource(file, {
          purpose: RESOURCE_PURPOSE.USER_AVATAR,
        });
        await avatarMutation({ resourceId: uploadedResource.resourceId }).unwrap();
      }
      await mutation({ ...values, address: "N/A" }).unwrap();
      messageApi.open({
        key: "settings-profile-success",
        type: "success",
        content: "Profile updated successfully!",
        duration: 3,
      });
      setFileList([]);
      setEditAble(false);
    } catch (error) {
      applyApiErrorToForm(error, form, [
        "username",
        "email",
        "phoneNumber",
        "country",
        "language",
        "address",
      ]);
      errorAlert({ error, messageApi });
    }
  };

  return (
    <div className="space-y-6">
      {contextHolder}

      <AppBreadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Settings" },
        ]}
        className="mb-4!"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
        {/* ── Left Column: Admin Profile Card ── */}
        <div className="bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-brand-primary" />
              <h2 className="text-xl font-semibold text-primary-text">Admin Profile</h2>
            </div>
            {!editAble && (
              <button
                id="settings-edit-profile-btn"
                onClick={() => setEditAble(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center py-8 px-6 border-b border-border-primary bg-brand-primary/5">
            <div
              className={cn(
                "relative h-28 w-28 rounded-full overflow-hidden ring-4 transition-all",
                editAble ? "ring-brand-primary" : "ring-border-primary"
              )}
            >
              <Image
                src={imageUrl || "/static/demo-image.jpg"}
                alt="Admin Profile"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            {editAble && (
              <Upload {...uploadProps}>
                <button
                  id="settings-upload-avatar-btn"
                  type="button"
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary/80 bg-brand-primary/10 px-4 py-2 rounded-md transition-colors border border-brand-primary/20"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Upload Photo
                </button>
              </Upload>
            )}
            {!editAble && (
              <div className="mt-3 text-center">
                <p className="text-base font-semibold text-primary-text">{user?.username}</p>
                <p className="text-sm font-medium text-muted-text">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <Form
              form={form}
              name="admin-settings-profile"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name="username"
                label={<span className="text-sm font-medium text-secondary-text">Full Name</span>}
              >
                <Input
                  size="large"
                  readOnly={!editAble}
                  suffix={editAble ? <PencilIcon className="w-4 text-muted-text" /> : null}
                  className={cn(!editAble && "cursor-default")}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-sm font-medium text-secondary-text">Email Address</span>}
              >
                <Input size="large" readOnly className="cursor-default" />
              </Form.Item>

              {editAble && (
                <div className="flex gap-3 pt-2">
                  <Button
                    id="settings-cancel-edit-btn"
                    onClick={() => {
                      setEditAble(false);
                      form.resetFields();
                      if (user?.avatar) setImageUrl(user.avatar);
                      setFileList([]);
                    }}
                    className="flex-1"
                    style={{ height: 40 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    id="settings-save-profile-btn"
                    loading={isLoading || isAvatarLoading}
                    htmlType="submit"
                    className="flex-1"
                    type="primary"
                    style={{ height: 40 }}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </div>

        {/* ── Right Column: Account Security Card ── */}
        <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-primary flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-semibold text-primary-text">Account Security</h2>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-text mb-4">
              Keep your account secure by updating your password regularly (Must contain uppercase, lowercase, number, special character and be at least 8 characters).
            </p>
            <Form
              form={passwordForm}
              name="admin-change-password"
              layout="vertical"
              requiredMark={false}
              onFinish={onChangePasswordFinish}
            >
              <Form.Item
                label={<span className="text-sm font-medium text-secondary-text">Current Password</span>}
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input current password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password size="large" placeholder="**********" />
              </Form.Item>
              <Form.Item
                label={<span className="text-sm font-medium text-secondary-text">New Password</span>}
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
                label={<span className="text-sm font-medium text-secondary-text">Confirm New Password</span>}
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
              <div className="w-full flex justify-end pt-4">
                <Button
                  loading={isChangePasswordLoading}
                  type="primary"
                  size="large"
                  htmlType="submit"
                  className="px-6"
                >
                  Save Password
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

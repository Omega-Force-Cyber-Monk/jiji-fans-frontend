"use client";

import ChangePassword from "@/components/ui/ChangePassword";
import {
  ArrowUpTrayIcon,
  PencilIcon,
  KeyIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Form,
  Input,
  Select,
  Skeleton,
  Upload,
  UploadFile,
  UploadProps,
  message,
  Breadcrumb,
  ConfigProvider,
} from "antd";
import { useEffect, useState } from "react";
import { countries } from "countries-list";
import { COUNTRY_CODES } from "@/components/prelaunch/countries";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import { sweetAlertConfirmation } from "@/lib/alerts/sweetAlertConfirmation";
import {
  useGetProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/redux/features/users/users.api";
import Image from "@/components/ui/CImage";
import {
  applyApiErrorToForm,
  errorAlert,
  successAlert,
  TResError,
} from "@/lib/alerts";
import { useDeleteAccountMutation } from "@/redux/features/auth/authApi";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import {
  extractFileFromUploadValue,
  RESOURCE_PURPOSE,
  uploadResource,
} from "@/lib/resources/uploadResource";

type TProfileForm = {
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  language: string;
  address: string;
};

const languageMap: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  ja: "Japanese",
  pt: "Portuguese",
  it: "Italian",
  hi: "Hindi",
};

const Settings = () => {
  const { data: profileData, isLoading, isError, error, refetch } = useGetProfileQuery({});
  const profile = profileData?.data;
  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [deleAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const [form] = Form.useForm();
  const [editAble, setEditAble] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>();
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();
  const router = useRouter();

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    accept: "image/png,image/jpeg",
    beforeUpload: (file) => {
      setFileList([file]);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return false;
    },
    showUploadList: false,
  };

  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    if (profile) {
      let fullCountryName = profile?.country;
      if (fullCountryName && fullCountryName.length === 2 && (countries as any)[fullCountryName.toUpperCase()]) {
        fullCountryName = (countries as any)[fullCountryName.toUpperCase()].name;
      }

      form.setFieldsValue({
        name: profile?.username,
        email: profile?.email,
        phoneNumber: profile?.phoneNumber,
        country: fullCountryName,
        language: profile?.languagePreference,
        address: profile.address,
      });

      setImageUrl(profile?.avatar);
    }
  }, [profile, form]);

  const handleDeleteAccount = () => {
    sweetAlertConfirmation({
      func: () => {
        deleAccount({});
        dispatch(logout());
        window.location.href = "/";
      },
      object: "delete your account",
      icon: "warning",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full px-6 py-6 mx-auto space-y-6">
        <Breadcrumb
          items={[
            { title: "Home", href: "/overview" },
            { title: "Profile" },
          ]}
          className="mb-4"
        />

        <div className="flex justify-between items-center pb-2">
          <div className="h-9 w-64 bg-skeleton-bg rounded-md animate-pulse" />
          <div className="h-10 w-32 bg-skeleton-bg rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            {/* Summary Card Skeleton */}
            <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex flex-col items-center gap-4 animate-pulse">
              <Skeleton.Avatar active size={128} shape="circle" />
              <div className="h-6 w-32 bg-skeleton-bg rounded-md" />
              <div className="h-4 w-48 bg-skeleton-bg rounded-md" />
              <div className="h-6 w-16 bg-skeleton-bg rounded-md mt-2" />
            </div>

            {/* Quick Actions Skeleton */}
            <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-5 w-40 bg-skeleton-bg rounded-md mb-2 border-b border-border-primary pb-2" />
              <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              <div className="h-10 w-full bg-skeleton-bg rounded-md" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-8">
            <div className="bg-secondary-bg border border-border-primary rounded-lg p-8 space-y-6 animate-pulse">
              <div className="h-8 w-48 bg-skeleton-bg rounded-md mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
                  <div className="h-10 w-full bg-skeleton-bg rounded-md" />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-skeleton-bg rounded-md" />
                  <div className="h-10 w-full bg-skeleton-bg rounded-md" />
                </div>
                {/* Phone Number */}
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-skeleton-bg rounded-md" />
                  <div className="h-10 w-full bg-skeleton-bg rounded-md" />
                </div>
                {/* Country */}
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-skeleton-bg rounded-md" />
                  <div className="h-10 w-full bg-skeleton-bg rounded-md" />
                </div>
                {/* Language */}
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
                  <div className="h-10 w-full bg-skeleton-bg rounded-md" />
                </div>
                {/* Address (Spans 2 columns) */}
                <div className="md:col-span-2 space-y-2">
                  <div className="h-4 w-16 bg-skeleton-bg rounded-md" />
                  <div className="h-10 w-full bg-skeleton-bg rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMsg = (error as any)?.data?.message || (error as any)?.message || "Internal Server Error (500) from the backend server.";
    return (
      <div className="w-full px-4 py-6 mx-auto space-y-6">
        <Breadcrumb
          items={[
            { title: "Home", href: "/overview" },
            { title: "Profile" },
          ]}
          className="mb-4"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-secondary-bg border border-border-primary rounded-lg space-y-6 max-w-2xl mx-auto shadow-xs">
          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-primary-text">Failed to Load Profile</h3>
            <p className="text-base text-muted-text max-w-md mx-auto">
              {errorMsg}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="primary"
              onClick={() => refetch()}
              className="h-10 px-6 rounded-md"
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                dispatch(logout());
                window.location.href = "/";
              }}
              className="h-10 px-6 rounded-md"
            >
              Logout / Reset Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="w-full mx-auto space-y-6">
        <Breadcrumb
          items={[
            { title: "Home", href: "/overview" },
            { title: "Profile" },
          ]}
          className="mb-4"
        />

        <div className="flex justify-between items-center pb-2">
          <h2 className="text-3xl font-semibold text-primary-text"></h2>
          {!editAble && (
            <Button
              type="primary"
              onClick={() => setEditAble(true)}
              icon={<PencilIcon className="w-4 h-4 inline-block mr-1" />}
              className="flex items-center justify-center font-medium"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">

          {/* Left Column - Summary Card & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">

            {/* Summary Card */}
            <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex flex-col items-center text-center shadow-xs">
              <div className="relative h-32 w-32 rounded-full group mb-4">
                <div className="h-full w-full overflow-hidden rounded-full border-2 border-border-primary">
                  <Image
                    src={imageUrl || "/static/demo-image.jpg"}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Upload {...props}>
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer">
                    <ArrowUpTrayIcon className="w-6 h-6 text-white mb-1" />
                    <span className="text-[11px] font-medium text-white">Change Photo</span>
                  </div>
                </Upload>
              </div>

              {fileList.length > 0 && (
                <Button
                  size="middle"
                  type="primary"
                  loading={isUpdatingAvatar}
                  onClick={async () => {
                    try {
                      const file = extractFileFromUploadValue(fileList[0]);
                      if (!file) {
                        messageApi.error("Please select an image first");
                        return;
                      }

                      const formData = new FormData();
                      formData.append("file", file);

                      await updateAvatar(formData).unwrap();
                      successAlert({ text: "Profile photo updated successfully!" });
                      setFileList([]);
                    } catch (error) {
                      errorAlert({ error: error as TResError, messageApi });
                    }
                  }}
                  className="mb-4 w-full"
                >
                  Save Photo
                </Button>
              )}

              <h4 className="text-xl font-medium text-primary-text mb-1 truncate max-w-full">
                {profile?.username}
              </h4>
              <p className="text-sm text-muted-text mb-3 truncate max-w-full">
                {profile?.email}
              </p>

              {profile?.role && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {profile.role}
                </span>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-4 shadow-xs">
              <h5 className="text-base font-semibold text-primary-text border-b border-border-primary pb-2 mb-2">
                Security & Support
              </h5>

              <button
                type="button"
                onClick={() => setPassModalOpen(true)}
                className="w-full flex items-center justify-start gap-3 rounded-md py-2.5 px-4 bg-primary-bg hover:bg-primary-bg/85 border border-border-primary text-primary-text text-sm font-medium transition-colors cursor-pointer"
              >
                <KeyIcon className="w-5 h-5 text-secondary-text" />
                Change Password
              </button>

              {/* Advanced Accounts ownership panel (Meta inspired) */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="w-full flex items-center justify-between rounded-md py-2.5 px-4 bg-primary-bg hover:bg-primary-bg/85 border border-border-primary text-primary-text text-sm font-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-secondary-text" />
                    <span>Account Ownership & Control</span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-muted-text transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`} />
                </button>

                {advancedOpen && (
                  <div className="pl-4 pr-3 py-3 bg-primary-bg/30 border border-border-primary/50 rounded-md space-y-2 mt-1 animate-fade-in">
                    <p className="text-[11px] text-muted-text leading-normal">
                      Manage your profile settings, control account deactivation, or initiate a permanent account deletion request.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmOpen(true);
                        setConfirmText("");
                      }}
                      className="text-left text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer border-none bg-transparent p-0 flex items-center gap-1 hover:underline"
                    >
                      Deactivation or deletion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Form Content Card */}
          <div className="lg:col-span-8">
            <div className="bg-secondary-bg border border-border-primary rounded-lg p-8 shadow-xs">
              <h3 className="text-2xl font-semibold text-primary-text mb-6 border-b border-border-primary pb-4">
                Personal Information
              </h3>

              <ConfigProvider
                theme={{
                  token: {
                    colorBorder: "var(--border-primary)",
                    colorTextDisabled: "var(--primary-text)",
                    colorPrimary: "var(--brand-primary)",
                    colorPrimaryHover: "var(--brand-primary)",
                  },
                  components: {
                    Input: {
                      colorBgContainer: "var(--secondary-bg)",
                      colorText: "var(--primary-text)",
                      colorTextPlaceholder: "var(--muted-text)",
                      colorTextDisabled: "var(--primary-text)",
                      colorBorder: "var(--border-primary)",
                    },
                    Select: {
                      colorBgContainer: "var(--secondary-bg)",
                      colorText: "var(--primary-text)",
                      colorTextPlaceholder: "var(--muted-text)",
                      colorTextDisabled: "var(--primary-text)",
                      colorBorder: "var(--border-primary)",
                      colorBgContainerDisabled: "rgba(255, 255, 255, 0.02)",
                    },
                  },
                }}
              >
                <Form
                  form={form}
                  name="profileForm"
                  layout="vertical"
                  onFinish={async (values: TProfileForm) => {
                    try {
                      const payload = {
                        username: values.name,
                        phoneNumber: values.phoneNumber,
                        country: values.country,
                        address: values.address,
                        languagePreference: values.language,
                      };
                      await updateProfile(payload).unwrap();
                      messageApi.success("Profile updated successfully!");
                      setEditAble(false);
                    } catch (error) {
                      const err = error as TResError;
                      applyApiErrorToForm(error, form, [
                        "name",
                        "phoneNumber",
                        "country",
                        "address",
                        "language",
                      ]);
                      const sourceMessages = err?.data?.errorSources
                        ?.map((s) => s?.message)
                        .filter(Boolean);
                      const countryError = err?.data?.errorSources?.find(
                        (s) => s?.path === "country",
                      )?.message;
                      if (countryError) {
                        form.setFields([{ name: "country", errors: [countryError] }]);
                      }
                      const fallback =
                        (sourceMessages && sourceMessages.length > 0
                          ? sourceMessages.join(", ")
                          : err?.data?.message || err?.message) ||
                        "Failed to update profile";
                      errorAlert({
                        error: {
                          message: fallback,
                          data: {
                            message: fallback,
                            errorSources: err?.data?.errorSources || [],
                            success: false,
                            stack: null,
                          },
                        } as TResError,
                        messageApi,
                      });
                    }
                  }}
                  autoComplete="off"
                  requiredMark={false}
                >

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <Form.Item
                      name="name"
                      label={<span className="text-secondary-text font-medium text-sm">Full Name</span>}
                      rules={[
                        { required: true, message: "Name is required!" },
                        { min: 2, message: "Username must be at least 2 characters" },
                        { max: 100, message: "Username must not exceed 100 characters" },
                      ]}
                    >
                      <Input
                        size="large"
                        readOnly={!editAble}
                        className="rounded-md"
                        suffix={
                          editAble && <PencilIcon className="w-4 h-4 text-muted-text" />
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-secondary-text font-medium text-sm">Email Address</span>}
                      name="email"
                    >
                      <Input readOnly size="large" className="rounded-md bg-primary-bg/50 cursor-not-allowed" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-secondary-text font-medium text-sm">Phone Number</span>}
                      name="phoneNumber"
                      rules={[
                        { required: true, message: "Phone number is required!" },
                        { min: 7, message: "Phone number must be at least 7 digits" },
                        { max: 20, message: "Phone number must not exceed 20 characters" },
                        {
                          pattern: /^\+?[\d\s\-()]{7,20}$/,
                          message: "Invalid phone number format",
                        },
                      ]}
                    >
                      <PhoneNumberInput disabled={!editAble} />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-secondary-text font-medium text-sm">Country</span>}
                      name="country"
                      rules={[
                        { required: true, message: "Country is required!" },
                        { min: 2, message: "Country must be at least 2 characters" },
                        { max: 56, message: "Country name too long" },
                        {
                          pattern: /^[a-zA-Z\s\-']+$/,
                          message: "Country name can only contain letters, spaces, hyphens, and apostrophes",
                        },
                      ]}
                    >
                      <Select
                        size="large"
                        showSearch
                        disabled={!editAble}
                        className="rounded-md w-full"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={Object.entries(countries).map((country) => ({
                          label: country[1].name,
                          value: country[1].name,
                        }))}
                      />
                    </Form.Item>

                    {editAble ? (
                      <Form.Item
                        label={<span className="text-secondary-text font-medium text-sm">Language</span>}
                        name="language"
                        rules={[
                          { required: true, message: "Language is required!" },
                          { min: 2, message: "Language preference must be at least 2 characters" },
                          { max: 10, message: "Language preference must not exceed 10 characters" },
                          {
                            pattern: /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?$/,
                            message: "Invalid language format (e.g., en, en-US)",
                          },
                        ]}
                      >
                        <Select
                          size="large"
                          placeholder="Select..."
                          className="rounded-md w-full"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={Object.entries(languageMap).map(([code, name]) => ({
                            label: name,
                            value: code,
                          }))}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item label={<span className="text-secondary-text font-medium text-sm">Language</span>}>
                        <Input
                          size="large"
                          readOnly
                          className="rounded-md"
                          value={
                            languageMap[profile?.languagePreference || ""] ||
                            profile?.languagePreference ||
                            ""
                          }
                        />
                      </Form.Item>
                    )}

                    <div className="md:col-span-2">
                      <Form.Item
                        name="address"
                        label={<span className="text-secondary-text font-medium text-sm">Address</span>}
                        rules={[{ required: true, message: "Address is required!" }]}
                      >
                        <Input
                          size="large"
                          readOnly={!editAble}
                          className="rounded-md"
                          suffix={
                            editAble && <PencilIcon className="w-4 h-4 text-muted-text" />
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {editAble && (
                    <div className="flex justify-end gap-4 pt-6 border-t border-border-primary mt-6">
                      <Button
                        onClick={() => {
                          setEditAble(false);
                          if (profile) {
                            let fullCountryName = profile?.country;
                            if (fullCountryName && fullCountryName.length === 2 && (countries as any)[fullCountryName.toUpperCase()]) {
                              fullCountryName = (countries as any)[fullCountryName.toUpperCase()].name;
                            }
                            form.setFieldsValue({
                              name: profile?.username,
                              email: profile?.email,
                              phoneNumber: profile?.phoneNumber,
                              country: fullCountryName,
                              language: profile?.languagePreference,
                              address: profile.address,
                            });
                            setImageUrl(profile?.avatar);
                          }
                        }}
                        className="px-6! h-10! rounded-md text-base!"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdatingProfile}
                        className="px-6! h-10! rounded-md text-base! border-none!"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </Form>
              </ConfigProvider>
            </div>
          </div>

        </div>
      </div>
      <ChangePassword
        isModalOpen={passModalOpen}
        setIsModalOpen={setPassModalOpen}
      />

      {/* Meta-style Account Deletion Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-secondary-bg border border-border-primary w-full max-w-md rounded-lg shadow-xl overflow-hidden p-6 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldCheckIcon className="w-7 h-7" />
              <h3 className="text-lg font-semibold text-primary-text">Account Deactivation or Deletion</h3>
            </div>
            
            <p className="text-xs text-secondary-text leading-relaxed">
              If you want to take a break, you can deactivate your account. If you proceed with deletion, this is permanent and will delete all your uploads, comments, and creator channel contents.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-muted-text">
                To confirm permanent deletion, please type your email <strong className="text-primary-text select-all">{profile?.email}</strong> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={profile?.email || "Enter your email"}
                className="w-full bg-primary-bg border border-border-primary rounded-md px-3.5 py-2 text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 placeholder:text-muted-text"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-primary">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-border-primary bg-primary-bg text-primary-text hover:bg-primary-bg/85 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== profile?.email || isDeleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all border-none"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;

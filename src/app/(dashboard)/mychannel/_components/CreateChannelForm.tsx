"use client";

import { TUniObject } from "@/types";
import {
  Button,
  Form,
  FormProps,
  Input,
  Select,
  message,
  ConfigProvider,
  Upload,
} from "antd";
import React, { useMemo, useState, useEffect } from "react";
import {
  useCreateChannelMutation,
  useEditChannelImageMutation,
} from "@/redux/features/channel/channel.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetProfileQuery } from "@/redux/features/users/users.api";
import { setAccessToken } from "@/lib/auth/tokenUtils";
import { kycAlert } from "@/lib/alerts/kycAlert";
import { applyApiErrorToForm } from "@/lib/alerts";
import { getImageUrl } from "@/lib/helpers/getImageUrl";

import {
  extractFileFromUploadValue,
  RESOURCE_PURPOSE,
  uploadResource,
} from "@/lib/resources/uploadResource";
import {
  FiCamera,
  FiImage,
  FiCheckCircle,
  FiArrowRight,
  FiUploadCloud,
  FiLock,
} from "react-icons/fi";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";

const { TextArea } = Input;

const CreateChannelForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // File Upload States
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const [bannerFile, setBannerFile] = useState<any>(null);
  const [bannerUrl, setBannerUrl] = useState<string>("");

  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Data Fetching
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery({ limit: 10 });

  const [createChannel, { isLoading: isCreating }] = useCreateChannelMutation();
  const [editChannelImage] = useEditChannelImageMutation();

  const { data: profileData } = useGetProfileQuery(undefined);
  const profile = profileData?.data;

  // Effects
  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
      if (bannerUrl && bannerUrl.startsWith("blob:")) URL.revokeObjectURL(bannerUrl);
    };
  }, [avatarUrl, bannerUrl]);

  // Options
  const categoryOptions = useMemo(() => {
    if (!categoriesData?.data?.categories) return [];
    return categoriesData.data.categories.map((cat) => ({
      label: cat.name,
      value: cat._id,
    }));
  }, [categoriesData]);

  // Handlers
  const handleAvatarChange = (info: any) => {
    const file = info.fileList[0] || null;
    setAvatarFile(file);
    if (file) {
      const browserFile = extractFileFromUploadValue(file);
      if (browserFile) {
        if (avatarUrl && avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
        setAvatarUrl(URL.createObjectURL(browserFile));
      }
    } else {
      setAvatarUrl("");
    }
  };

  const handleBannerChange = (info: any) => {
    const file = info.fileList[0] || null;
    setBannerFile(file);
    if (file) {
      const browserFile = extractFileFromUploadValue(file);
      if (browserFile) {
        if (bannerUrl && bannerUrl.startsWith("blob:")) URL.revokeObjectURL(bannerUrl);
        setBannerUrl(URL.createObjectURL(browserFile));
      }
    } else {
      setBannerUrl("");
    }
  };

  // Watchers
  const watchedName = Form.useWatch("name", form);
  const watchedCategory = Form.useWatch("category", form);

  const categoryLabel = useMemo(() => {
    if (!watchedCategory || !categoryOptions.length) return "";
    return categoryOptions.find((opt) => opt.value === watchedCategory)?.label || "";
  }, [watchedCategory, categoryOptions]);

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    const key = "launch-creator-channel";
    messageApi.open({ key, type: "loading", content: "Creating your channel..." });

    try {
      const response = await createChannel({
        name: values.name,
        category: values.category,
        tagline: values.tagline,
        description: values.description,
        about: values.about,
      }).unwrap();

      const channelId = response?.data?._id;

      if (channelId) {
        setIsUploadingFiles(true);
        if (avatarFile) {
          messageApi.open({ key, type: "loading", content: "Uploading avatar..." });
          const f = extractFileFromUploadValue(avatarFile);
          if (f) {
            const up = await uploadResource(f, { purpose: RESOURCE_PURPOSE.CHANNEL_AVATAR, targetId: channelId });
            await editChannelImage({ channelId, body: { type: "avatar", resourceId: up.resourceId } }).unwrap();
          }
        }
        if (bannerFile) {
          messageApi.open({ key, type: "loading", content: "Uploading banner..." });
          const f = extractFileFromUploadValue(bannerFile);
          if (f) {
            const up = await uploadResource(f, { purpose: RESOURCE_PURPOSE.CHANNEL_BANNER, targetId: channelId });
            await editChannelImage({ channelId, body: { type: "banner", resourceId: up.resourceId } }).unwrap();
          }
        }
      }

      setAccessToken(response?.data?.accessToken);
      messageApi.open({ key, type: "success", content: "🎉 Your channel is live!", duration: 3 });
      kycAlert({ func: () => router.push("/verification"), denyFunc: () => router.push("/dashboard") });
    } catch (error) {
      const { errorMessage } = applyApiErrorToForm(error, form, ["name", "category", "tagline", "description", "about"]);
      messageApi.open({ key, type: "error", content: errorMessage || "Failed to create channel", duration: 3 });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const isSubmitting = isCreating || isUploadingFiles;

  return (
    <div className="w-full">
      {contextHolder}

      {/* Top Navigation / Header */}
      <div className="sticky top-0 z-30">
        <div className="w-full py-6">
          <AppBreadcrumb
            items={[{ title: "Home", href: "/overview" }, { title: "Become a Creator" }]}
            className="text-xs font-medium text-muted-text"
          />
        </div>

      </div>

      <div className="w-full mt-6 space-y-6">

        {/* Visual Preview Card (Banner & Avatar) */}
        <div className="group relative w-full rounded-lg overflow-hidden bg-primary-bg border border-border-primary shadow-sm transition-all duration-300">

          {/* Banner Area */}
          <div className="relative w-full bg-secondary-bg overflow-hidden" style={{ height: "240px" }}>

            {/* Background Pattern for Empty State */}
            {!bannerUrl && (
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border-primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
              </div>
            )}

            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-text">
                <FiImage className="w-8 h-8 mb-6 opacity-70" />
                <span className="text-xs font-medium tracking-wide uppercase opacity-70">No Cover Image</span>
              </div>
            )}

            {/* Banner Upload Overlay */}
            <div className="absolute inset-0 bg-primary-text/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
              <Upload
                accept="image/*"
                maxCount={1}
                beforeUpload={() => false}
                showUploadList={false}
                onChange={handleBannerChange}
              >
                <Button
                  icon={<FiUploadCloud />}
                  className="h-12 px-6 rounded-md bg-primary-bg text-primary-text text-sm font-medium hover:bg-secondary-bg border border-border-primary shadow-sm flex items-center gap-6"
                >
                  {bannerUrl ? "Change Cover" : "Upload Cover Image"}
                </Button>
              </Upload>
            </div>

            {/* Gradient Overlay at bottom for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-bg to-transparent pointer-events-none" />
          </div>

          {/* Content Container (Avatar + Info) */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">

              {/* Avatar Upload */}
              <div className="relative shrink-0">
                <Upload
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={() => false}
                  showUploadList={false}
                  onChange={handleAvatarChange}
                >
                  <div className="relative group/avatar cursor-pointer">

                    {/* Image Container */}
                    <div className="relative w-16 h-16 sm:w-16 sm:h-16 rounded-md overflow-hidden border-[3px] border-primary-bg bg-secondary-bg shadow-sm">
                      <img
                        src={avatarUrl || getImageUrl(profile?.avatar) || "/static/demo/channel_2.png"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/static/demo/channel_2.png"; }}
                      />

                      {/* Edit Overlay on Avatar */}
                      <div className="absolute inset-0 bg-primary-text/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-primary-bg/20 backdrop-blur-md p-6 rounded-sm">
                          <FiCamera className="w-6 h-6 text-primary-bg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Upload>
              </div>

              {/* Live Meta Data */}
              <div className="flex-1 w-full min-w-0 mb-6 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-6">
                    {categoryLabel && (
                      <span className="inline-flex items-center px-6 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider bg-brand-primary text-secondary-bg border border-brand-primary">
                        {categoryLabel}
                      </span>
                    )}
                    <h3 className="text-2xl font-semibold text-primary-text truncate">
                      {watchedName || profile?.name || "Channel Name"}
                    </h3>
                    <div className="flex items-center gap-6 text-base text-muted-text font-normal">
                      <span>@{(watchedName || profile?.name || "username").toLowerCase().replace(/\s+/g, "")}</span>
                      {watchedName && <span className="w-1 h-1 rounded-sm bg-border-primary" />}
                      {watchedName && <span className="text-success flex items-center gap-6"><FiCheckCircle className="w-6 h-6" /> Public</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "var(--brand-primary)",
              borderRadius: 6, // maps to rounded-md
              colorBorder: "var(--border-primary)",
              colorText: "var(--primary-text)",
              colorTextPlaceholder: "var(--muted-text)",
            },
            components: {
              Input: {
                colorBgContainer: "var(--secondary-bg)",
                activeBorderColor: "var(--brand-primary)",
                hoverBorderColor: "var(--brand-primary)",
              },
              Select: {
                colorBgContainer: "var(--secondary-bg)",
                optionSelectedBg: "var(--primary-bg)",
              },
            },
          }}
        >
          <div className="bg-primary-bg rounded-lg border border-border-primary shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-border-primary bg-secondary-bg flex items-center gap-6">
              <span className="w-8 h-8 rounded-md bg-primary-bg border border-border-primary flex items-center justify-center text-sm">✨</span>
              <div>
                <h4 className="text-xl font-semibold text-primary-text">
                  Channel Details
                </h4>
                <p className="text-xs text-muted-text mt-6">
                  Complete your profile to help fans discover your content.
                </p>
              </div>
            </div>

            <div className="p-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="space-y-6"
              >

                {/* Identity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    label={<span className="text-sm font-medium text-primary-text">Channel Name</span>}
                    name="name"
                    rules={[{ required: true, message: "Please enter your channel name" }]}
                    className="mb-0"
                  >
                    <Input
                      size="large"
                      placeholder="e.g. CinemaVerse"
                      className="bg-secondary-bg border-border-primary focus:bg-primary-bg transition-colors rounded-md text-sm"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm font-medium text-primary-text">Category</span>}
                    name="category"
                    rules={[{ required: true, message: "Please select a category" }]}
                    className="mb-0"
                  >
                    <Select
                      size="large"
                      placeholder="Choose a category..."
                      loading={categoriesLoading}
                      className="bg-secondary-bg border-border-primary rounded-md text-sm"
                      popupClassName="rounded-md"
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={categoryOptions}
                    />
                  </Form.Item>
                </div>

                {/* Tags */}
                <Form.Item
                  label={<span className="text-sm font-medium text-primary-text">Tags for Discovery</span>}
                  name="tagline"
                  rules={[{ required: true, message: "Add some tags to be found" }]}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    placeholder="e.g. film-reviews, tech, daily-vlog (comma separated)"
                    maxLength={100}
                    showCount
                    className="bg-secondary-bg border-border-primary focus:bg-primary-bg transition-colors rounded-md text-sm h-12!"
                  />
                </Form.Item>

                {/* Short Description */}
                <Form.Item
                  label={<span className="text-sm font-medium text-primary-text">Short Tagline</span>}
                  name="description"
                  className="mb-0"
                >
                  <TextArea
                    showCount
                    rows={3}
                    maxLength={500}
                    placeholder="Briefly describe what your channel is about..."
                    className="bg-secondary-bg border-border-primary focus:bg-primary-bg transition-colors rounded-md text-sm resize-none"
                  />
                </Form.Item>

                {/* Full Bio */}
                <Form.Item
                  label={<span className="text-sm font-medium text-primary-text">About You</span>}
                  name="about"
                  className="mb-0"
                >
                  <TextArea
                    showCount
                    rows={5}
                    maxLength={1500}
                    placeholder="Tell your story. What makes your content unique?"
                    className="bg-secondary-bg border-border-primary focus:bg-primary-bg transition-colors rounded-md text-sm resize-none"
                  />
                </Form.Item>

                {/* Info Box */}
                <div className="rounded-md bg-warning/10 border border-warning/30 p-6 flex gap-6 items-start">
                  <div className="text-warning bg-warning/20 p-6 rounded-sm shrink-0">
                    <FiLock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-primary-text">Verification Required</p>
                    <p className="text-xs text-muted-text mt-6 leading-relaxed">
                      To accept payments and withdraw funds, you will need to complete identity verification in the next step.
                    </p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-6 border-t border-border-primary flex items-center justify-end gap-6">
                  <Button
                    type="text"
                    onClick={() => router.back()}
                    className="text-muted-text hover:text-primary-text text-sm font-medium h-12 px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={isSubmitting}
                    type="primary"
                    size="large"
                    htmlType="submit"
                    className="h-12 px-6 bg-brand-primary hover:opacity-90 text-secondary-bg text-sm font-medium rounded-md border-none shadow-sm transition-all"
                  >
                    {!isSubmitting && (
                      <span className="flex items-center gap-6">
                        Create Channel <FiArrowRight className="w-6 h-6" />
                      </span>
                    )}
                  </Button>
                </div>

              </Form>
            </div>
          </div>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default CreateChannelForm;

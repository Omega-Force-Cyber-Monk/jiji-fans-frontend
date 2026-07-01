"use client";
import React, { useEffect, useState, useRef } from "react";
import PageHeading from "@/components/ui/PageHeading";
import { TUniObject } from "@/types";
import { cn } from "@/utils/cn";
import { Button, ConfigProvider, Form, FormProps, Input, Select, Progress, Spin, Alert, message } from "antd";

import { RoleGuard } from "@/components/guards";
import { useRouter } from "next/navigation";
import { useUploadContentMutation } from "@/redux/features/content/content.api";
import { applyApiErrorToForm, errorAlert, successAlert, TResError } from "@/lib/alerts";
import { useGetAllSubscriptionPlansQuery } from "@/redux/features/subscription/subscription.api";
import { useGetProfileQuery } from "@/redux/features/users/users.api";
import {
  useLazyGetYouTubeAuthUrlQuery,
  useCreateYouTubeUploadSessionMutation,
  useSaveYouTubeVideoIdMutation,
} from "@/redux/features/youtube/youtube.api";
import { uploadResource, RESOURCE_PURPOSE } from "@/lib/resources/uploadResource";
import SectionContainer from "@/components/ui/SectionContainer";
import { Breadcrumb } from "antd";
import dynamic from "next/dynamic";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { getYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/helpers/youtube";
import { FiUploadCloud, FiYoutube, FiLink, FiCheckCircle, FiVideo, FiX } from "react-icons/fi";

const Editor = dynamic(() => import("primereact/editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-[320px] bg-secondary-bg animate-pulse rounded-md"></div>
});
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

const Page = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // Tab state: native, youtube_api, youtube_link
  const [uploadType, setUploadType] = useState<"native" | "youtube_api" | "youtube_link">("native");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "verifying" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watched form values
  const videoUrl = Form.useWatch("url", form);
  const title = Form.useWatch("title", form);
  const subscriptionTier = Form.useWatch("subscriptionTier", form);
  const description = Form.useWatch("description", form);

  const [isFetchingMetadata, setIsFetchingMetadata] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // API Hooks
  const [uploadContent, { isLoading: isSubmitting }] = useUploadContentMutation();
  const { data: subscriptionPlans, isLoading: isLoadingPlans, error: plansError } = useGetAllSubscriptionPlansQuery(undefined);
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery(undefined);
  const [triggerGetYouTubeAuthUrl, { isFetching: isFetchingAuthUrl }] = useLazyGetYouTubeAuthUrlQuery();
  const [createYouTubeUploadSession] = useCreateYouTubeUploadSessionMutation();
  const [saveYouTubeVideoId] = useSaveYouTubeVideoIdMutation();

  const user = profileData?.data;
  const youtubeConnected = user?.youtubeConnected;
  const youtubeChannelTitle = user?.youtubeTokens?.channelTitle;

  // Reset states when changing upload types
  useEffect(() => {
    setVideoFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setStatusMessage("");
    form.setFieldsValue({ url: "" });
  }, [uploadType, form]);

  // oEmbed fetch for external link
  useEffect(() => {
    if (uploadType !== "youtube_link" || !videoUrl) return;

    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=[\w-]+|v\/[\w-]+|shorts\/[\w-]+|live\/[\w-]+)|youtu\.be\/[\w-]+)/;
    if (!youtubePattern.test(videoUrl)) return;

    const fetchMetadata = async () => {
      setIsFetchingMetadata(true);
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            if (!form.getFieldValue("title")) {
              form.setFieldsValue({ title: data.title });
            }
            if (!form.getFieldValue("description")) {
              form.setFieldsValue({ description: `<p>${data.title}</p>` });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching YouTube oEmbed details:", err);
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    const delayDebounce = setTimeout(fetchMetadata, 600);
    return () => clearTimeout(delayDebounce);
  }, [videoUrl, uploadType, form]);

  const handleConnectYouTube = async () => {
    try {
      const res = await triggerGetYouTubeAuthUrl().unwrap();
      const url = res?.data?.url || res?.data?.authUrl;
      if (url) {
        window.open(url, "_blank");
      } else {
        message.error("Could not generate OAuth URL.");
      }
    } catch (err) {
      errorAlert({ error: err as TResError, messageApi });
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      // Auto-fill title if empty
      if (!form.getFieldValue("title")) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        form.setFieldsValue({ title: nameWithoutExt });
      }
    } else {
      message.error("Please drop a valid video file.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!form.getFieldValue("title")) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        form.setFieldsValue({ title: nameWithoutExt });
      }
    }
  };

  // Upload to YouTube via Resumable Upload
  const uploadVideoToYouTube = (uploadUrl: string, file: File): Promise<{ url: string; videoId: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            const videoId = responseData.id;
            if (videoId) {
              resolve({
                url: `https://www.youtube.com/watch?v=${videoId}`,
                videoId,
              });
            } else {
              reject(new Error("Video ID not found in YouTube response."));
            }
          } catch (err) {
            reject(new Error("Failed to parse YouTube upload response."));
          }
        } else {
          reject(new Error(`YouTube upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during YouTube upload."));
      xhr.send(file);
    });
  };

  // Form Submit Handler
  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    let finalVideoUrl = values.url;
    let youtubeVideoId = "";

    try {
      // 1. Native S3 Upload Flow
      if (uploadType === "native") {
        if (!videoFile) {
          message.error("Please select a video file to upload.");
          return;
        }

        setUploadStatus("uploading");
        setUploadProgress(30); // Indeterminate start
        setStatusMessage("Uploading video to secure storage...");

        const resource = await uploadResource(videoFile, {
          purpose: RESOURCE_PURPOSE.VIDEO,
        });

        setUploadStatus("verifying");
        setStatusMessage("Verifying video on server...");

        // Get S3 delivery URL from resource response
        // Usually, the backend saves the resource and we can pass the resource ID or URL.
        // We'll pass the resourceId or fileKey, or check if resource has a specific URL.
        finalVideoUrl = (resource as any).fileKey || (resource as any).url || (resource as any).resourceId;
      }

      // 2. YouTube API Resumable Upload Flow
      if (uploadType === "youtube_api") {
        if (!videoFile) {
          message.error("Please select a video file to upload.");
          return;
        }

        setUploadStatus("uploading");
        setStatusMessage("Initiating YouTube upload session...");

        const sessionRes = await createYouTubeUploadSession({
          title: values.title,
          description: values.description?.replace(/<[^>]*>/g, ""), // strip HTML for YouTube
          privacyStatus: "public",
        }).unwrap();

        const uploadUrl = sessionRes.data.uploadUrl;
        setStatusMessage("Uploading video directly to YouTube...");

        const uploadResult = await uploadVideoToYouTube(uploadUrl, videoFile);
        finalVideoUrl = uploadResult.url;
        youtubeVideoId = uploadResult.videoId;
      }

      // 3. Finalize Content Creation
      setUploadStatus("verifying");
      setStatusMessage("Registering video content...");

      const contentRes = await uploadContent({
        title: values.title,
        description: values.description,
        subscriptionTier: values.subscriptionTier,
        url: finalVideoUrl,
      }).unwrap();

      // 4. Link YouTube Video ID if uploading through YouTube API
      if (uploadType === "youtube_api" && youtubeVideoId) {
        setStatusMessage("Linking YouTube video reference...");
        const contentId = contentRes?.data?._id || contentRes?._id;
        if (contentId) {
          await saveYouTubeVideoId({
            contentId,
            youtubeVideoId,
          }).unwrap();
        }
      }

      setUploadStatus("success");
      setStatusMessage("Content published successfully!");
      successAlert({ text: "Content published successfully!" });

      form.resetFields();
      setVideoFile(null);

      setTimeout(() => {
        router.push("/mychannel");
      }, 2000);

    } catch (error) {
      setUploadStatus("error");
      setStatusMessage("Upload or publication failed.");
      applyApiErrorToForm(error, form, ["url", "title", "subscriptionTier", "description"]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  // Preview content helper
  const previewContent = {
    url: uploadType === "youtube_link" ? videoUrl : (videoFile ? URL.createObjectURL(videoFile) : ""),
    title: title || "Video Preview",
  };

  return (
    <RoleGuard allowedRoles={["Creator"]} redirectTo="/overview">
      <SectionContainer className="mt-6">
        {contextHolder}
        <Breadcrumb
          items={[
            { title: "Home", href: "/overview" },
            { title: "Upload Content" },
          ]}
          className="mb-4"
        />

        <div className="w-full mt-6 bg-secondary-bg p-6 md:p-8 rounded-xl border border-border-primary">
          {/* Custom Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-primary-bg/40 p-1.5 rounded-lg border border-border-primary max-w-2xl">
            <button
              type="button"
              onClick={() => setUploadType("native")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-none",
                uploadType === "native"
                  ? "bg-brand-primary text-black font-semibold shadow-sm"
                  : "text-muted-text hover:text-primary-text"
              )}
            >
              <FiVideo className="w-4 h-4" />
              <span>Video Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadType("youtube_api")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-none",
                uploadType === "youtube_api"
                  ? "bg-brand-primary text-black font-semibold shadow-sm"
                  : "text-muted-text hover:text-primary-text"
              )}
            >
              <FiYoutube className="w-4 h-4" />
              <span>Upload to YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadType("youtube_link")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-none",
                uploadType === "youtube_link"
                  ? "bg-brand-primary text-black font-semibold shadow-sm"
                  : "text-muted-text hover:text-primary-text"
              )}
            >
              <FiLink className="w-4 h-4" />
              <span>Link YouTube Video</span>
            </button>
          </div>

          <ConfigProvider
            theme={{
              token: {
                colorBgElevated: "var(--secondary-bg)",
                colorText: "var(--primary-text)",
                colorTextPlaceholder: "var(--muted-text)",
                colorBorder: "var(--border-primary)",
              },
              components: {
                Input: {
                  colorBgContainer: "var(--secondary-bg)",
                  colorText: "var(--primary-text)",
                  colorTextPlaceholder: "var(--muted-text)",
                },
                Select: {
                  colorBgContainer: "var(--secondary-bg)",
                  colorText: "var(--primary-text)",
                  colorTextPlaceholder: "var(--muted-text)",
                },
              },
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Input Fields & Upload area */}
                <div className="space-y-6">

                  {/* Native Upload Tab View */}
                  {uploadType === "native" && (
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-primary-text block mb-1">
                        Select Video File
                      </label>
                      {!videoFile ? (
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border-primary hover:border-brand-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-primary-bg/20 transition-all min-h-[200px]"
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="video/*"
                            className="hidden"
                          />
                          <FiUploadCloud className="w-10 h-10 text-muted-text" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-primary-text">
                              Drag and drop your video here, or <span className="text-brand-primary">browse</span>
                            </p>
                            <p className="text-xs text-muted-text mt-1">
                              Supports MP4, WEBM, MKV (Max 500MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-primary-bg/40 border border-border-primary rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                              <FiVideo className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-primary-text truncate">
                                {videoFile.name}
                              </p>
                              <p className="text-xs text-muted-text mt-0.5">
                                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVideoFile(null)}
                            className="p-1.5 hover:bg-red-500/10 text-muted-text hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* YouTube API Upload Tab View */}
                  {uploadType === "youtube_api" && (
                    <div className="space-y-4">
                      {isLoadingProfile ? (
                        <div className="flex justify-center py-8">
                          <Spin />
                        </div>
                      ) : !youtubeConnected ? (
                        <div className="border border-border-primary bg-primary-bg/20 rounded-xl p-6 flex flex-col items-center text-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                            <FiYoutube className="w-8 h-8 text-red-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-primary-text">
                              Connect YouTube Channel
                            </h3>
                            <p className="text-sm text-muted-text mt-1 max-w-md">
                              To upload videos directly to YouTube, you must first authorize your Google/YouTube account.
                            </p>
                          </div>
                          <Button
                            type="primary"
                            icon={<FiYoutube />}
                            loading={isFetchingAuthUrl}
                            onClick={handleConnectYouTube}
                            className="bg-red-600! border-transparent! hover:bg-red-700! font-medium h-10 px-6! cursor-pointer"
                          >
                            Connect YouTube Channel
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Connected Badge */}
                          <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-primary-text">
                                  YouTube Connected
                                </p>
                                <p className="text-xs text-muted-text mt-0.5">
                                  Channel: {youtubeChannelTitle || "Unknown"}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="text"
                              size="small"
                              onClick={handleConnectYouTube}
                              className="text-brand-primary! hover:opacity-85! cursor-pointer"
                            >
                              Switch Channel
                            </Button>
                          </div>

                          {/* Video Selector */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-primary-text block">
                              Select Video File
                            </label>
                            {!videoFile ? (
                              <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border-primary hover:border-brand-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-primary-bg/20 transition-all min-h-[200px]"
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileSelect}
                                  accept="video/*"
                                  className="hidden"
                                />
                                <FiUploadCloud className="w-10 h-10 text-muted-text" />
                                <div className="text-center">
                                  <p className="text-sm font-medium text-primary-text">
                                    Drag and drop your video here, or <span className="text-brand-primary">browse</span>
                                  </p>
                                  <p className="text-xs text-muted-text mt-1">
                                    Your video will be uploaded directly to YouTube
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-4 bg-primary-bg/40 border border-border-primary rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                                    <FiVideo className="w-5 h-5 text-brand-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-primary-text truncate">
                                      {videoFile.name}
                                    </p>
                                    <p className="text-xs text-muted-text mt-0.5">
                                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setVideoFile(null)}
                                  className="p-1.5 hover:bg-red-500/10 text-muted-text hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                >
                                  <FiX className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* YouTube Link Tab View */}
                  {uploadType === "youtube_link" && (
                    <Form.Item
                      label="YouTube Video URL"
                      name="url"
                      rules={[
                        {
                          required: true,
                          message: "Video URL is required!",
                        },
                        {
                          validator: (_: unknown, value: string) => {
                            if (!value) return Promise.resolve();
                            const youtubePattern =
                              /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=[\w-]+|embed\/[\w-]+|v\/[\w-]+|shorts\/[\w-]+|live\/[\w-]+)|youtu\.be\/[\w-]+)(\S+)?$/;
                            if (!youtubePattern.test(value)) {
                              return Promise.reject(new Error("Please enter a valid YouTube video URL"));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input size="large" placeholder="Enter video URL (e.g. https://www.youtube.com/watch?v=...)" />
                    </Form.Item>
                  )}

                  {/* Common Form Fields */}
                  <Form.Item
                    label="Title of the video"
                    name="title"
                    rules={[
                      {
                        required: true,
                        message: "Title is required!",
                      },
                    ]}
                    help={isFetchingMetadata ? "Fetching video details from YouTube..." : undefined}
                    validateStatus={isFetchingMetadata ? "validating" : undefined}
                  >
                    <Input size="large" placeholder="Title here" disabled={isFetchingMetadata} />
                  </Form.Item>

                  <Form.Item
                    label="Select Subscription Tier"
                    name="subscriptionTier"
                    rules={[
                      {
                        required: true,
                        message: "Subscription tier is required!",
                      },
                    ]}
                    help={plansError ? "Failed to load subscription plans. Please refresh the page." : undefined}
                    validateStatus={plansError ? "error" : undefined}
                  >
                    <Select
                      size="large"
                      placeholder={isLoadingPlans ? "Loading plans..." : "Select..."}
                      loading={isLoadingPlans}
                      disabled={isLoadingPlans}
                      filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={(subscriptionPlans?.data || [])?.map((plan: any) => ({
                        label: `${plan.name} - $${plan.price}`,
                        value: plan._id,
                      }))}
                      notFoundContent={isLoadingPlans ? "Loading..." : "No subscription plans available"}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Write a description about your video"
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Description is required!",
                      },
                      {
                        validator: (_: unknown, value: string) => {
                          if (!value) return Promise.resolve();
                          const text = value.replace(/<[^>]*>/g, "").trim();
                          const hasImage = value.includes("<img");
                          const hasIframe = value.includes("<iframe");

                          if (!text && !hasImage && !hasIframe) {
                            return Promise.reject(new Error("Description cannot be empty!"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <div className="w-full max-w-full overflow-hidden">
                      <Editor
                        value={description}
                        onTextChange={(e) => form.setFieldsValue({ description: e.htmlValue })}
                        style={{ height: "320px" }}
                      />
                    </div>
                  </Form.Item>

                  {/* Upload Status Card */}
                  {uploadStatus !== "idle" && (
                    <div className="bg-primary-bg/30 p-4 border border-border-primary rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary-text">
                          {statusMessage}
                        </span>
                        {uploadStatus === "uploading" && (
                          <span className="text-xs font-semibold text-brand-primary">
                            {uploadProgress}%
                          </span>
                        )}
                      </div>

                      {uploadStatus === "uploading" && (
                        <Progress
                          percent={uploadProgress}
                          strokeColor="var(--brand-primary)"
                          trailColor="var(--border-primary)"
                          showInfo={false}
                          size="small"
                        />
                      )}

                      {uploadStatus === "verifying" && (
                        <Progress
                          percent={100}
                          status="active"
                          strokeColor="var(--brand-primary)"
                          showInfo={false}
                          size="small"
                        />
                      )}
                    </div>
                  )}

                  <div className="w-full flex justify-center pt-4">
                    <Button
                      loading={isSubmitting || uploadStatus === "uploading" || uploadStatus === "verifying"}
                      type="primary"
                      size="large"
                      htmlType="submit"
                      disabled={uploadType === "youtube_api" && !youtubeConnected}
                      className="w-full bg-brand-primary! border-transparent! text-black! hover:opacity-90! font-semibold h-12 cursor-pointer disabled:opacity-45! disabled:cursor-not-allowed!"
                    >
                      Publish Content
                    </Button>
                  </div>
                </div>

                {/* Right Column: Video Preview */}
                <div className="lg:border-l lg:border-border-primary lg:pl-8">
                  {previewContent.url ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-medium text-primary-text mb-4">Video Preview</h4>
                        <VideoPlayer content={previewContent} />
                      </div>

                      {/* Video Metadata Preview */}
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-primary-text break-words">
                          {title || "Untitled Video"}
                        </h3>

                        {subscriptionTier && (
                          <div className="flex">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                              {subscriptionPlans?.data?.find((p: any) => p._id === subscriptionTier)?.name || "Premium Plan"}
                            </span>
                          </div>
                        )}

                        <div
                          className="no-tailwind text-base font-normal text-secondary-text break-words"
                          dangerouslySetInnerHTML={{
                            __html: description || "No description provided yet.",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-border-primary rounded-lg p-8 bg-primary-bg/50 min-h-[300px]">
                      <p className="text-muted-text text-center">
                        {uploadType === "youtube_link"
                          ? "Enter a valid YouTube URL to see the preview"
                          : "Select or drop a video file to see the preview"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Form>
          </ConfigProvider>
        </div>
      </SectionContainer>
    </RoleGuard>
  );
};

export default Page;

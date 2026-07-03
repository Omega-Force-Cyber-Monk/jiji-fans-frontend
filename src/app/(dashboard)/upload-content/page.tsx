"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
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
import { apiUrl } from "@/config";
import { getAccessToken } from "@/lib/auth/tokenUtils";
import { useAppSelector } from "@/redux/hook";

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

  const reduxToken = useAppSelector((state) => state.auth.token);
  const token = getAccessToken() || reduxToken;

  // Tab state: native, youtube_api, youtube_link
  const [uploadType, setUploadType] = useState<"native" | "youtube_api" | "youtube_link">("native");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "verifying" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watched form values (only title, tier, url — NOT description to avoid Editor loop)
  const videoUrl = Form.useWatch("url", form);
  const title = Form.useWatch("title", form);
  const subscriptionTier = Form.useWatch("subscriptionTier", form);

  const [isFetchingMetadata, setIsFetchingMetadata] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [editorContent, setEditorContent] = React.useState("");
  const [editorKey, setEditorKey] = React.useState(0);

  // Debounced preview state — only update after 500ms pause in typing
  const [previewTitle, setPreviewTitle] = React.useState("");
  const [previewDescription, setPreviewDescription] = React.useState("");
  const [previewTier, setPreviewTier] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setPreviewTitle(title || ""), 500);
    return () => clearTimeout(t);
  }, [title]);

  useEffect(() => {
    const t = setTimeout(() => setPreviewDescription(editorContent || ""), 500);
    return () => clearTimeout(t);
  }, [editorContent]);

  useEffect(() => {
    setPreviewTier(subscriptionTier);
  }, [subscriptionTier]);

  // API Hooks
  const [uploadContent, { isLoading: isSubmitting }] = useUploadContentMutation();
  const { data: subscriptionPlans, isLoading: isLoadingPlans, error: plansError } = useGetAllSubscriptionPlansQuery(undefined);
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetProfileQuery(undefined);
  const [triggerGetYouTubeAuthUrl, { isFetching: isFetchingAuthUrl }] = useLazyGetYouTubeAuthUrlQuery();
  const [createYouTubeUploadSession] = useCreateYouTubeUploadSessionMutation();
  const [saveYouTubeVideoId] = useSaveYouTubeVideoIdMutation();

  const user = profileData?.data;
  const youtubeConnected = user?.youtubeConnected;
  const youtubeChannelTitle = user?.youtubeTokens?.channelTitle || user?.youtubeChannelTitle || user?.youtubeChannelName;

  // Force profile refetch on mount to ensure we get the latest youtubeConnected state
  useEffect(() => {
    refetchProfile();
  }, [refetchProfile]);

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
              setEditorContent(`<p>${data.title}</p>`);
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
        window.location.href = url;
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
      // Backend resumable upload requires Content-Range header
      xhr.setRequestHeader("Content-Range", `bytes 0-${file.size - 1}/${file.size}`);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

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
            // Handle both flat and nested responses (e.g. responseData.id or responseData.data?.id or responseData.data?.youtubeVideoId)
            const videoId = responseData.youtubeVideoId || responseData.data?.youtubeVideoId || responseData.id || responseData.data?.id || responseData.data?._id;
            if (videoId) {
              resolve({
                url: `https://www.youtube.com/watch?v=${videoId}`,
                videoId,
              });
            } else {
              console.error("Video ID not found in YouTube response JSON:", responseData);
              reject(new Error("Video ID not found in YouTube response."));
            }
          } catch (err: any) {
            console.error("Failed to parse YouTube upload response JSON:", xhr.responseText, err);
            reject(new Error(`Failed to parse YouTube response: ${err?.message || "JSON parsing error"}. Raw: ${xhr.responseText || "Empty"}`));
          }
        } else {
          console.error("YouTube Upload Server Error Status:", xhr.status, "Response:", xhr.responseText);
          reject(new Error(`YouTube upload failed with status ${xhr.status}. Response: ${xhr.responseText || "No details"}`));
        }
      };

      xhr.onerror = (e) => {
        console.error("YouTube Upload XHR Network/CORS Error:", {
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
          errorEvent: e
        });
        reject(new Error(`Network/CORS error during YouTube upload (Status: ${xhr.status}, ReadyState: ${xhr.readyState}). Please check browser console for details.`));
      };
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
        setUploadProgress(0);
        setStatusMessage("Uploading video to secure storage...");

        const resource = await uploadResource(videoFile, {
          purpose: RESOURCE_PURPOSE.VIDEO,
          onProgress: (percent) => {
            setUploadProgress(percent);
          },
        });

        setUploadStatus("verifying");
        setStatusMessage("Verifying video on server...");

        const normalizedBase = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
        finalVideoUrl = `${normalizedBase}resources/${resource.resourceId}/content`;
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
          privacyStatus: "unlisted",
          origin: window.location.origin,
          fileSize: videoFile.size,
          mimeType: videoFile.type,
        }).unwrap();

        const uploadUrl = sessionRes.data.uploadUrl;
        setStatusMessage("Uploading video directly to YouTube...");

        const uploadResult = await uploadVideoToYouTube(uploadUrl, videoFile);
        finalVideoUrl = uploadResult.url;
        youtubeVideoId = uploadResult.videoId;
      }

      // 3. Finalize Content Creation
      if (uploadType === "native" && videoFile) {
        const fileSizeMB = videoFile.size / (1024 * 1024);
        // Base delay of 2.5 seconds, plus 1 second per 50MB (capped at 12 seconds max)
        const delayMs = Math.min(12000, 2500 + Math.floor(fileSizeMB / 50) * 1000);

        setUploadStatus("verifying");
        setStatusMessage(`Finalizing video sync with server (delaying ${delayMs / 1000}s for backend verification)...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

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
      setEditorContent("");
      setEditorKey((k) => k + 1); // force Editor remount so Quill is fresh

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

  // Memoized stable blob URL — only regenerates when videoFile actually changes
  const nativeVideoUrl = useMemo(() => {
    if (!videoFile) return "";
    const url = URL.createObjectURL(videoFile);
    return url;
  }, [videoFile]);

  // Stable preview content: video URL never changes unless the actual source changes
  const previewVideoUrl = uploadType === "youtube_link" ? videoUrl : nativeVideoUrl;
  const previewContent = {
    url: previewVideoUrl,
    title: previewTitle || "Video Preview",
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
                    <div className="w-full max-w-full overflow-hidden rounded-md border border-border-primary">
                      <Editor
                        key={editorKey}
                        value={editorContent}
                        onTextChange={(e) => {
                          const html = e.htmlValue || "";
                          setEditorContent(html);
                          form.setFieldsValue({ description: html });
                        }}
                        style={{ height: "320px" }}
                      />
                      <style>{`
										.ql-toolbar { background: var(--secondary-bg) !important; border-color: var(--border-primary) !important; }
										.ql-toolbar .ql-stroke { stroke: var(--primary-text) !important; }
										.ql-toolbar .ql-fill { fill: var(--primary-text) !important; }
										.ql-toolbar .ql-picker { color: var(--primary-text) !important; }
										.ql-toolbar .ql-picker-options { background: var(--secondary-bg) !important; border-color: var(--border-primary) !important; }
										.ql-container { border-color: var(--border-primary) !important; }
										.ql-editor { background: var(--secondary-bg) !important; color: var(--primary-text) !important; min-height: 320px; }
										.ql-editor.ql-blank::before { color: var(--muted-text) !important; }
										.p-editor-container .p-editor-content { border-color: var(--border-primary) !important; }
									`}</style>
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
                          {previewTitle || "Untitled Video"}
                        </h3>

                        {previewTier && (
                          <div className="flex">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                              {subscriptionPlans?.data?.find((p: any) => p._id === previewTier)?.name || "Premium Plan"}
                            </span>
                          </div>
                        )}

                        <div
                          className="no-tailwind text-base font-normal text-secondary-text break-words"
                          dangerouslySetInnerHTML={{
                            __html: previewDescription || "No description provided yet.",
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

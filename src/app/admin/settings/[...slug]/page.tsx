"use client";

import { Input, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import JoditEditor from "jodit-pro-react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "antd";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import {
  TInternalType,
  useCreateUtilityMutation,
  useGetUtilityQuery,
  useUpdateUtilityMutation,
} from "@/redux/features/settings/settings.api";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import { errorAlert } from "@/lib/alerts";

const INTERNAL_TYPES: TInternalType[] = ["about", "privacy", "terms"];

type TApiError = {
  status?: number;
  data?: {
    statusCode?: number;
    message?: string;
  };
};

const PAGE_META: Record<TInternalType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  about: { label: "About Us", icon: InformationCircleIcon },
  privacy: { label: "Privacy Policy", icon: ShieldCheckIcon },
  terms: { label: "Terms & Conditions", icon: DocumentTextIcon },
};

const Page = () => {
  const params = useParams<{ slug: string[] }>();
  const slug = params.slug || [];
  const router = useRouter();
  const editor = useRef(null);
  const internalType = slug[0] as TInternalType;
  const isValidType = INTERNAL_TYPES.includes(internalType);
  const isEditMode = slug[1] === "edit";

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading, isError, error } = useGetUtilityQuery(internalType, {
    skip: !isValidType,
  });
  const [createMutation, { isLoading: cLoading }] = useCreateUtilityMutation();
  const [mutation, { isLoading: uLoading }] = useUpdateUtilityMutation();

  const normalizedError = (error as TApiError | undefined) || {};
  const isNotFound =
    normalizedError?.status === 404 ||
    normalizedError?.data?.statusCode === 404 ||
    normalizedError?.data?.message?.toLowerCase?.().includes("not found");
  const displayError = isError && !isNotFound;
  const internalId = data?._id || data?.id;

  const meta = PAGE_META[internalType] || { label: "Settings", icon: DocumentTextIcon };
  const Icon = meta.icon;

  const getLabel = () => meta.label;

  const handleSave = async () => {
    try {
      const trimmedTitle = title.trim();
      const trimmedDescription = content.trim();

      if (!internalId && !trimmedTitle) {
        messageApi.open({ key: "settings-title-required", type: "warning", content: "Title is required.", duration: 3 });
        return;
      }
      if (!internalId && !trimmedDescription) {
        messageApi.open({ key: "settings-desc-required", type: "warning", content: "Description is required.", duration: 3 });
        return;
      }
      if (internalId && !trimmedTitle && !trimmedDescription) {
        messageApi.open({ key: "settings-content-required", type: "warning", content: "Provide at least title or description.", duration: 3 });
        return;
      }

      if (internalId) {
        const response = await mutation({
          internalId,
          body: {
            type: internalType,
            ...(trimmedTitle ? { title: trimmedTitle } : {}),
            ...(trimmedDescription ? { description: trimmedDescription } : {}),
          },
        }).unwrap();
        messageApi.open({ key: "settings-save", type: "success", content: response.message || "Updated successfully.", duration: 4 });
      } else {
        const response = await createMutation({
          type: internalType,
          title: trimmedTitle,
          description: trimmedDescription,
        }).unwrap();
        messageApi.open({ key: "settings-create", type: "success", content: response.message || "Created successfully.", duration: 4 });
      }

      router.push(`/admin/settings/${internalType}`);
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const editorConfig = {
    readonly: false,
    uploader: { url: "https://xdsoft.net/jodit/finder/?action=fileUpload" },
    filebrowser: { ajax: { url: "https://xdsoft.net/jodit/finder/" } },
    minHeight: 500,
    buttons: [
      "bold", "italic", "underline", "strikethrough",
      "link", "image", "undo", "redo",
      "align", "font", "fontsize",
      "table", "ul", "ol", "outdent", "indent",
    ],
  };

  useEffect(() => {
    if (internalType === "terms") {
      router.replace("/terms");
    } else if (internalType === "privacy") {
      router.replace("/privacy");
    } else if (internalType === "about") {
      router.replace("/terms");
    }
  }, [internalType, router]);

  useEffect(() => {
    if (!data) return;
    setContent(data.description || "");
    setTitle(data.title || "");
  }, [data]);

  if (!isValidType) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb
          items={[
            { title: "Admin", href: "/admin/home" },
            { title: "Settings", href: "/admin/settings" },
            { title: "Invalid Type" },
          ]}
        />
        <div className="bg-secondary-bg border border-border-primary rounded-lg p-12 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-base font-medium text-error">Invalid settings type specified.</p>
          <Button onClick={() => router.push("/admin/settings")}>Back to Settings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Settings", href: "/admin/settings" },
          { title: getLabel(), href: `/admin/settings/${internalType}` },
          ...(isEditMode ? [{ title: internalId ? "Edit" : "Create" }] : []),
        ]}
      />

      {/* Page Header */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-primary/10 rounded-md">
            <Icon className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary-text">
              {isEditMode ? (internalId ? "Edit" : "Create") + " — " : ""}{getLabel()}
            </h2>
            <p className="text-sm font-medium text-muted-text">
              {isEditMode
                ? internalId
                  ? "Update existing page content below"
                  : "Fill in the content to create this page"
                : "View and manage this page's content"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Button
              id={`settings-${internalType}-back-btn`}
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/admin/settings/${internalType}`)}
            >
              Discard
            </Button>
          ) : (
            <Button
              id={`settings-${internalType}-edit-btn`}
              onClick={() => router.push(`/admin/settings/${internalType}/edit`)}
              icon={internalId ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              type="primary"
            >
              {internalId ? "Edit Content" : "Create Content"}
            </Button>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
        {isEditMode ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-2" htmlFor={`settings-${internalType}-title`}>
                Page Title
              </label>
              <Input
                id={`settings-${internalType}-title`}
                size="large"
                placeholder="Enter page title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-text mb-2">
                Page Content
              </label>
              <JoditEditor
                ref={editor}
                value={content}
                config={editorConfig}
                tabIndex={1}
                onBlur={(newContent) => setContent(newContent)}
                onChange={() => {}}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                id={`settings-${internalType}-save-btn`}
                onClick={handleSave}
                loading={uLoading || cLoading}
                size="large"
                type="primary"
                className="min-w-[180px]"
              >
                {internalId ? "Save Changes" : "Create Page"}
              </Button>
            </div>
          </div>
        ) : (
          <LoaderWraperComp
            isError={displayError}
            isLoading={isLoading}
            error={error as unknown as Record<string, unknown>}
            dataEmpty={!data && !isNotFound}
            className="h-[50vh]"
          >
            {data ? (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary-text mb-4 pb-4 border-b border-border-primary">
                  {data.title}
                </h3>
                <div
                  className="no-tailwind prose prose-sm max-w-none text-primary-text"
                  dangerouslySetInnerHTML={{ __html: data.description || "" }}
                />
              </div>
            ) : (
              <div className="h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="p-4 bg-brand-primary/10 rounded-full">
                  <Icon className="w-8 h-8 text-brand-primary/60" />
                </div>
                <p className="text-base font-medium text-muted-text">No content yet.</p>
                <p className="text-sm font-medium text-muted-text">
                  Click <span className="font-semibold text-brand-primary">Create Content</span> to get started.
                </p>
              </div>
            )}
          </LoaderWraperComp>
        )}
      </div>
    </div>
  );
};

export default Page;

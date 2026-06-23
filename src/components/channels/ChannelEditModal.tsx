"use client";

import { Button, Form, Input, message, Upload } from "antd";
import TextArea from "antd/es/input/TextArea";
import { CameraIcon } from "@heroicons/react/24/outline";
import type { FormProps, UploadFile } from "antd";
import { useState, useEffect } from "react";
import GlobalModal from "@/components/GlobalModal";
import {
  TMyChannel,
  useEditChannelDetailsMutation,
  useEditChannelImageMutation,
} from "@/redux/features/channel/channel.api";
import { TUniObject } from "@/types";
import {
  extractFileFromUploadValue,
  RESOURCE_PURPOSE,
  uploadResource,
} from "@/lib/resources/uploadResource";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";

interface ChannelEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelData?: TMyChannel;
}

const ChannelEditModal = ({
  isOpen,
  onClose,
  channelData,
}: ChannelEditModalProps) => {
  const [editForm] = Form.useForm<TUniObject>();
  const [messageApi, contextHolder] = message.useMessage();
  const [avatarFile, setAvatarFile] = useState<UploadFile | null>(null);
  const [bannerFile, setBannerFile] = useState<UploadFile | null>(null);
  const [activeImageUpload, setActiveImageUpload] = useState<
    "avatar" | "banner" | null
  >(null);

  const [editChannelDetails, { isLoading: isEditingDetails }] =
    useEditChannelDetailsMutation();
  const [editChannelImage] = useEditChannelImageMutation();

  const handleClose = () => {
    editForm.resetFields();
    setAvatarFile(null);
    setBannerFile(null);
    setActiveImageUpload(null);
    onClose();
  };

  // Populate form whenever the modal opens
  useEffect(() => {
    if (isOpen && channelData) {
      editForm.setFieldsValue({
        name: channelData.name,
        description: channelData.description,
        about: channelData.about,
      });
    }
  }, [isOpen, channelData, editForm]);

  const handleImageUpload = async (type: "avatar" | "banner") => {
    if (!channelData?._id) {
      messageApi.error("Channel not found");
      return;
    }
    const file = type === "avatar" ? avatarFile : bannerFile;
    const browserFile = extractFileFromUploadValue(file);
    if (!browserFile) {
      messageApi.error("Please select an image first");
      return;
    }
    setActiveImageUpload(type);
    try {
      const uploadedResource = await uploadResource(browserFile, {
        purpose:
          type === "avatar"
            ? RESOURCE_PURPOSE.CHANNEL_AVATAR
            : RESOURCE_PURPOSE.CHANNEL_BANNER,
        targetId: channelData._id,
      });
      await editChannelImage({
        channelId: channelData._id,
        body: { type, resourceId: uploadedResource.resourceId },
      }).unwrap();
      messageApi.success(
        `${type === "avatar" ? "Avatar" : "Banner"} updated successfully!`,
      );
      if (type === "avatar") setAvatarFile(null);
      else setBannerFile(null);
    } catch (error) {
      errorAlert({ error: error as TResError, messageApi });
    } finally {
      setActiveImageUpload(null);
    }
  };

  const onEditFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      await editChannelDetails({
        channelId: channelData?._id,
        body: {
          name: values.name,
          description: values.description,
          about: values.about,
        },
      }).unwrap();
      messageApi.open({
        key: "editChannel",
        type: "success",
        content: "Channel updated successfully!",
        duration: 3,
      });
      handleClose();
    } catch (error) {
      applyApiErrorToForm(error, editForm, ["name", "description", "about"]);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  return (
    <GlobalModal
      isModalOpen={isOpen}
      setIsModalOpen={(open) => { if (!open) handleClose(); }}
      onClose={handleClose}
      maxWidth="820px"
    >
      {contextHolder}
      <div className="w-full space-y-5">
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onEditFinish}
          requiredMark={false}
        >
          <div className="grid gap-5">
            {/* Basic Details */}
            <div className="rounded-lg border border-brand-primary/10 bg-primary-bg p-6 shadow-sm">
              <div className="mb-5 space-y-1.5">
                <h2 className="text-base font-semibold tracking-tight text-primary-text">
                  Basic details
                </h2>
                <p className="text-sm leading-6 text-secondary-text">
                  These fields define how your channel appears in search and on
                  your public page.
                </p>
              </div>
              <div className="grid gap-5">
                <Form.Item
                  label="Channel Name"
                  name="name"
                  rules={[
                    { required: true, message: "Channel name is required!" },
                    { min: 3, message: "Channel name should be at least 3 characters." },
                  ]}
                  help="Use a clear, recognizable name that matches your brand."
                >
                  <Input
                    size="large"
                    placeholder="Enter channel name"
                    maxLength={100}
                    className="!h-11"
                  />
                </Form.Item>

                <Form.Item
                  label="Short Description"
                  name="description"
                  help="A short summary that appears in cards and previews."
                >
                  <TextArea
                    showCount
                    rows={3}
                    maxLength={500}
                    placeholder="Brief description of your channel..."
                  />
                </Form.Item>

                <Form.Item
                  label="About"
                  name="about"
                  help="Tell viewers what to expect, your posting style, and value."
                >
                  <TextArea
                    showCount
                    rows={7}
                    maxLength={1500}
                    placeholder="Tell viewers about your channel..."
                  />
                </Form.Item>
              </div>
            </div>

            {/* Brand Assets */}
            <div className="rounded-lg border border-brand-primary/10 bg-primary-bg p-6 shadow-sm">
              <div className="mb-5 space-y-1.5">
                <h2 className="text-base font-semibold tracking-tight text-primary-text">
                  Brand assets
                </h2>
                <p className="text-sm leading-6 text-secondary-text">
                  Update your avatar and banner independently. Uploaded files
                  are previewed before submission.
                </p>
              </div>

              <div className="grid gap-5">
                {/* Avatar Upload */}
                <div className="rounded-md border border-brand-primary/10 bg-secondary-bg p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div>
                        <p className="font-semibold tracking-tight text-primary-text">
                          Channel Avatar
                        </p>
                        <p className="text-sm leading-6 text-secondary-text">
                          Square image works best. Choose a file first, then upload it.
                        </p>
                      </div>
                      <div className="min-h-5">
                        {avatarFile?.name && (
                          <p className="text-xs text-muted-text">
                            Selected: {avatarFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <Upload
                        maxCount={1}
                        accept="image/*"
                        beforeUpload={() => false}
                        showUploadList={false}
                        onChange={(info) =>
                          setAvatarFile(info.fileList[0] || null)
                        }
                        fileList={avatarFile ? [avatarFile] : []}
                      >
                        <Button icon={<CameraIcon className="w-4 h-4" />} className="min-w-32">
                          Choose avatar
                        </Button>
                      </Upload>
                      {avatarFile && (
                        <Button
                          type="primary"
                          loading={activeImageUpload === "avatar"}
                          className="min-w-32"
                          onClick={() => handleImageUpload("avatar")}
                        >
                          Upload avatar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="rounded-md border border-brand-primary/10 bg-secondary-bg p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div>
                        <p className="font-semibold tracking-tight text-primary-text">
                          Channel Banner
                        </p>
                        <p className="text-sm leading-6 text-secondary-text">
                          Use a wide image with clean composition for desktop and mobile.
                        </p>
                      </div>
                      <div className="min-h-5">
                        {bannerFile?.name && (
                          <p className="text-xs text-muted-text">
                            Selected: {bannerFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <Upload
                        maxCount={1}
                        accept="image/*"
                        beforeUpload={() => false}
                        showUploadList={false}
                        onChange={(info) =>
                          setBannerFile(info.fileList[0] || null)
                        }
                        fileList={bannerFile ? [bannerFile] : []}
                      >
                        <Button icon={<CameraIcon className="w-4 h-4" />} className="min-w-32">
                          Choose banner
                        </Button>
                      </Upload>
                      {bannerFile && (
                        <Button
                          type="primary"
                          loading={activeImageUpload === "banner"}
                          className="min-w-32"
                          onClick={() => handleImageUpload("banner")}
                        >
                          Upload banner
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 mt-5 flex flex-col gap-3 rounded-lg border border-border-primary bg-primary-bg/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            <Button
              onClick={handleClose}
              type="text"
              color="danger"
              variant="filled"
              className="sm:min-w-32"
            >
              Discard
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              className="sm:min-w-44 font-medium"
              loading={isEditingDetails}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </GlobalModal>
  );
};

export default ChannelEditModal;

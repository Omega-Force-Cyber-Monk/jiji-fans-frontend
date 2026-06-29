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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const file = extractFileFromUploadValue(avatarFile);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }
    const file = extractFileFromUploadValue(bannerFile);
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [bannerFile]);

  const [isSaving, setIsSaving] = useState(false);

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

  const onEditFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    if (!channelData?._id) return;
    setIsSaving(true);
    const key = "saveChannel";
    messageApi.open({
      key,
      type: "loading",
      content: "Saving channel updates...",
    });

    try {
      // 1. Save text details if changed
      const hasDetailsChanged =
        values.name !== channelData.name ||
        values.description !== channelData.description ||
        values.about !== channelData.about;

      if (hasDetailsChanged) {
        await editChannelDetails({
          channelId: channelData._id,
          body: {
            name: values.name,
            description: values.description,
            about: values.about,
          },
        }).unwrap();
      }

      // 2. Upload avatar if selected (Multipart Form Data)
      if (avatarFile) {
        const fileObj = extractFileFromUploadValue(avatarFile);
        if (fileObj) {
          const formData = new FormData();
          formData.append("image", fileObj);
          formData.append("type", "avatar");
          await editChannelImage({
            channelId: channelData._id,
            body: formData,
          }).unwrap();
        }
      }

      // 3. Upload banner if selected (Multipart Form Data)
      if (bannerFile) {
        const fileObj = extractFileFromUploadValue(bannerFile);
        if (fileObj) {
          const formData = new FormData();
          formData.append("image", fileObj);
          formData.append("type", "banner");
          await editChannelImage({
            channelId: channelData._id,
            body: formData,
          }).unwrap();
        }
      }

      messageApi.open({
        key,
        type: "success",
        content: "Channel updated successfully!",
        duration: 3,
      });
      handleClose();
    } catch (error) {
      applyApiErrorToForm(error, editForm, ["name", "description", "about"]);
      errorAlert({ error: error as TResError, messageApi });
      messageApi.destroy(key);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlobalModal
      isModalOpen={isOpen}
      setIsModalOpen={(open) => { if (!open) handleClose(); }}
      onClose={handleClose}
      maxWidth="1100px"
    >
      {contextHolder}
      <div className="w-full space-y-5 lg:h-[80vh] flex flex-col">
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onEditFinish}
          requiredMark={false}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start flex-1 overflow-y-auto pr-1 lg:pr-3 pb-4">
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
                  help={<span className="text-secondary-text text-xs block mt-1">Use a clear, recognizable name that matches your brand.</span>}
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
                  help={<span className="text-secondary-text text-xs block mt-1">A short summary that appears in cards and previews.</span>}
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
                  help={<span className="text-secondary-text text-xs block mt-1">Tell viewers what to expect, your posting style, and value.</span>}
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
                  <div className="flex flex-col gap-4">
                    {/* Header: Preview + Info */}
                    <div className="flex items-center gap-4">
                      {(avatarPreview || channelData?.avatar) && (
                        <div className="relative size-16 rounded-full overflow-hidden border border-border-primary shrink-0 bg-primary-bg">
                          <img
                            src={avatarPreview || channelData?.avatar}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold tracking-tight text-primary-text">
                          Channel Avatar
                        </p>
                        <p className="text-xs leading-relaxed text-secondary-text">
                          Square image works best. Choose a file first, then upload it.
                        </p>
                        {avatarFile?.name && (
                          <p className="text-xs text-muted-text mt-1 truncate">
                            Selected: {avatarFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Actions: Upload Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-primary/10">
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
                        <Button icon={<CameraIcon className="w-4 h-4" />} className="min-w-[140px]">
                          Choose avatar
                        </Button>
                      </Upload>
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="rounded-md border border-brand-primary/10 bg-secondary-bg p-5">
                  <div className="flex flex-col gap-4">
                    {(bannerPreview || channelData?.banner) && (
                      <div className="relative w-full h-24 rounded-md overflow-hidden border border-border-primary shrink-0 bg-primary-bg">
                        <img
                          src={bannerPreview || channelData?.banner}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold tracking-tight text-primary-text">
                          Channel Banner
                        </p>
                        <p className="text-xs leading-relaxed text-secondary-text">
                          Use a wide image with clean composition for desktop and mobile.
                        </p>
                        {bannerFile?.name && (
                          <p className="text-xs text-muted-text mt-1 truncate">
                            Selected: {bannerFile.name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-primary/10">
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
                          <Button icon={<CameraIcon className="w-4 h-4" />} className="min-w-[140px]">
                            Choose banner
                          </Button>
                        </Upload>
                      </div>
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
              loading={isSaving || isEditingDetails}
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

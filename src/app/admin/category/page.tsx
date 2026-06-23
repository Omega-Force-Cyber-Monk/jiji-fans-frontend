"use client";

import GlobalModal from "@/components/GlobalModal";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { applyApiErrorToForm, errorAlert, TResError } from "@/lib/alerts";
import { TUniObject } from "@/types";
import { CloudArrowUpIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Form, FormProps, Input, message, Upload, Modal } from "antd";
import { UploadChangeParam } from "antd/es/upload/interface";
import React, { useState, useCallback, useRef } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/features/category/category.api";
import { TCategory } from "@/redux/features/category/category.api";
import { InfiniteCategoryList } from "@/components/categories";
import { InfiniteCategoryListRef } from "@/components/categories/InfiniteCategoryList";
import {
  extractFileFromUploadValue,
  RESOURCE_PURPOSE,
  uploadResource,
} from "@/lib/resources/uploadResource";

const Page = () => {
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState<{
    data?: TCategory;
    type: "create" | "edit";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const listRef = useRef<InfiniteCategoryListRef>(null);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [deleteModalData, setDeleteModalData] = useState<{ id: string; name: string } | null>(null);
  const [modal, modalContextHolder] = Modal.useModal();

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      const iconFile = extractFileFromUploadValue(values.icon);
      setIsSubmittingUpload(true);

      if (modalData?.type === "create") {
        if (!iconFile) {
          messageApi.open({ key: "category", type: "error", content: "Please upload a category icon!", duration: 3 });
          return;
        }
        const uploadedResource = await uploadResource(iconFile, { purpose: RESOURCE_PURPOSE.CATEGORY_ICON });
        console.log(uploadedResource, "uploadedResource");

        // Wait 3 seconds for S3/backend sync before creating
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const res = await createCategory({ name: values.name, iconResourceId: uploadedResource.resourceId }).unwrap();
        messageApi.success("Category created successfully!");
        if (res.data) {
          listRef.current?.addCategory(res.data);
        } else {
          handleRefresh();
        }
      } else if (modalData?.type === "edit" && modalData.data) {
        const payload: { name: string; iconResourceId?: string } = { name: values.name };
        if (iconFile) {
          const uploadedResource = await uploadResource(iconFile, {
            purpose: RESOURCE_PURPOSE.CATEGORY_ICON,
            targetId: modalData.data._id,
          });
          payload.iconResourceId = uploadedResource.resourceId;

          // Wait 3 seconds for S3/backend sync before updating
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        const res = await updateCategory({ categoryId: modalData.data._id, body: payload }).unwrap();
        messageApi.success("Category updated successfully!");
        if (res.data) {
          listRef.current?.updateCategory(res.data);
        } else {
          handleRefresh();
        }
      }
      form.resetFields();
      setOpenModal(false);
    } catch (error) {
      applyApiErrorToForm(error, form, ["name", "iconResourceId"], { iconResourceId: ["icon"] });
      errorAlert({ error: error as TResError, messageApi });
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    setDeleteModalData({ id: categoryId, name: categoryName });
  };

  const confirmDelete = async () => {
    if (!deleteModalData) return;
    try {
      await deleteCategory(deleteModalData.id).unwrap();
      messageApi.success(`"${deleteModalData.name}" deleted successfully!`);
      listRef.current?.removeCategory(deleteModalData.id);
      setDeleteModalData(null);
    } catch (error) {
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  const showModal = (type: "create" | "edit", data?: TCategory) => {
    setModalData({ data, type });
    if (type === "edit" && data) {
      form.setFieldsValue({
        name: data.name,
        icon: data.icon
          ? [
            {
              uid: "-1",
              name: "Current Icon",
              status: "done",
              url: data.icon,
            },
          ]
          : [],
      });
    } else {
      form.resetFields();
    }
    setOpenModal(true);
  };

  const onClose = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const isEdit = modalData?.type === "edit";

  return (
    <div className="space-y-6">
      {contextHolder}
      {modalContextHolder}

      {/* Breadcrumb */}
      <AppBreadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Categories" },
        ]}
        className="mb-6!"
      />

      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <Input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-muted-text mr-1" />}
            size="large"
            allowClear
            className="h-10!"
          />
        </div>

        {/* Add button */}
        <button
          id="category-add-btn"
          onClick={() => showModal("create")}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-5 py-2.5 rounded-md transition-colors shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
        <InfiniteCategoryList
          ref={listRef}
          onEdit={(cat) => showModal("edit", cat)}
          onDelete={handleDelete}
          searchQuery={searchQuery}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Create / Edit Modal */}
      <GlobalModal
        isModalOpen={openModal}
        setIsModalOpen={setOpenModal}
        onClose={onClose}
        maxWidth="460px"
      >
        <div className="p-4">
          {/* Modal Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-primary-text">
              {isEdit ? "Edit Category" : "New Category"}
            </h3>
            <p className="text-sm font-medium text-muted-text mt-1">
              {isEdit
                ? `Update details for "${modalData?.data?.name}"`
                : "Fill in the details to create a new category."}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            {/* Name */}
            <Form.Item
              name="name"
              label={<span className="text-sm font-medium text-secondary-text">Category Name</span>}
              rules={[{ required: true, message: "Category name is required" }]}
            >
              <Input
                id="category-name-input"
                size="large"
                placeholder="e.g. Technology, Health…"
              />
            </Form.Item>

            {/* Icon */}
            <Form.Item
              name="icon"
              label={
                <span className="text-sm font-medium text-secondary-text">
                  Icon {isEdit && <span className="text-muted-text font-normal">(leave empty to keep existing)</span>}
                </span>
              }
              rules={[{ required: !isEdit, message: "Please upload a category icon" }]}
              valuePropName="fileList"
              getValueFromEvent={(e: UploadChangeParam) => e?.fileList || []}
            >
              <Upload
                listType="picture"
                maxCount={1}
                accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
                beforeUpload={(file) => {
                  const isValidType = [
                    "image/png",
                    "image/jpeg",
                    "image/gif",
                    "image/webp",
                    "image/svg+xml",
                  ].includes(file.type);
                  if (!isValidType) {
                    messageApi.error("You can only upload PNG, JPG/JPEG, GIF, WEBP, or SVG files!");
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                className="w-full"
              >
                <button
                  type="button"
                  id="category-upload-icon-btn"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border-primary bg-primary-bg rounded-md hover:border-brand-primary hover:bg-brand-primary/5 text-sm font-medium text-secondary-text hover:text-brand-primary transition-all"
                >
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Upload Icon
                </button>
              </Upload>
            </Form.Item>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                id="category-modal-cancel-btn"
                block
                onClick={onClose}
                style={{ height: 44 }}
              >
                Cancel
              </Button>
              <Button
                id="category-modal-submit-btn"
                htmlType="submit"
                type="primary"
                block
                loading={isCreating || isUpdating || isSubmittingUpload}
                style={{ height: 44 }}
              >
                {isEdit ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </Form>
        </div>
      </GlobalModal>
      {/* Delete Confirmation Modal */}
      <GlobalModal
        isModalOpen={!!deleteModalData}
        setIsModalOpen={(open) => !open && setDeleteModalData(null)}
        maxWidth="400px"
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-error/10 text-error rounded-2xl flex items-center justify-center mb-4">
            <TrashIcon className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-semibold text-primary-text mb-2">Delete</h3>
          <p className="text-base text-muted-text mb-8">
            Are you sure you want to delete <span className="font-semibold text-primary-text">{deleteModalData?.name}</span>?
          </p>
          <div className="flex items-center justify-center gap-4 w-full">
            <Button
              className="flex-1 h-11 bg-secondary-bg hover:bg-border-primary border-transparent hover:border-transparent text-primary-text font-medium rounded-lg"
              onClick={() => setDeleteModalData(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              className="flex-1 h-11 bg-error hover:bg-error/90 font-medium rounded-lg"
              onClick={confirmDelete}
              loading={isDeleting}
            >
              Confirm
            </Button>
          </div>
        </div>
      </GlobalModal>
    </div>
  );
};

export default Page;

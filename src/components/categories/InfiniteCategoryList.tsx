import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useLazyGetAllCategoriesQuery, TCategory, CategoryResponse } from "@/redux/features/category/category.api";
import CategoryCard from "./CategoryCard";
import { CategoryListSkeleton } from "./CategorySkeleton";
import { Empty, Button, message, Pagination, ConfigProvider } from "antd";
import { ArrowPathIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { errorAlert, TResError } from "@/lib/alerts";

interface InfiniteCategoryListProps {
  onEdit: (category: TCategory) => void;
  onDelete: (id: string, name: string) => void;
  searchQuery?: string;
  refreshTrigger?: number;
}

export interface InfiniteCategoryListRef {
  addCategory: (category: TCategory) => void;
  updateCategory: (category: TCategory) => void;
  removeCategory: (categoryId: string) => void;
}

const InfiniteCategoryList = forwardRef<InfiniteCategoryListRef, InfiniteCategoryListProps>(({
  onEdit,
  onDelete,
  searchQuery = "",
  refreshTrigger = 0,
}, ref) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [pagination, setPagination] = useState<CategoryResponse["data"]["pagination"] | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [triggerGetCategories] = useLazyGetAllCategoriesQuery();

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    addCategory: (category: TCategory) => {
      setCategories((prev) => [category, ...prev]);
    },
    updateCategory: (category: TCategory) => {
      setCategories((prev) =>
        prev.map((cat) => (cat._id === category._id ? category : cat))
      );
    },
    removeCategory: (categoryId: string) => {
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
    },
  }));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch page data
  useEffect(() => {
    let isMounted = true;

    const fetchPage = async () => {
      setIsInitialLoading(true);
      setHasError(false);
      try {
        const response = await triggerGetCategories({
          limit: 8,
          page: currentPage,
          ...(searchQuery ? { search: searchQuery } : {}),
        }).unwrap();

        if (!isMounted) return;

        if (response.data) {
          setCategories(response.data.categories);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        if (!isMounted) return;
        setHasError(true);
        errorAlert({ error: error as TResError, messageApi });
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchQuery, refreshTrigger, triggerGetCategories, messageApi]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleRetry = () => {
    setCurrentPage(1);
  };

  if (isInitialLoading) {
    return <CategoryListSkeleton count={8} />;
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <ExclamationCircleIcon className="w-10 h-10 text-error mb-3" />
        <p className="text-base font-semibold text-primary-text mb-1">Failed to load categories</p>
        <p className="text-sm font-medium text-muted-text mb-6 max-w-xs">
          There was an error fetching the data. Please check your connection and try again.
        </p>
        <Button
          type="primary"
          icon={<ArrowPathIcon className="w-4 h-4" />}
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-16">
        <Empty
          description={
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-primary-text">No categories found</span>
              <span className="text-sm font-medium text-muted-text">Try adjusting your search or add a new category.</span>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {contextHolder}
      <ul className="list-none p-0 m-0">
        {categories.map((category, index) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            index={index}
          />
        ))}
      </ul>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex w-full justify-end p-6 border-t border-border-primary bg-primary-bg">
          <ConfigProvider
            theme={{
              token: {
                colorText: "var(--primary-text)",
                colorBgContainer: "var(--primary-bg)",
                colorBorder: "var(--border-primary)",
                colorPrimary: "var(--brand-primary)",
                colorTextDisabled: "var(--muted-text)",
                borderRadius: 6,
              },
              components: {
                Pagination: {
                  itemActiveBg: "var(--brand-primary)",
                  itemActiveColor: "#ffffff",
                  itemBg: "var(--secondary-bg)",
                  itemLinkBg: "var(--secondary-bg)",
                },
              },
            }}
          >
            <Pagination
              align="center"
              showQuickJumper={false}
              showSizeChanger={false}
              total={pagination.total || 1}
              current={currentPage}
              defaultCurrent={1}
              onChange={(page) => setCurrentPage(page)}
              pageSize={pagination.limit || 8}
            />
          </ConfigProvider>
        </div>
      )}
    </div>
  );
});

InfiniteCategoryList.displayName = "InfiniteCategoryList";

export default InfiniteCategoryList;

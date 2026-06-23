"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Grid } from "antd";
import Image from "@/components/ui/CImage";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { gsap } from "gsap";
import { useParams } from "next/navigation";
import SliderNavigation from "../ui/SliderNavigation";

interface CategoryItemProps {
  item: {
    _id: string;
    name: string;
    icon?: string;
  };
  isSelected: boolean;
}

const CategoryItem = ({ item, isSelected }: CategoryItemProps) => {
  const [imageError, setImageError] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ringRef.current) {
      // Continuous rotation animation
      gsap.to(ringRef.current, {
        rotation: 360,
        duration: 2.5,
        repeat: -1,
        ease: "linear",
      });
    }
  }, []);

  return (
    <Link
      href={`/overview/${item._id}`}
      key={item._id}
      className="text-center space-y-1.5 shrink-0 block group"
    >
      <div className="relative max-w-[70px] sm:max-w-[85px] mx-auto">
        {/* Rotating ring for selected state */}
        <div
          ref={ringRef}
          className={cn(
            "absolute -inset-1 rounded-full transition-opacity duration-500",
            isSelected ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          style={{
            background:
              "conic-gradient(from 0deg, #10b981 0%, #34d399 25%, #6ee7b7 50%, #34d399 75%, #10b981 100%)",
            filter: "blur(1.5px)",
            boxShadow:
              "0 0 16px rgba(16, 185, 129, 0.5), 0 0 28px rgba(16, 185, 129, 0.25)",
          }}
        />

        <div
          ref={itemRef}
          className="relative overflow-hidden rounded-full aspect-square bg-secondary-bg hover:shadow-md transition-shadow duration-300 border border-border-primary"
        >
          {item.icon && !imageError ? (
            <Image
              src={item.icon}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-2xl font-bold text-gray-400">
                {item.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="font-medium text-sm truncate text-primary-text group-hover:text-brand-primary transition-colors">{item.name}</p>
    </Link>
  );
};

const Categories = () => {
  const screens = Grid.useBreakpoint();
  const params = useParams();
  const selectedCategoryId = params?.slug as string | undefined;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: categoriesData, isLoading } = useGetAllCategoriesQuery({
    limit: 8,
    page: currentPage,
  });

  const categories = useMemo(() => categoriesData?.data?.categories || [], [categoriesData]);
  const pagination = categoriesData?.data?.pagination;

  useEffect(() => {
    if (
      !isLoading &&
      categories.length > 0 &&
      categoryRefs.current.length > 0
    ) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          categoryRefs.current.filter(Boolean),
          {
            opacity: 0,
            y: 30,
            scale: 0.8,
            rotateX: -15,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.4)",
            clearProps: "transform",
          },
        );
      }, gridRef);

      return () => ctx.revert();
    }
  }, [categories, isLoading]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      gsap.to(categoryRefs.current.filter(Boolean), {
        opacity: 0,
        x: -50,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          setCurrentPage((prev) => prev + 1);
        },
      });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      gsap.to(categoryRefs.current.filter(Boolean), {
        opacity: 0,
        x: 50,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          setCurrentPage((prev) => prev - 1);
        },
      });
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold leading-0 text-primary-text">
            Categories
          </h1>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 xxl:grid-cols-10 gap-3 sm:gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="text-center space-y-1.5"
              style={{
                display: i >= 5 && !screens.sm ? "none" : "block",
              }}
            >
              <div className="relative overflow-hidden rounded-full aspect-square bg-secondary-bg animate-pulse max-w-[70px] sm:max-w-[85px] mx-auto" />
              <div className="h-4 bg-secondary-bg/50 rounded animate-pulse w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="pb-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold leading-0 text-primary-text">
          Categories
        </h1>
        <SliderNavigation
          onPrev={handlePreviousPage}
          onNext={handleNextPage}
          prevDisabled={currentPage === 1 || isLoading}
          nextDisabled={!pagination || currentPage >= pagination.totalPages || isLoading}
          size="sm"
        />
      </div>
      <div
        ref={gridRef}
        className={cn("grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4", {
          "lg:grid-cols-8": screens.lg,
          "xxl:grid-cols-10": screens.xxl,
        })}
      >
        {categories?.map((item, index) => (
          <div
            key={item._id}
            ref={(el) => {
              categoryRefs.current[index] = el;
            }}
          >
            <CategoryItem
              item={item}
              isSelected={selectedCategoryId === item._id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;

"use client";

import React from "react";
import Image from "@/components/ui/CImage";
import { TCategory } from "@/redux/features/category/category.api";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CategoryCardProps {
  category: TCategory;
  onEdit: (category: TCategory) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  index?: number;
}

const CategoryCard = ({
  category,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
  index = 0,
}: CategoryCardProps) => {

  console.log(category, "category")
  return (
    <li
      className="flex items-center justify-between px-5 py-4 border-b border-border-primary last:border-b-0 hover:bg-primary-bg transition-colors duration-150 group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar / Icon */}
        <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-border-primary bg-brand-primary/10 flex items-center justify-center">
          {category.icon ? (
            <Image
              src={category.icon}
              alt={category.name}
              className="w-full h-full object-cover"
              width={40}
              height={40}
            />
          ) : (
            <span className="text-base font-semibold text-brand-primary">
              {category.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + ID */}
        <div className="min-w-0">
          <p className="text-base font-medium text-primary-text truncate">
            {category.name}
          </p>
          <p className="text-sm font-medium text-muted-text">
            ID: {category._id.slice(-6)}
          </p>
        </div>
      </div>

      {/* Right: actions — always visible but subtle, become prominent on hover */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <button
          id={`category-edit-${category._id}`}
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
          disabled={isUpdating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-md transition-colors disabled:opacity-50"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" />
          Edit
        </button>

        <button
          id={`category-delete-${category._id}`}
          onClick={() => onDelete(category._id, category.name)}
          aria-label={`Delete ${category.name}`}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-error bg-error/10 hover:bg-error/20 rounded-md transition-colors disabled:opacity-50"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </li>
  );
};

export default CategoryCard;

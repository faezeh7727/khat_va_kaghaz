"use client";

/** @format */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  PencilIcon,
  PencilSquareIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const categoryIcons = {
  stories: BookOpenIcon,
  "book-review": ChatBubbleLeftRightIcon,
  articles: DocumentTextIcon,
  "writing-workshop": PencilSquareIcon,
  poetry: PencilIcon,
  "classic-literature": BuildingLibraryIcon,
  "modern-literature": AcademicCapIcon,
};

export default function CategoryItem({ category }) {
  const isAll = category.slug === "__all__";
  const CategoryIcon = isAll ? Squares2X2Icon : categoryIcons[category.slug] || BookOpenIcon;
  const pathname = usePathname();
  const href = isAll ? "/blogs" : `/blogs/category/${category.slug}`;
  const isActive = isAll
    ? pathname === "/blogs"
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li className="shrink-0 lg:w-full">
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`category-floating-badge category-capsule-item min-h-11 gap-2 px-3.5 text-sm lg:w-full lg:justify-start${isActive ? " is-active" : ""}${isAll ? " is-all" : ""}`}
      >
        <span className="category-floating-badge-icon category-capsule-icon grid h-8 w-8 shrink-0 place-items-center rounded-full">
          <CategoryIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="category-capsule-label">{category.title}</span>
        <ChevronLeftIcon
          className="category-capsule-arrow hidden h-4 w-4 shrink-0 lg:block"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

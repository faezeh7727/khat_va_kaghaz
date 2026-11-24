/** @format */

"use client";

import Image from "next/image";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/context/ThemeContext";
import { BookmarkAction } from "./postinteraction";

export default function Coverimage({
  title,
  slug,
  coverImageUrl,
  category,
  readingTime,
  postId,
  isBookmarked,
  showBookmark = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 320px",
  className = "",
}) {
  const { theme, isReady } = useTheme();
  const activeTheme = isReady && theme === "dark" ? "dark" : "light";
  const src =
    coverImageUrl?.[activeTheme] ||
    coverImageUrl?.light ||
    `/blog-covers/${slug}-${activeTheme}.webp`;
  const isRemoteImage = /^https?:\/\//i.test(src);

  return (
    <div className={`post-card-cover ${className}`.trim()} data-post-slug={slug}>
      <Image
        src={src}
        alt={title}
        fill
        sizes={sizes}
        className="post-card-cover-image"
        unoptimized={isRemoteImage}
      />
      <div
        className={`post-card-cover-top${showBookmark ? " has-post-actions" : ""}`}
      >
        {category && (
          <span className="post-card-cover-category">{category}</span>
        )}
        {showBookmark && (
          <BookmarkAction postId={postId} isBookmarked={isBookmarked} />
        )}
      </div>
      {readingTime ?
        <span className="post-card-cover-reading-time">
          <ClockIcon aria-hidden="true" />
          {Number(readingTime).toLocaleString("fa-IR")} دقیقه مطالعه
        </span>
      : null}
    </div>
  );
}

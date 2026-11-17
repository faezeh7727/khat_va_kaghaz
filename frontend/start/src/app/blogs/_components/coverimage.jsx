/** @format */

"use client";

import Image from "next/image";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/context/ThemeContext";
import { BookmarkAction } from "./postinteraction";

export default function Coverimage({
  title,
  slug,
  category,
  readingTime,
  postId,
  isBookmarked,
  showBookmark = false,
}) {
  const { theme, isReady } = useTheme();
  const activeTheme = isReady && theme === "dark" ? "dark" : "light";
  const src = `/blog-covers/${slug}-${activeTheme}.webp`;

  return (
    <div className="post-card-cover" data-post-slug={slug}>
      <Image
        src={src}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 320px"
        className="post-card-cover-image"
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

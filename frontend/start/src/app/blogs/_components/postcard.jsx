/** @format */

import Link from "next/link";
import { ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import Author from "./author";
import PostInteraction from "./postinteraction";
import Coverimage from "./coverimage";

export default function PostCard({
  title,
  slug,
  _id,
  category,
  briefText,
  readingTime,
  type,
  author,
  homeCard = false,
  showBrief = true,
  showInteractions = false,
  isLiked = false,
  likesCount = 0,
  commentsCount = 0,
  isBookmarked = false,
}) {
  return (
    <li className={`post-card${homeCard ? " home-post-card" : ""}`}>
      <Coverimage
        title={title}
        slug={slug}
        category={category?.title}
        readingTime={readingTime}
        postId={_id}
        isBookmarked={isBookmarked}
        showBookmark={showInteractions}
      />

      <div className="post-card-content">
        <div>
          <div className="post-card-meta">
            {category?.title && (
              <span className="post-card-category">{category.title}</span>
            )}
            {readingTime && (
              <span className="post-card-reading-time">
                <ClockIcon aria-hidden="true" />
                {readingTime} دقیقه مطالعه
              </span>
            )}
          </div>
          {type === "premium" && (
            <span className="post-card-premium">ویژه</span>
          )}
          <h2 className="post-card-title">{title}</h2>
          {showInteractions && homeCard && (
            <PostInteraction
              postId={_id}
              slug={slug}
              isLiked={isLiked}
              likesCount={likesCount}
              commentsCount={commentsCount}
              className="post-interactions-under-title"
            />
          )}
          {showBrief && briefText && (
            <p className="post-card-brief">{briefText}</p>
          )}
          {showInteractions && !homeCard && (
            <PostInteraction
              postId={_id}
              slug={slug}
              isLiked={isLiked}
              likesCount={likesCount}
              commentsCount={commentsCount}
              className="post-interactions-under-copy"
            />
          )}
        </div>

        <div className="post-card-footer">
          {author?.name && <Author author={author} />}
          <Link
            className="post-card-read-link btn-outline-secondary"
            href={`/blogs/${slug}`}
          >
            مطالعه کامل
            <ArrowLeftIcon aria-hidden="true" />
          </Link>
        </div>
      </div>
    </li>
  );
}

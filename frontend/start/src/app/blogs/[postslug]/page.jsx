/** @format */

import { notFound } from "next/navigation";
import { Fragment } from "react";
import Author from "../_components/author";
import PostInteraction, { BookmarkAction, SharePostAction } from "../_components/postinteraction";
import PostReadTracker from "../_components/postreadtracker";
import Coverimage from "../_components/coverimage";
import numberFormatter from "@/utils/numberformater";
import { getPostBySlug } from "@/services/postservices";
import { ClockIcon } from "@heroicons/react/24/outline";
import PostComments from "../_components/PostComments";

const publicationDateFormat = new Intl.DateTimeFormat("fa-IR", {
  calendar: "persian",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { postslug } = await params;
  const post = await getPostBySlug(postslug);

  return {
    title: post?.title || "نوشته",
  };
}

export default async function BlogPostPage({ params }) {
  const { postslug } = await params;
  const post = await getPostBySlug(postslug);
  if (!post) notFound();
  const paragraphs = String(post.text || "").split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
  const coverInsight = String(post.keyPoint || post.briefText || paragraphs[0] || post.title)
    .split(/[.!؟؛\n]/, 1)[0]
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");
  const publishedDate = post.createdAt ? new Date(post.createdAt) : null;

  return (
    <main className="reading-page-shell" dir="rtl">
      <div className="reading-page-layout">
        <article className="reading-article">
          <PostReadTracker postId={post._id} />
          <header className="reading-article-header">
            <div className="reading-article-title-row">
              <h1>{post.title}</h1>
              {post.category?.title && (
                <span className="reading-article-category">
                  <span className="reading-category-dot" aria-hidden="true" />
                  {post.category.title}
                </span>
              )}
            </div>
            {post.briefText && <p className="reading-article-brief">{post.briefText}</p>}
            <div className="reading-article-byline reading-author-panel">
              <Author author={post.author} className="reading-article-author" />
              <div className="reading-article-meta">
                {publishedDate && Number.isFinite(publishedDate.getTime()) && (
                  <time className="reading-article-date" dateTime={publishedDate.toISOString()}>
                    {publicationDateFormat.format(publishedDate)}
                  </time>
                )}
                {post.readingTime && (
                  <span className="reading-article-time">
                    <ClockIcon aria-hidden="true" />
                    {numberFormatter(post.readingTime)} دقیقه مطالعه
                  </span>
                )}
              </div>
            </div>
          </header>

          <Coverimage
            title={post.title}
            slug={post.slug}
            coverImageUrl={post.coverImageUrl}
            readingTime={post.readingTime}
            coverInsight={coverInsight}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 832px"
            className="blog-post-cover reading-article-cover"
          />

          <div className="reading-article-body">
            {paragraphs.map((paragraph, index) => (
              <Fragment key={`${index}-${paragraph.slice(0, 24)}`}>
                <p>{paragraph}</p>
                {post.quote?.trim() && index === Math.floor((paragraphs.length - 1) / 2) && (
                  <blockquote className="reading-article-quote">
                    <span>«{post.quote}»</span>
                  </blockquote>
                )}
              </Fragment>
            ))}
          </div>
          <div className="reading-article-social">
            {post.tags?.length > 0 && (
              <div className="reading-article-tag-row">
                <span className="reading-article-tag-label">برچسب‌ها:</span>
                <ul className="reading-article-tags" aria-label="برچسب‌های نوشته">
                  {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            )}
            <div className="reading-inline-actions" aria-label="کنش‌های نوشته">
              <div className="reading-inline-action-group">
                <SharePostAction slug={post.slug} title={post.title} />
                <BookmarkAction postId={post._id} isBookmarked={post.isBookmarked} className="reading-inline-bookmark" />
              </div>
              <PostInteraction
                postId={post._id}
                slug={post.slug}
                isLiked={post.isLiked}
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                className="reading-inline-interactions"
              />
            </div>
          </div>
          <PostComments
            postId={post._id}
            slug={post.slug}
            comments={post.comments || []}
            commentsCount={post.commentsCount}
            postTitle={post.title}
          />
        </article>

        <aside className="reading-engagement-rail" aria-label="ابزارهای تعامل با نوشته">
          <PostInteraction
            postId={post._id}
            slug={post.slug}
            isLiked={post.isLiked}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            className="reading-rail-interactions"
          />
          <BookmarkAction
            postId={post._id}
            isBookmarked={post.isBookmarked}
            className="reading-rail-bookmark"
          />
          <SharePostAction slug={post.slug} title={post.title} />
        </aside>
      </div>
    </main>
  );
}

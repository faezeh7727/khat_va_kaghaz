/** @format */

import { notFound } from "next/navigation";
import Author from "../_components/author";
import PostInteraction, { BookmarkAction, SharePostAction } from "../_components/postinteraction";
import PostReadTracker from "../_components/postreadtracker";
import Coverimage from "../_components/coverimage";
import numberFormatter from "@/utils/numberformater";
import { getPostBySlug } from "@/services/postservices";

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

  return (
    <main className="reading-page-shell" dir="rtl">
      <div className="reading-page-layout">
        <article className="reading-article">
          <PostReadTracker postId={post._id} />
          <header className="reading-article-header">
            {post.category?.title && (
              <span className="reading-article-category">{post.category.title}</span>
            )}
            <h1>{post.title}</h1>
            {post.briefText && <p className="reading-article-brief">{post.briefText}</p>}
            <Author author={post.author} className="reading-article-author" />
          </header>

          <Coverimage
            title={post.title}
            slug={post.slug}
            coverImageUrl={post.coverImageUrl}
            readingTime={post.readingTime}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 832px"
            className="blog-post-cover reading-article-cover"
          />

          <div className="reading-article-body">{post.text}</div>
          <section
            id="comments"
            className="post-comments reading-article-comments"
            aria-labelledby="post-comments-title"
          >
            <h2 id="post-comments-title">
              دیدگاه‌ها <span>({numberFormatter(post.commentsCount)})</span>
            </h2>
            {post.comments?.length ? (
              <ol className="post-comments-list">
                {post.comments.map((comment) => (
                  <li key={comment._id} className="post-comment">
                    <div className="post-comment-meta">
                      <strong>{comment.user?.name || "کاربر"}</strong>
                      {comment.createdAt && <time>{comment.createdAt}</time>}
                    </div>
                    <p>{comment.content?.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="post-comments-empty">
                هنوز دیدگاهی برای این نوشته ثبت نشده است.
              </p>
            )}
          </section>
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

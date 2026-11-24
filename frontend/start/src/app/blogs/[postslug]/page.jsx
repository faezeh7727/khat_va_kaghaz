/** @format */

import { notFound } from "next/navigation";
import Author from "../_components/author";
import PostInteraction from "../_components/postinteraction";
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
    <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <PostReadTracker postId={post._id} />
      <header className="mb-8 grid gap-5">
        {post.category?.title && (
          <span className="post-card-category w-fit">
            {post.category.title}
          </span>
        )}
        <h1 className="text-3xl font-extrabold leading-relaxed text-text-primary sm:text-4xl">
          {post.title}
        </h1>
        {post.briefText && (
          <p className="text-lg leading-9 text-text-secondary">
            {post.briefText}
          </p>
        )}
        <Author author={post.author} />
        <PostInteraction
          postId={post._id}
          slug={post.slug}
          isLiked={post.isLiked}
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          className="post-interactions-under-title"
        />
      </header>

      <Coverimage
        title={post.title}
        slug={post.slug}
        coverImageUrl={post.coverImageUrl}
        readingTime={post.readingTime}
        className="blog-post-cover"
      />

      <div className="whitespace-pre-wrap text-base leading-9 text-text-primary sm:text-lg">
        {post.text}
      </div>
      <section
        id="comments"
        className="post-comments"
        aria-labelledby="post-comments-title"
      >
        <h2 id="post-comments-title">
          دیدگاه‌ها <span>({numberFormatter(post.commentsCount)})</span>
        </h2>
        {post.comments?.length ?
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
        : <p className="post-comments-empty">
            هنوز دیدگاهی برای این نوشته ثبت نشده است.
          </p>
        }
      </section>
    </article>
  );
}

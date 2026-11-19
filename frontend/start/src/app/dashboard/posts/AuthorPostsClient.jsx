"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import AuthorOnly from "../_components/AuthorOnly";
import PostEditorService from "@/services/PostEditorService";

const dateFormat = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

function AuthorPostsContent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    PostEditorService.getMyPosts()
      .then((data) => { if (active) setPosts(data); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="profile-page dashboard-page author-posts-page" dir="rtl">
      <header className="author-page-heading">
        <div><span className="dashboard-kicker">پنل نویسنده</span><h1>نوشته‌های من</h1><p>نوشته‌هایت را مدیریت کن یا مطلب تازه‌ای بنویس.</p></div>
        <Link className="author-action-button" href="/dashboard/posts/new"><PlusIcon aria-hidden="true" /> نوشتن مطلب</Link>
      </header>

      {loading && <p className="profile-loading" role="status">در حال دریافت نوشته‌ها…</p>}
      {error && <p className="author-posts-message is-error" role="alert">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <section className="author-posts-empty"><h2>هنوز نوشته‌ای نداری</h2><p>اولین مطلبت را بنویس تا اینجا نمایش داده شود.</p><Link className="author-action-button" href="/dashboard/posts/new">نوشتن اولین مطلب <ArrowLeftIcon aria-hidden="true" /></Link></section>
      )}
      {!loading && posts.length > 0 && (
        <div className="author-post-list">
          {posts.map((post) => (
            <article className="author-post-row" key={post._id}>
              <div className="author-post-copy">
                <div className="author-post-meta"><span>{post.category?.title || "بدون دسته‌بندی"}</span><time dateTime={post.updatedAt}>{post.updatedAt ? dateFormat.format(new Date(post.updatedAt)) : ""}</time></div>
                <h2>{post.title}</h2>
                <p>{post.briefText}</p>
              </div>
              <div className="author-post-actions">
                <Link className="author-edit-link" href={`/dashboard/posts/${post._id}/edit`}><PencilSquareIcon aria-hidden="true" /> ویرایش</Link>
                {post.slug && <Link className="author-preview-link" href={`/blogs/${encodeURIComponent(post.slug)}`} target="_blank" rel="noreferrer">مشاهده <ArrowLeftIcon aria-hidden="true" /></Link>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function AuthorPostsClient() {
  return <AuthorOnly><AuthorPostsContent /></AuthorOnly>;
}

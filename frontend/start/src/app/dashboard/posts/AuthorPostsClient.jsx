"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import AuthorOnly from "../_components/AuthorOnly";
import PostEditorService from "@/services/PostEditorService";
import Modal from "@/ui/Modal";
import SubmitButtun from "@/ui/SubmitButtun";

const dateFormat = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

function AuthorPostsContent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;
    PostEditorService.getMyPosts()
      .then((data) => { if (active) setPosts(data); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function confirmDelete() {
    if (!postToDelete || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await PostEditorService.remove(postToDelete._id);
      setPosts((current) => current.filter((post) => post._id !== postToDelete._id));
      setPostToDelete(null);
    } catch {
      setDeleteError("حذف نوشته انجام نشد. اتصال را بررسی کن و دوباره تلاش کن.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
    <main className="profile-page dashboard-page author-posts-page" dir="rtl">
      <header className="author-page-heading">
        <div><span className="dashboard-kicker">پنل نویسنده</span><h1 className="author-posts-title">نوشته‌های من</h1><p>نوشته‌هایت را مدیریت کن یا مطلب تازه‌ای بنویس.</p></div>
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
                <div className="author-post-meta"><span>{post.category?.title || "بدون دسته‌بندی"}</span><span className={`author-post-status${post.status === "draft" ? " is-draft" : ""}`}>{post.status === "draft" ? "پیش‌نویس" : "منتشرشده"}</span><time dateTime={post.updatedAt}>{post.updatedAt ? dateFormat.format(new Date(post.updatedAt)) : ""}</time></div>
                <h2>{post.title}</h2>
                <p>{post.briefText}</p>
              </div>
              <div className="author-post-actions">
                <Link className="author-edit-link" href={`/dashboard/posts/${post._id}/edit`}><PencilSquareIcon aria-hidden="true" /> ویرایش</Link>
                {post.slug && post.status !== "draft" && <Link className="author-preview-link" href={`/blogs/${encodeURIComponent(post.slug)}`}>مشاهده <ArrowLeftIcon aria-hidden="true" /></Link>}
                <button className="author-delete-link" type="button" onClick={() => { setDeleteError(""); setPostToDelete(post); }} aria-label={`حذف نوشته ${post.title || "بدون عنوان"}`}><TrashIcon aria-hidden="true" /><span>حذف</span></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
    {postToDelete && <Modal
      eyebrow="حذف نوشته"
      title="از حذف این نوشته مطمئنی؟"
      description={`«${postToDelete.title || "بدون عنوان"}» برای همیشه حذف می‌شود و امکان بازگرداندنش نیست.`}
      onClose={() => { if (!deleting) { setPostToDelete(null); setDeleteError(""); } }}
      closeDisabled={deleting}
      size="sm"
      className="author-delete-modal"
    >
      {deleteError && <p className="author-posts-message is-error" role="alert">{deleteError}</p>}
      <div className="author-delete-confirm-actions">
        <button className="author-back-link" type="button" onClick={() => { setPostToDelete(null); setDeleteError(""); }} disabled={deleting}>انصراف</button>
        <SubmitButtun className="author-delete-confirm-button" type="button" onClick={confirmDelete} pending={deleting}><TrashIcon aria-hidden="true" />{deleting ? "در حال حذف..." : "بله، حذف شود"}</SubmitButtun>
      </div>
    </Modal>}
    </>
  );
}

export default function AuthorPostsClient() {
  return <AuthorOnly><AuthorPostsContent /></AuthorOnly>;
}

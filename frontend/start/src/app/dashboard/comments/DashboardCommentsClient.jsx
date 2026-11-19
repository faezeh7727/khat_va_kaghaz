"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";

const dateFormat = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

export default function DashboardCommentsClient() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ comments: [], pagination: null });
  const [loadedPage, setLoadedPage] = useState(null);
  const [error, setError] = useState("");
  const loading = loadedPage !== page;

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
  }, [router, status]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    Authservice.getMyComments(page, 3)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setError("");
        setLoadedPage(page);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message);
        setLoadedPage(page);
      });
    return () => { active = false; };
  }, [page, user]);

  if (!user) {
    return <main className="profile-page dashboard-page" dir="rtl"><p className="profile-loading" role="status">در حال بارگذاری…</p></main>;
  }

  const pagination = result.pagination;
  return (
    <main className="profile-page dashboard-page dashboard-comments-page" dir="rtl">
      <header className="author-page-heading">
        <div>
          <span className="dashboard-kicker">سوابق من</span>
          <h1>دیدگاه‌های من</h1>
          <p>سه دیدگاه اخیر در هر صفحه نمایش داده می‌شود.</p>
        </div>
        <Link className="dashboard-comments-back" href="/dashboard"><ArrowRightIcon aria-hidden="true" /> بازگشت به داشبورد</Link>
      </header>

      {pagination && <p className="dashboard-comments-count">{new Intl.NumberFormat("fa-IR").format(pagination.total)} دیدگاه ثبت‌شده</p>}
      {loading && <p className="profile-loading" role="status">در حال دریافت دیدگاه‌ها…</p>}
      {error && <p className="author-posts-message is-error" role="alert">{error}</p>}
      {!loading && !error && result.comments.length === 0 && (
        <section className="dashboard-comments-empty">هنوز دیدگاهی ثبت نکرده‌اید.</section>
      )}
      {!loading && !error && result.comments.length > 0 && (
        <div className="dashboard-comment-list">
          {result.comments.map((comment) => (
            <article className="dashboard-comment-card" key={comment._id}>
              <header>
                <Link href={`/blogs/${encodeURIComponent(comment.slug)}#comments`}>«{comment.title}»</Link>
                {comment.createdAt && <time dateTime={comment.createdAt}>{dateFormat.format(new Date(comment.createdAt))}</time>}
              </header>
              <p>{comment.text}</p>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && pagination?.totalPages > 1 && (
        <nav className="dashboard-comments-pagination" aria-label="صفحه‌بندی دیدگاه‌ها">
          <button type="button" onClick={() => setPage((value) => value - 1)} disabled={page <= 1}>
            <ChevronRightIcon aria-hidden="true" /> قبلی
          </button>
          <span>صفحه {new Intl.NumberFormat("fa-IR").format(page)} از {new Intl.NumberFormat("fa-IR").format(pagination.totalPages)}</span>
          <button type="button" onClick={() => setPage((value) => value + 1)} disabled={page >= pagination.totalPages}>
            بعدی <ChevronLeftIcon aria-hidden="true" />
          </button>
        </nav>
      )}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";
import RecommendationPostCard from "../_components/RecommendationPostCard";

const numberFormat = new Intl.NumberFormat("fa-IR");

export default function RecommendationsArchiveClient() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ recommendations: [], pagination: null });
  const [loadedPage, setLoadedPage] = useState(null);
  const [error, setError] = useState("");
  const loading = loadedPage !== page;

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
  }, [router, status]);

  const loadPage = useCallback(() => {
    if (!user) return undefined;
    let active = true;
    Authservice.getRecommendations({ page, limit: 8 })
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

  useEffect(() => loadPage(), [loadPage]);

  if (!user) {
    return <main className="profile-page dashboard-page" dir="rtl"><p className="profile-loading" role="status">در حال بارگذاری…</p></main>;
  }

  const pagination = result.pagination;
  const hasInterests = (user.interests || []).some((interest) => String(interest).trim());
  return (
    <main className="profile-page dashboard-page recommendation-archive-page" dir="rtl">
      <header className="recommendation-archive-heading">
        <div className="recommendation-archive-title-row">
          <div className="recommendation-archive-intro">
            <h1>آرشیو پیشنهادها</h1>
            <p>نوشته‌های مرتبط با علاقه‌مندی‌های ثبت‌شده در پروفایل شما</p>
          </div>
          <Link className="recommendation-archive-back dashboard-comments-back" href="/dashboard"><ArrowRightIcon aria-hidden="true" /> بازگشت به داشبورد</Link>
        </div>
      </header>

      {pagination && <p className="recommendation-archive-count">{numberFormat.format(pagination.total)} نوشته‌ی هم‌راستا پیدا شد</p>}
      {loading && <p className="profile-loading" role="status">در حال دریافت پیشنهادها…</p>}
      {error && <p className="author-posts-message is-error" role="alert">{error}</p>}
      {!loading && !error && result.recommendations.length === 0 && (
        <section className="recommendation-archive-empty">
          <h2>{hasInterests ? "هنوز نوشته‌ی مرتبطی پیدا نشد" : "علاقه‌مندی‌هایت را اضافه کن"}</h2>
          <p>{hasInterests ? "با انتشار نوشته‌های تازه‌ی هم‌راستا، این آرشیو به‌روز می‌شود." : "برای ساختن پیشنهادهای متناسب، موضوع‌های مورد علاقه‌ات را در پروفایل ثبت کن."}</p>
          <Link href={hasInterests ? "/blogs" : "/profile"}>{hasInterests ? "مرور همه‌ی نوشته‌ها" : "رفتن به پروفایل"}<ArrowLeftIcon aria-hidden="true" /></Link>
        </section>
      )}

      {!loading && !error && result.recommendations.length > 0 && (
        <div className="recommendation-archive-list">
          {result.recommendations.map((article) => (
            <RecommendationPostCard article={article} key={article._id} />
          ))}
        </div>
      )}

      {!loading && !error && pagination?.totalPages > 1 && (
        <nav className="recommendation-archive-pagination" aria-label="صفحه‌بندی آرشیو پیشنهادها">
          <button type="button" onClick={() => setPage((value) => value - 1)} disabled={page <= 1}><ArrowRightIcon aria-hidden="true" /> قبلی</button>
          <span>صفحه‌ی {numberFormat.format(page)} از {numberFormat.format(pagination.totalPages)}</span>
          <button type="button" onClick={() => setPage((value) => value + 1)} disabled={page >= pagination.totalPages}>بعدی <ArrowLeftIcon aria-hidden="true" /></button>
        </nav>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Authservice from "@/services/Authservice";
import RecommendationPostCard from "./RecommendationPostCard";

export default function RecommendedArticle({ recommendation, recommendations = [], interests = [], isLoading, hasError }) {
  const [refreshedPosts, setRefreshedPosts] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const hasInterests = interests.some((interest) => String(interest).trim());
  const posts = refreshedPosts ?? (recommendations.length ? recommendations : (recommendation ? [recommendation] : []));
  const featured = posts[0] || recommendation;
  const related = posts.slice(1, 3);

  async function refreshRecommendations() {
    if (!hasInterests) {
      setRefreshMessage("برای دریافت پیشنهاد، علاقه‌مندی‌هایت را در پروفایل ثبت کن.");
      return;
    }
    setRefreshing(true);
    setRefreshMessage("");
    try {
      const result = await Authservice.getRecommendations({
        limit: 3,
        exclude: featured ? [String(featured._id)] : [],
        after: featured?.createdAt,
        latest: true,
      });
      if (!result.recommendations.length) {
        setRefreshMessage("مقاله‌ی تازه‌تری متناسب با علاقه‌مندی‌هایت پیدا نشد.");
      } else {
        setRefreshedPosts(result.recommendations);
        setRefreshMessage("پیشنهادها تازه شدند.");
      }
    } catch (error) {
      setRefreshMessage(error.message || "تازه‌سازی پیشنهادها انجام نشد.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className="dashboard-recommendation" aria-labelledby="dashboard-recommendation-title" dir="rtl">
      <header className="dashboard-recommendation-heading">
        <div className="dashboard-recommendation-title-group">
          <div className="dashboard-recommendation-title-line">
            <span className="dashboard-recommendation-mark"><SparklesIcon aria-hidden="true" /></span>
            <h2 id="dashboard-recommendation-title">پیشنهاد برگزیده برای شما</h2>
          </div>
          <p>بر اساس علاقه‌مندی‌ها و نوشته‌های تازه</p>
        </div>
        <div className="dashboard-recommendation-tools">
          <button className="dashboard-recommendation-refresh" type="button" onClick={refreshRecommendations} disabled={refreshing || isLoading}>
            <ArrowPathIcon className={refreshing ? "is-spinning" : ""} aria-hidden="true" />
            {refreshing ? "در حال تازه‌سازی" : "تازه‌سازی"}
          </button>
        </div>
      </header>

      {refreshMessage && <p className="dashboard-recommendation-feedback" role="status" aria-live="polite">{refreshMessage}</p>}

      {isLoading ? (
        <p className="dashboard-recommendation-state" role="status">در حال پیدا کردن نوشته‌ی مناسب…</p>
      ) : hasError ? (
        <p className="dashboard-recommendation-state" role="status">دریافت پیشنهاد فعلاً ممکن نشد.</p>
      ) : featured ? (
        <>
          <div className="dashboard-recommendation-layout">
            <RecommendationPostCard article={featured} />
            {related.length > 0 && (
              <div className="dashboard-recommendation-related" aria-label="سایر پیشنهادهای هم‌راستا">
                <h3>سایر پیشنهادهای هم‌راستا</h3>
                {related.map((article) => <RecommendationPostCard article={article} key={article._id} />)}
              </div>
            )}
          </div>
          <footer className="dashboard-recommendation-bottom">
            <Link className="dashboard-recommendation-archive" href="/dashboard/recommendations">
              مشاهده آرشیو پیشنهادها <ArrowLeftIcon aria-hidden="true" />
            </Link>
            <Link className="dashboard-recommendation-interests" href="/profile">مدیریت علاقه‌مندی‌ها</Link>
            <span className="dashboard-recommendation-updated"><CheckCircleIcon aria-hidden="true" /> به‌روز متناسب با سلیقه‌ی شما</span>
          </footer>
        </>
      ) : (
        <div className="dashboard-recommendation-empty">
          <p>{hasInterests ? "هنوز نوشته‌ی هم‌خوانی با علاقه‌مندی‌هایت پیدا نکردیم." : "برای پیشنهاد نوشته‌های متناسب، علاقه‌مندی‌هایت را در پروفایل اضافه کن."}</p>
          <Link href={hasInterests ? "/blogs" : "/profile"}>{hasInterests ? "دیدن همه‌ی نوشته‌ها" : "افزودن علاقه‌مندی‌ها"}<ArrowLeftIcon aria-hidden="true" /></Link>
        </div>
      )}
    </section>
  );
}

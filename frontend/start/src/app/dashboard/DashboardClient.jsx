"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";
import ProfileStats from "../profile/_components/ProfileStats";
import DashboardHistory from "./_components/DashboardHistory";
import WeeklyReadingStreak from "./_components/WeeklyReadingStreak";
import RecommendedArticle from "./_components/RecommendedArticle";

const roleNames = { READER: "خواننده", AUTHOR: "نویسنده", ADMIN: "مدیر" };
const roleDescriptions = {
  READER: "مطالعه‌ها، نوشته‌های ذخیره‌شده و نظرهایت را از اینجا دنبال کن.",
  AUTHOR: "وضعیت نوشته‌ها و بازخوردی که از خوانندگان گرفته‌اند اینجاست.",
  ADMIN: "آمار کلی سایت و دسترسی‌های مدیریتی از این بخش در دسترس است.",
};
export default function DashboardClient() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
  }, [router, status]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    Authservice.getDashboard()
      .then((data) => { if (active) setDashboard(data); })
      .catch(() => { if (active) setHasError(true); });
    return () => { active = false; };
  }, [user]);

  if (!user) {
    return <main className="profile-page dashboard-page" dir="rtl"><p className="profile-loading" role="status">در حال بارگذاری داشبورد...</p></main>;
  }

  const role = dashboard?.role || user.role || "READER";
  const stats = dashboard?.stats;
  const displayName = user.name || user.username || "کاربر";
  return (
    <main className="profile-page dashboard-page" dir="rtl">
      <section className="dashboard-welcome" aria-labelledby="dashboard-title">
        <div className="dashboard-welcome-copy">
          <div className="dashboard-welcome-labels">
            <span className="dashboard-kicker">حساب کاربری</span>
            <span className="dashboard-role-badge">{roleNames[role] || roleNames.READER}</span>
          </div>
          <h1 id="dashboard-title">داشبورد، <span>{displayName}</span></h1>
          <p>{roleDescriptions[role] || roleDescriptions.READER}</p>
        </div>
        <div className="dashboard-avatar" aria-label={`تصویر پروفایل ${displayName}`}>
          {user.avatarUrl
            ? <Image src={user.avatarUrl} alt="" width={64} height={64} unoptimized />
            : <span>{displayName.trim().charAt(0)}</span>}
        </div>
        <div className="dashboard-welcome-footer">
          <span className="dashboard-email" dir="ltr">{user.email}</span>
          <Link className="dashboard-profile-link" href="/profile">
            مشاهده و ویرایش پروفایل
            <ArrowLeftIcon aria-hidden="true" />
          </Link>
        </div>
      </section>

      <ProfileStats
        role={role}
        stats={stats}
        createdAt={user.createdAt}
        isLoading={!dashboard && !hasError}
        hasError={hasError}
      />

      {role === "AUTHOR" && (
        <nav className="dashboard-author-actions" aria-label="ابزار نویسنده">
          <Link className="author-action-button" href="/dashboard/posts">نوشته‌های من</Link>
          <Link className="author-back-link" href="/dashboard/posts/new">نوشتن مطلب تازه</Link>
        </nav>
      )}

      <WeeklyReadingStreak
        activity={role === "AUTHOR" ? dashboard?.writingActivity || [] : dashboard?.readingActivity || []}
        mode={role === "AUTHOR" ? "writing" : "reading"}
        isLoading={!dashboard && !hasError}
      />

      <DashboardHistory
        role={role}
        stats={stats}
        createdAt={user.createdAt}
        recentReads={dashboard?.recentReads || []}
        isLoading={!dashboard && !hasError}
        hasError={hasError}
      />

      <RecommendedArticle
        recommendation={dashboard?.recommendedPost || null}
        recommendations={dashboard?.recommendedPosts || []}
        interests={user.interests || []}
        isLoading={!dashboard && !hasError}
        hasError={hasError}
      />
    </main>
  );
}

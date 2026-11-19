"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";
import ProfileStats from "../profile/_components/ProfileStats";
import WeeklyReadingStreak from "./_components/WeeklyReadingStreak";

const roleNames = { READER: "خواننده", AUTHOR: "نویسنده", ADMIN: "مدیر" };
const roleDescriptions = {
  READER: "مطالعه‌ها، نوشته‌های ذخیره‌شده و نظرهایت را از اینجا دنبال کن.",
  AUTHOR: "وضعیت نوشته‌ها و بازخوردی که از خوانندگان گرفته‌اند اینجاست.",
  ADMIN: "آمار کلی سایت و دسترسی‌های مدیریتی از این بخش در دسترس است.",
};
const formatNumber = new Intl.NumberFormat("fa-IR");

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
  const history = role === "ADMIN"
    ? [
        { label: "کاربران سایت", value: stats?.users, Icon: UsersIcon, href: "/admin/users" },
        { label: "نظرهای ثبت‌شده", value: stats?.comments, Icon: ChatBubbleLeftRightIcon },
      ]
    : role === "AUTHOR"
      ? [
          { label: "لایک نوشته‌ها", value: stats?.likes, Icon: HeartIcon },
          { label: "نوشته‌های من", value: stats?.posts, Icon: ChatBubbleLeftRightIcon },
        ]
      : [
          { label: "نوشته‌های پسندیده", value: stats?.likes, Icon: HeartIcon },
          { label: "نظرهای من", value: stats?.comments, Icon: ChatBubbleLeftRightIcon },
        ];

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

      <section className="profile-history dashboard-history" aria-labelledby="dashboard-history-title">
        <h2 id="dashboard-history-title">سوابق من</h2>
        <div className="profile-history-list">
          {history.map(({ label, value, Icon, href }) => {
            const content = <>
              <span className="profile-history-icon"><Icon aria-hidden="true" /></span>
              <span className="profile-history-copy"><span>{label}</span><strong>{value == null ? (hasError ? "—" : "…") : formatNumber.format(value)}</strong></span>
              {href && <span className="profile-history-arrow" aria-hidden="true">←</span>}
            </>;
            return href
              ? <Link className="profile-history-row profile-history-link" href={href} key={label}>{content}</Link>
              : <div className="profile-history-row" key={label}>{content}</div>;
          })}
        </div>
        {hasError && <p className="profile-data-note" role="status">آمار داشبورد فعلاً در دسترس نیست.</p>}
      </section>
    </main>
  );
}

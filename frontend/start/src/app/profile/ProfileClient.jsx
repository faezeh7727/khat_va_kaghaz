"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  HeartIcon,
  PencilSquareIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";
import ProfileEditForm from "./_components/ProfileEditForm";
import ProfileStats from "./_components/ProfileStats";
import getTimeGreeting from "@/utils/getTimeGreeting";

const roleNames = { READER: "خواننده", AUTHOR: "نویسنده", ADMIN: "مدیر" };

export default function ProfilePage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("");

  useEffect(() => {
    setTimeGreeting(getTimeGreeting(new Date()));
  }, []);

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
  }, [router, status]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Authservice.getDashboard()
      .then((data) => { if (active) setDashboard(data); })
      .catch(() => { if (active) setDashboardError(true); });
    return () => { active = false; };
  }, [user]);

  if (!user) {
    return <main className="profile-page" dir="rtl"><p className="profile-loading" role="status">در حال بارگذاری اطلاعات حساب...</p></main>;
  }

  const role = dashboard?.role || user.role || "READER";
  const stats = dashboard?.stats;
  const history = role === "ADMIN"
    ? [
        { label: "کاربران", value: stats?.users, Icon: UsersIcon },
        { label: "نظرها", value: stats?.comments, Icon: ChatBubbleLeftRightIcon },
      ]
    : role === "AUTHOR"
      ? [
          { label: "لایک نوشته‌ها", value: stats?.likes, Icon: HeartIcon },
        ]
      : [
          { label: "نوشته‌های پسندیده", value: stats?.likes, Icon: HeartIcon },
          { label: "نظرهای من", value: stats?.comments, Icon: ChatBubbleLeftRightIcon },
        ];

  return (
    <main className="profile-page" dir="rtl">
      <section className="profile-welcome" aria-labelledby="profile-greeting">
        <div className="profile-avatar" aria-label={user.name || "کاربر"}>
          {user.avatarUrl ? <Image className="profile-avatar-image" src={user.avatarUrl} alt="" width={72} height={72} unoptimized /> : <span>{(user.name || "ک").trim().charAt(0)}</span>}
          <span className="profile-avatar-check" aria-hidden="true"><CheckIcon /></span>
        </div>
        <div className="profile-welcome-copy">
          <span className="profile-eyebrow"><span className="profile-status-dot" aria-hidden="true" />حساب کاربری</span>
          <h1 id="profile-greeting">سلام <span className="profile-name">{user.name || "کاربر"}</span> عزیز{timeGreeting && <span className="profile-greeting-badge">{timeGreeting}</span>}</h1>
          <p>خوشحالیم که همراه خط و کاغذ هستید.</p>
          <section className="profile-about-bubble" aria-labelledby="profile-about-title">
            <div className="profile-about-heading">
              <h2 id="profile-about-title"><ChatBubbleLeftRightIcon aria-hidden="true" />دربارهٔ من</h2>
              <button type="button" className="profile-about-edit" onClick={() => setIsEditing(true)}>
                <PencilSquareIcon aria-hidden="true" />
                {user.biography ? "ویرایش" : "افزودن معرفی"}
              </button>
            </div>
            <p className={user.biography ? "" : "is-empty"}>
              {user.biography || "هنوز معرفی کوتاهی ثبت نشده است. چند کلمه دربارهٔ خودت بنویس."}
            </p>
            {Array.isArray(user.interests) && user.interests.length > 0 && (
              <div className="profile-interest-badges" aria-label="علاقه‌مندی‌ها">
                {user.interests.map((interest) => <span key={interest}>{interest}</span>)}
              </div>
            )}
          </section>
          <div className="profile-card-divider" aria-hidden="true" />
          <div className="profile-pills">
            <span className="profile-role-pill"><BookOpenIcon aria-hidden="true" />{roleNames[role] || roleNames.READER}</span>
            <span className="profile-email-pill" dir="ltr"><EnvelopeIcon aria-hidden="true" />{user.email}</span>
          </div>
          <button
            className="profile-edit-trigger"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            <PencilSquareIcon aria-hidden="true" />
            ویرایش
          </button>
        </div>
      </section>

      <ProfileStats role={role} stats={stats} createdAt={user.createdAt} isLoading={!dashboard && !dashboardError} hasError={dashboardError} />

      <section className="profile-history" aria-labelledby="profile-history-title">
        <h2 id="profile-history-title">سوابق من</h2>
        <div className="profile-history-list">
          {history.map(({ label, value, Icon, href }) => {
            const content = <>
              <span className="profile-history-icon"><Icon aria-hidden="true" /></span>
              <span className="profile-history-copy"><span>{label}</span><strong>{value ?? (dashboardError ? "—" : "…")}</strong></span>
              {href && <span className="profile-history-arrow" aria-hidden="true">←</span>}
            </>;
            return href
              ? <Link className="profile-history-row profile-history-link" href={href} key={label}>{content}</Link>
              : <div className="profile-history-row" key={label}>{content}</div>;
          })}
        </div>
        {dashboardError && <p className="profile-data-note" role="status">آمار حساب فعلا در دسترس نیست.</p>}
      </section>
      {role === "ADMIN" && <Link className="admin-users-link" href="/admin/users">مدیریت نقش کاربران <span aria-hidden="true">←</span></Link>}
      {isEditing && <ProfileEditForm user={user} onClose={() => setIsEditing(false)} />}
    </main>
  );
}

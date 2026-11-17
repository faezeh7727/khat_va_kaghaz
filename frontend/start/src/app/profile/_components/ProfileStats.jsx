"use client";

import { useEffect, useState } from "react";

const formatNumber = new Intl.NumberFormat("fa-IR");
const dayMs = 24 * 60 * 60 * 1000;

export default function ProfileStats({ role, stats, createdAt, isLoading, hasError }) {
  const [membershipDays, setMembershipDays] = useState(null);

  useEffect(() => {
    const joinedAt = createdAt ? new Date(createdAt).getTime() : NaN;
    setMembershipDays(Number.isFinite(joinedAt)
      ? Math.max(0, Math.floor((Date.now() - joinedAt) / dayMs))
      : null);
  }, [createdAt]);

  const postStat = role === "ADMIN"
    ? { label: "نوشته‌های سایت", value: stats?.posts, caption: "نوشته در سایت" }
    : role === "AUTHOR"
      ? { label: "نوشته‌ها", value: stats?.posts, caption: "نوشته" }
      : { label: "خوانده‌شده", value: stats?.readPosts, caption: "نوشته" };

  const cards = [
    postStat,
    { label: "ذخیره‌شده‌ها", value: stats?.bookmarks, caption: "مطلب نشان‌شده" },
    { label: "همراهی", value: membershipDays, caption: "روز با ما" },
  ];

  function valueText(value) {
    if (value == null) return hasError ? "—" : isLoading ? "…" : "—";
    return formatNumber.format(value);
  }

  return (
    <section className="profile-stats-grid" aria-label="آمار حساب کاربری">
      {cards.map(({ label, value, caption }) => (
        <article className="profile-stat-card" key={label}>
          <span className="profile-stat-label">{label}</span>
          <strong className="profile-stat-value">{valueText(value)}</strong>
          <span className="profile-stat-caption">{caption}</span>
        </article>
      ))}
    </section>
  );
}

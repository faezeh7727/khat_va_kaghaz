import { useState } from "react";
import Link from "next/link";
import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

const numberFormat = new Intl.NumberFormat("fa-IR");
const dateFormat = new Intl.DateTimeFormat("fa-IR", {
  calendar: "persian",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const readDateFormat = new Intl.DateTimeFormat("fa-IR", {
  calendar: "persian",
  day: "numeric",
  month: "short",
});

const roleLabels = { READER: "خواننده", AUTHOR: "نویسنده", ADMIN: "مدیر" };

function formatDate(value, formatter) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? formatter.format(date) : "ثبت نشده";
}

function roleActivity(role, stats) {
  if (role === "AUTHOR") {
    return { label: "نوشته‌های من", value: stats?.posts, Icon: PencilSquareIcon, href: "/dashboard/posts" };
  }
  if (role === "ADMIN") {
    return { label: "نوشته‌های سایت", value: stats?.posts, Icon: BookOpenIcon, href: "/blogs" };
  }
  return { label: "دیدگاه‌های من", value: stats?.comments, Icon: ChatBubbleLeftRightIcon, href: "/dashboard/comments" };
}

function valueText(value, isLoading, hasError) {
  if (value == null) return hasError ? "-" : isLoading ? "…" : "۰";
  return numberFormat.format(value);
}

function HistoryArrow() {
  return <ChevronLeftIcon className="dashboard-history-chevron" aria-hidden="true" />;
}

function HistoryDisclosureArrow({ expanded }) {
  return (
    <ChevronDownIcon
      className={`dashboard-history-chevron dashboard-history-disclosure-chevron${expanded ? " is-expanded" : ""}`}
      aria-hidden="true"
    />
  );
}

export default function DashboardHistory({ role, stats, createdAt, recentReads = [], isLoading, hasError }) {
  const [showAllReads, setShowAllReads] = useState(false);
  const activity = roleActivity(role, stats);
  const ActivityIcon = activity.Icon;
  const visibleReads = showAllReads ? recentReads : recentReads.slice(0, 1);

  return (
    <section className="dashboard-history" aria-labelledby="dashboard-history-title" dir="rtl">
      <header className="dashboard-history-heading">
        <h2 id="dashboard-history-title" className="post-list-heading">سوابق من</h2>
        <span>به‌روزرسانی با فعالیت شما</span>
      </header>

      <div className="dashboard-history-list">
        <article className="dashboard-history-row">
          <span className="dashboard-history-icon is-membership"><CalendarDaysIcon aria-hidden="true" /></span>
          <div className="dashboard-history-copy">
            <span>تاریخ پیوستن</span>
            <strong>{formatDate(createdAt, dateFormat)}</strong>
          </div>
          <span className="dashboard-history-meta">
            <span className="dashboard-history-badge">{roleLabels[role] || roleLabels.READER}</span>
          </span>
        </article>

        <article className="dashboard-history-row">
          <span className="dashboard-history-icon is-bookmark"><BookmarkIcon aria-hidden="true" /></span>
          <div className="dashboard-history-copy">
            <span>نوشته‌های ذخیره‌شده</span>
            <strong>{valueText(stats?.bookmarks, isLoading, hasError)} <small>مطلب</small></strong>
          </div>
          <Link className="dashboard-history-action" href="/bookmarks">
            مشاهده فهرست <HistoryArrow />
          </Link>
        </article>

        <section className="dashboard-history-row dashboard-history-reads" aria-labelledby="dashboard-recent-reads-title">
          <span className="dashboard-history-icon is-reading"><ClockIcon aria-hidden="true" /></span>
          <div className="dashboard-history-copy dashboard-history-read-copy">
            <span id="dashboard-recent-reads-title">آخرین نوشته‌ی خوانده‌شده</span>
            {isLoading ? (
              <p className="dashboard-history-state" role="status">در حال بارگذاری سوابق مطالعه…</p>
            ) : recentReads.length ? (
              <ol id="dashboard-recent-read-list" className="dashboard-recent-read-list">
                {visibleReads.map((post) => (
                  <li key={post._id}>
                    <Link href={`/blogs/${encodeURIComponent(post.slug)}`}>«{post.title}»</Link>
                    {post.lastReadAt && <time dateTime={post.lastReadAt}>{formatDate(post.lastReadAt, readDateFormat)}</time>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dashboard-history-state">
                {hasError ? "دریافت سوابق مطالعه ممکن نشد." : "هنوز نوشته‌ای برای مطالعه ثبت نشده است."}
              </p>
            )}
          </div>
          {recentReads.length > 1 && !isLoading && (
            <button
              className="dashboard-history-action dashboard-history-read-toggle"
              type="button"
              aria-controls="dashboard-recent-read-list"
              aria-expanded={showAllReads}
              onClick={() => setShowAllReads((current) => !current)}
            >
              {showAllReads ? "بستن فهرست" : "مشاهده فهرست"}
              <HistoryDisclosureArrow expanded={showAllReads} />
            </button>
          )}
        </section>

        <article className="dashboard-history-row">
          <span className="dashboard-history-icon is-role-activity"><ActivityIcon aria-hidden="true" /></span>
          <div className="dashboard-history-copy">
            <span>{activity.label}</span>
            <strong>{valueText(activity.value, isLoading, hasError)} <small>{role === "READER" ? "دیدگاه" : "مورد"}</small></strong>
          </div>
          <Link className="dashboard-history-action" href={activity.href}>مشاهده فهرست <HistoryArrow /></Link>
        </article>
      </div>
    </section>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageLabels = {
  "": "خانه",
  dashboard: "داشبورد",
  recommendations: "آرشیو پیشنهادها",
  posts: "نوشته‌های من",
  new: "نوشتن مطلب",
  comments: "دیدگاه‌های من",
  profile: "پروفایل کاربری",
  bookmarks: "نوشته‌های ذخیره‌شده",
  blogs: "وبلاگ",
  category: "دسته‌بندی",
  about: "درباره ما",
  admin: "مدیریت",
  users: "مدیریت کاربران",
  signin: "ورود",
  signup: "ثبت‌نام",
  edit: "ویرایش نوشته",
};

function subscribeToTitle(onTitleChange) {
  if (typeof document === "undefined") return () => {};
  const titleElement = document.querySelector("head title");
  if (!titleElement) return () => {};

  const observer = new MutationObserver(onTitleChange);
  observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
  return () => observer.disconnect();
}

function getTitleSnapshot() {
  return typeof document === "undefined" ? "" : document.title.split("|")[0].trim();
}

function getReadableSlug(segment) {
  try {
    return decodeURIComponent(segment).replace(/[-_]+/g, " ");
  } catch {
    return segment.replace(/[-_]+/g, " ");
  }
}

function getSegmentLabel(segment, isLast, pageTitle) {
  if (pageLabels[segment]) return pageLabels[segment];
  if (isLast && pageTitle && pageTitle !== "خط و کاغذ" && pageTitle !== "خانه") return pageTitle;
  return getReadableSlug(segment);
}

function createTrail(pathname, pageTitle) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const segments = normalizedPath.split("/").filter(Boolean);

  if (!segments.length) return [{ href: "/", label: "خانه" }];

  if (segments[0] === "dashboard") {
    const trail = [{ href: "/dashboard", label: "داشبورد" }];
    if (segments.length === 1) return trail;

    if (segments[1] === "posts" && segments.length >= 3 && segments[2] !== "new") {
      trail.push({ href: "/dashboard/posts", label: "نوشته‌های من" });
      if (segments[3] === "edit") trail.push({ href: normalizedPath, label: "ویرایش نوشته" });
      else if (segments.length === 3) trail.push({ href: normalizedPath, label: getSegmentLabel(segments[2], true, pageTitle) });
      return trail;
    }

    let href = "/dashboard";
    for (const segment of segments.slice(1)) {
      href += `/${segment}`;
      trail.push({ href, label: getSegmentLabel(segment, href === normalizedPath, pageTitle) });
    }
    return trail;
  }

  if (segments[0] === "blogs") {
    if (segments.length === 1) return [{ href: "/blogs", label: "وبلاگ" }];
    if (segments[1] === "category" && segments[2]) {
      return [
        { href: "/blogs", label: "وبلاگ" },
        { href: normalizedPath, label: pageTitle || `دسته‌بندی ${getReadableSlug(segments[2])}` },
      ];
    }
    return [
      { href: "/blogs", label: "وبلاگ" },
      { href: normalizedPath, label: getSegmentLabel(segments[1], true, pageTitle) },
    ];
  }

  let href = "";
  return segments.map((segment, index) => {
    href += `/${segment}`;
    return {
      href,
      label: getSegmentLabel(segment, index === segments.length - 1, pageTitle),
    };
  });
}

export default function NavigationTrail({ className = "page-navigation-trail" }) {
  const pathname = usePathname() || "/";
  const pageTitle = useSyncExternalStore(subscribeToTitle, getTitleSnapshot, () => "");
  const trail = createTrail(pathname, pageTitle);

  return (
    <nav className={className} aria-label="مسیر صفحه">
      {trail.map((item, index) => {
        const isCurrent = index === trail.length - 1;
        return (
          <span className="page-navigation-trail-item" key={`${item.href}-${index}`}>
            {index > 0 && <span className="page-navigation-trail-separator" aria-hidden="true">/</span>}
            {isCurrent ? (
              <span className="page-navigation-trail-current" aria-current="page">
                <span className="page-navigation-trail-current-indicator" aria-hidden="true" />
                {item.label}
              </span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

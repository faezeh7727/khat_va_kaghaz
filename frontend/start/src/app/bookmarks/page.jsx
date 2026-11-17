import BookmarksClient from "./BookmarksClient";
import Postlist from "../blogs/_components/postlist";
import { getBookmarkedPosts } from "@/services/postservices";
import { createPageMetadata } from "@/utils/pageMetadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "نوشته‌های ذخیره‌شده",
  description: "فهرست نوشته‌هایی که در حساب کاربری ذخیره کرده‌اید.",
  robots: { index: false, follow: false },
});

export default async function BookmarksPage() {
  const posts = await getBookmarkedPosts();

  return (
    <BookmarksClient>
      <section aria-labelledby="bookmarks-title">
        <header className="post-list-section-heading">
          <h1 id="bookmarks-title" className="post-list-heading">
            نوشته‌های ذخیره‌شده
          </h1>
          <p className="post-list-subtitle">
            نوشته‌هایی که برای مطالعه‌ی بعدی ذخیره کرده‌اید.
          </p>
        </header>
        <Postlist
          posts={posts || []}
          emptyMessage={
            posts === null
              ? "دریافت نوشته‌های ذخیره‌شده ممکن نشد. صفحه را دوباره بارگذاری کنید."
              : "هنوز نوشته‌ای ذخیره نکرده‌اید. از فهرست نوشته‌ها، موارد دلخواهتان را ذخیره کنید."
          }
        />
      </section>
    </BookmarksClient>
  );
}

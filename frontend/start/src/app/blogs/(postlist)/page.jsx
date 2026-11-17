/** @format */

import Postlist from "../_components/postlist";
import { getPostList } from "@/services/postservices";

export const dynamic = "force-dynamic";

async function Blogpage({ searchParams }) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const { posts, totalCount } = await getPostList({ search });
  const emptyMessage = search
    ? `هیچ پستی با عبارت «${search}» پیدا نشد.`
    : "هنوز نوشته‌ای منتشر نشده است.";

  return (
    <div>
      {search && totalCount !== null && (
        <p className="post-search-count" role="status" aria-live="polite">
          برای عبارت «{search}»، {totalCount} نتیجه پیدا شد.
        </p>
      )}
      <header className="post-list-section-heading">
        <h1 className="post-list-heading">
          <span>لیست پست‌ها</span>
          <span className="post-list-editor-badge">منتخب سردبیر</span>
        </h1>
        <p className="post-list-subtitle">
          کاوش در روایت‌های ادبی، هنر مدرن و بازتاب‌های فرهنگی روزمره
        </p>
      </header>
      <Postlist posts={posts || []} emptyMessage={emptyMessage} />
    </div>
  );
}

export default Blogpage;

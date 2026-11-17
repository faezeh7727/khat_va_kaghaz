import Postlist from "../../../_components/postlist";
import getCategories from "../../../_components/getcategores";
import { getPostList } from "@/services/postservices";

export const dynamic = "force-dynamic";

async function getCategoryData(categorySlug, search = "") {
  const [postResult, categories] = await Promise.all([
    getPostList({ categorySlug, search }),
    getCategories(),
  ]);
  const category = categories.find((item) => item.slug === categorySlug);

  return { ...postResult, category };
}

export async function generateMetadata({ params }) {
  const { categoryslug } = await params;
  const { category } = await getCategoryData(categoryslug);

  return {
    title: category?.title ? `نوشته‌های ${category.title}` : "نوشته‌های دسته‌بندی",
    robots: { index: false, follow: false },
  };
}

export default async function CategoryPostsPage({ params, searchParams }) {
  const { categoryslug } = await params;
  const query = await searchParams;
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const { posts, totalCount, category } = await getCategoryData(categoryslug, search);
  const title = category?.title || categoryslug;
  const emptyMessage = search
    ? `هیچ پستی با عبارت «${search}» در دستهٔ «${title}» پیدا نشد.`
    : `هنوز نوشته‌ای در دسته‌بندی «${title}» منتشر نشده است.`;

  return (
    <section>
      {search && totalCount !== null && (
        <p className="post-search-count" role="status" aria-live="polite">
          برای عبارت «{search}»، {totalCount} نتیجه در این دسته پیدا شد.
        </p>
      )}
      <header className="post-list-section-heading">
        <h1 className="post-list-heading">
          <span>{title}</span>
          <span className="post-list-editor-badge">دسته‌بندی نوشته‌ها</span>
        </h1>
        <p className="post-list-subtitle">
          نوشته‌های منتشرشده در دسته‌بندی {title}
        </p>
      </header>
      <Postlist
        posts={posts || []}
        searchEmptyMessage={
          search ? `هیچ پستی با عبارت «${search}» در دستهٔ «${title}» پیدا نشد.` : null
        }
        emptyMessage={
          posts === null
            ? "دریافت نوشته‌های این دسته‌بندی ممکن نشد. دوباره تلاش کنید."
            : `هنوز نوشته‌ای در دسته‌بندی «${title}» منتشر نشده است.`
        }
      />
    </section>
  );
}

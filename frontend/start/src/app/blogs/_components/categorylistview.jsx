/** @format */

export default function CategoryListView({ children }) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:h-fit lg:rounded-2xl lg:border lg:border-border-default lg:bg-background-card lg:p-4">
      <div className="category-list-header">
        <h2 className="category-list-title-badge mb-2 lg:mb-1">
          <span className="category-list-status-light" aria-hidden="true" />
          لیست دسته‌بندی‌های خط و کاغذ
        </h2>
        <p className="category-list-subtitle hidden lg:block">
          برگزیده‌ی تحریریه برای دسترسی آسان
        </p>
        <div className="category-list-header-divider hidden lg:block" aria-hidden="true" />
      </div>

      <nav
        aria-label="دسته‌بندی نوشته‌ها"
        className="category-capsule-panel category-list-scroll overflow-x-auto pb-1 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
      >
        {children}
      </nav>
    </aside>
  );
}

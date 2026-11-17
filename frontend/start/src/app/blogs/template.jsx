/** @format */

export default function BlogsTemplate({ children }) {
  // این wrapper هنگام جابه‌جایی بین مسیرهای بلاگ دوباره ساخته می‌شود تا انیمیشن ورود صفحه اجرا شود.
  return (
    <div className="page-route-transition page-route-transition-nested">
      {children}
    </div>
  );
}

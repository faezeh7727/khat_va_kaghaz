import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>خط و کاغذ؛ جایی برای خواندن و نوشتن.</p>
        <nav aria-label="پیوندهای پایین صفحه">
          <Link href="/">خانه</Link>
          <Link href="/blogs">وبلاگ‌ها</Link>
          <Link href="/about">دربارهٔ ما</Link>
        </nav>
      </div>
    </footer>
  );
}

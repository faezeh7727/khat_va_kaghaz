"use client";

import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Error({ reset }) {
  return (
    <main className="app-error-screen" dir="rtl">
      <section className="app-error-panel" aria-labelledby="app-error-title">
        <div className="app-error-mark" aria-hidden="true">
          <ExclamationTriangleIcon />
        </div>
        <p className="app-error-eyebrow">خطای غیرمنتظره</p>
        <h1 id="app-error-title">بارگذاری صفحه با مشکل روبه‌رو شد</h1>
        <p className="app-error-description">
          لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، کمی بعد دوباره به صفحه سر بزنید.
        </p>
        <button type="button" onClick={() => reset()} className="app-error-retry">
          <ArrowPathIcon aria-hidden="true" />
          <span>تلاش دوباره</span>
        </button>
      </section>
    </main>
  );
}

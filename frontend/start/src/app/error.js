"use client";

export default function Error({ reset }) {
  return (
    <main
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center"
      dir="rtl"
    >
      <p className="text-sm font-semibold text-primary-600">خطای غیرمنتظره</p>
      <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">
        بارگذاری صفحه با مشکل روبه‌رو شد
      </h1>
      <p className="max-w-xl leading-8 text-text-secondary">
        لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، کمی بعد دوباره به صفحه
        سر بزنید.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        تلاش دوباره
      </button>
    </main>
  );
}

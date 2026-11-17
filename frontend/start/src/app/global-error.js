"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f8fafc",
          color: "#172033",
          fontFamily: "Tahoma, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "560px" }}>
          <p style={{ color: "#b45309", fontWeight: 700 }}>خطای غیرمنتظره</p>
          <h1 style={{ fontSize: "1.75rem", lineHeight: 1.7 }}>
            بارگذاری صفحه با مشکل روبه‌رو شد
          </h1>
          <p style={{ lineHeight: 2, color: "#475569" }}>
            لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، کمی بعد دوباره به صفحه
            سر بزنید.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: "12px",
              padding: "12px 20px",
              background: "#2563eb",
              color: "white",
              font: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            تلاش دوباره
          </button>
        </main>
      </body>
    </html>
  );
}

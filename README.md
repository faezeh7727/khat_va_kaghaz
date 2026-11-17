# خط و کاغذ

وبلاگ فارسی «خط و کاغذ» با فرانت‌اند Next.js و API بک‌اند Express ساخته شده است. داده‌ها در MongoDB نگهداری می‌شوند.

## ساختار پروژه

- `backend/` — API، احراز هویت و اتصال به MongoDB
- `frontend/start/` — برنامه‌ی وب Next.js

## پیش‌نیازها

- Node.js و npm
- MongoDB محلی یا یک آدرس اتصال MongoDB

## راه‌اندازی بک‌اند

```bash
cd backend
npm install
```

فایل `backend/.env.example` را به `.env` در همان پوشه کپی کنید. مقدار `MONGODB_URI` را تنظیم کنید و برای کلیدهای امنیتی، مقدارهای تصادفی و محرمانه‌ی مخصوص خودتان بگذارید. مقدارهای نمونه برای اجرای واقعی مناسب نیستند.

```bash
npm run dev
```

API به‌طور پیش‌فرض روی `http://localhost:5000/api` اجرا می‌شود.

## راه‌اندازی فرانت‌اند

در ترمینال دیگری:

```bash
cd frontend/start
npm install
```

در صورت نیاز فایل `.env.local` در همین پوشه بسازید و آدرس API را تنظیم کنید:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000/api
```

سپس برنامه را اجرا کنید:

```bash
npm run dev
```

وب‌سایت در `http://localhost:3000` در دسترس خواهد بود. برای راهنمای اختصاصی فرانت‌اند، فایل [`frontend/start/README.md`](frontend/start/README.md) را ببینید.

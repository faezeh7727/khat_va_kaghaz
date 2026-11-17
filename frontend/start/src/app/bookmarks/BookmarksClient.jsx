"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BookmarksClient({ children }) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
  }, [router, status]);

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center" dir="rtl">
        <p role="status">در حال بارگذاری نوشته‌های ذخیره‌شده...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir="rtl">
      {children}
    </main>
  );
}

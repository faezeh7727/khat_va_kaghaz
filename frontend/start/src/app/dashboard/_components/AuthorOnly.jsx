"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthorOnly({ children }) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
    else if (user && user.role !== "AUTHOR") router.replace("/dashboard");
  }, [router, status, user]);

  if (status !== "success" || !user || user.role !== "AUTHOR") {
    return <main className="profile-page dashboard-page" dir="rtl"><p className="profile-loading" role="status">در حال بررسی دسترسی…</p></main>;
  }

  return children;
}

import AdminUsersClient from "./AdminUsersClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({
  title: "مدیریت نقش کاربران",
  description: "مدیریت سطح دسترسی کاربران خط و کاغذ.",
  robots: { index: false, follow: false },
});

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}

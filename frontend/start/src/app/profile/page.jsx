import ProfileClient from "./ProfileClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({
  title: "پروفایل کاربری",
  description: "مشاهده اطلاعات حساب کاربری در خط و کاغذ.",
  robots: { index: false, follow: false },
});

export default function ProfilePage() {
  return <ProfileClient />;
}

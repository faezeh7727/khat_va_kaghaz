import DashboardClient from "./DashboardClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({
  title: "داشبورد",
  description: "نمای کلی فعالیت‌های شما در خط و کاغذ.",
  robots: { index: false, follow: false },
});

export default function DashboardPage() {
  return <DashboardClient />;
}

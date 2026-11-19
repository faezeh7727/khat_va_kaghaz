import DashboardCommentsClient from "./DashboardCommentsClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({ title: "دیدگاه‌های من", robots: { index: false, follow: false } });

export default function DashboardCommentsPage() {
  return <DashboardCommentsClient />;
}

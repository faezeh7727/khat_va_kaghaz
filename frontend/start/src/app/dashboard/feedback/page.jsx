import DashboardFeedbackClient from "./DashboardFeedbackClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({ title: "بازخورد خوانندگان", robots: { index: false, follow: false } });

export default function DashboardFeedbackPage() {
  return <DashboardFeedbackClient />;
}

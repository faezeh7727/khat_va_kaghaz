import RecommendationsArchiveClient from "./RecommendationsArchiveClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({ title: "آرشیو پیشنهادها", robots: { index: false, follow: false } });

export default function RecommendationsArchivePage() {
  return <RecommendationsArchiveClient />;
}

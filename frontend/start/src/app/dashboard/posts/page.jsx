import AuthorPostsClient from "./AuthorPostsClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({ title: "نوشته‌های من", robots: { index: false, follow: false } });

export default function AuthorPostsPage() {
  return <AuthorPostsClient />;
}

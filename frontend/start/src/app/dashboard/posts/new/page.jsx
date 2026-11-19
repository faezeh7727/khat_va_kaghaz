import PostEditorClient from "../PostEditorClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({ title: "نوشتن مطلب", robots: { index: false, follow: false } });

export default function NewPostPage() {
  return <PostEditorClient />;
}

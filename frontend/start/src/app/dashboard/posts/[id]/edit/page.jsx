import PostEditorClient from "../../PostEditorClient";
import { createPageMetadata } from "@/utils/pageMetadata";

export const metadata = createPageMetadata({ title: "ویرایش نوشته", robots: { index: false, follow: false } });

export default async function EditPostPage({ params }) {
  const { id } = await params;
  return <PostEditorClient postId={id} />;
}

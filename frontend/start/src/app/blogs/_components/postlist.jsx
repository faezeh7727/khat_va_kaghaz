/** @format */

import PostCard from "./postcard";

export default function Postlist({
  posts = [],
  emptyMessage = "هنوز نوشته‌ای منتشر نشده است.",
  searchEmptyMessage,
}) {
  if (!posts || posts.length === 0) {
    return (
      <p className="post-list-message">
        {posts && searchEmptyMessage ? searchEmptyMessage : emptyMessage}
      </p>
    );
  }

  return (
    <ul className="post-list">
      {posts.map((post) => <PostCard key={post._id} {...post} showInteractions />)}
    </ul>
  );
}

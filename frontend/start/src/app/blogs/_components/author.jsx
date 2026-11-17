import Avatar from "@/ui/avatar";

export default function Author({ author, className = "" }) {
  if (!author?.name) return null;

  return (
    <div className={`post-card-author ${className}`.trim()}>
      <Avatar
        avatarUrl={author.avatarUrl}
        name={author.name}
        className="post-card-avatar"
      />
      <span className="post-card-author-copy">
        <span className="post-card-author-label">نویسنده</span>
        <span className="post-card-author-name">{author.name}</span>
      </span>
    </div>
  );
}

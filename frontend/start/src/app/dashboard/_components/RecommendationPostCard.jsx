import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";

const numberFormat = new Intl.NumberFormat("fa-IR");

export default function RecommendationPostCard({ article }) {
  if (!article) return null;
  const authorName = article.author?.name || article.author?.username || "نویسنده";
  const authorInitial = authorName.trim().charAt(0) || "ن";
  const articleUrl = `/blogs/${encodeURIComponent(article.slug)}`;

  return (
    <article className="recommendation-post-card">
      <header className="recommendation-post-meta">
        <div className="recommendation-post-meta-items">
          {article.category?.title && (
            <span className="recommendation-post-category">
              <BookOpenIcon aria-hidden="true" />{article.category.title}
            </span>
          )}
          {article.readingTime > 0 && (
            <span className="recommendation-post-reading-time">
              <ClockIcon aria-hidden="true" />{numberFormat.format(article.readingTime)} دقیقه مطالعه
            </span>
          )}
        </div>
      </header>

      <div className="recommendation-post-body">
        <h2><Link href={articleUrl}>{article.title}</Link></h2>
        {article.briefText && <p>{article.briefText}</p>}
      </div>

      <footer className="recommendation-post-footer">
        <div className="recommendation-post-author">
          <span className="recommendation-post-avatar" aria-hidden="true">{authorInitial}</span>
          <div className="recommendation-post-author-details">
            <span className="recommendation-post-author-name">{authorName}</span>
            {(article.matchedInterests || []).slice(0, 2).map((interest) => (
              <span className="recommendation-post-interest" key={interest}>{interest}</span>
            ))}
          </div>
        </div>
        <Link className="recommendation-post-link" href={articleUrl}>
          مشاهده نوشته <ArrowLeftIcon aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}

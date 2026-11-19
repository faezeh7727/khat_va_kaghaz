import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, ClockIcon, SparklesIcon } from "@heroicons/react/24/outline";

const numberFormat = new Intl.NumberFormat("fa-IR");

export default function RecommendedArticle({ recommendation, interests = [], isLoading, hasError }) {
  const hasInterests = interests.some((interest) => String(interest).trim());

  return (
    <section className="dashboard-recommendation" aria-labelledby="dashboard-recommendation-title" dir="rtl">
      <header className="dashboard-recommendation-heading">
        <div>
          <span className="dashboard-recommendation-eyebrow"><SparklesIcon aria-hidden="true" /> پیشنهاد برگزیده برای شما</span>
          <p id="dashboard-recommendation-title">بر اساس علاقه‌مندی‌های مطالعه‌ی شما</p>
        </div>
        {recommendation && <span className="dashboard-recommendation-match">متناسب با سلیقه‌ی شما</span>}
      </header>

      {isLoading ? (
        <p className="dashboard-recommendation-state" role="status">در حال پیدا کردن نوشته‌ی مناسب…</p>
      ) : hasError ? (
        <p className="dashboard-recommendation-state" role="status">دریافت پیشنهاد فعلاً ممکن نشد.</p>
      ) : recommendation ? (
        <article className="dashboard-recommendation-card">
          <div className="dashboard-recommendation-meta">
            {recommendation.category?.title && <span className="dashboard-recommendation-category"><BookOpenIcon aria-hidden="true" />{recommendation.category.title}</span>}
            {recommendation.readingTime > 0 && <span className="dashboard-recommendation-time"><ClockIcon aria-hidden="true" />{numberFormat.format(recommendation.readingTime)} دقیقه مطالعه</span>}
          </div>
          <h2><Link href={`/blogs/${encodeURIComponent(recommendation.slug)}`}>{recommendation.title}</Link></h2>
          {recommendation.briefText && <p className="dashboard-recommendation-summary">{recommendation.briefText}</p>}
          <footer className="dashboard-recommendation-footer">
            <div className="dashboard-recommendation-byline">
              {recommendation.author?.name && <span>{recommendation.author.name}</span>}
              {recommendation.matchedInterests?.slice(0, 2).map((interest) => <span className="dashboard-recommendation-interest" key={interest}>{interest}</span>)}
            </div>
            <Link className="dashboard-recommendation-read" href={`/blogs/${encodeURIComponent(recommendation.slug)}`}>
              ادامه‌ی مطالعه <ArrowLeftIcon aria-hidden="true" />
            </Link>
          </footer>
        </article>
      ) : (
        <div className="dashboard-recommendation-empty">
          <p>{hasInterests ? "هنوز نوشته‌ی هم‌خوانی با علاقه‌مندی‌هایت پیدا نکردیم." : "برای پیشنهاد نوشته‌های متناسب، علاقه‌مندی‌هایت را در پروفایل اضافه کن."}</p>
          <Link href="/profile">{hasInterests ? "دیدن همه‌ی نوشته‌ها" : "افزودن علاقه‌مندی‌ها"}<ArrowLeftIcon aria-hidden="true" /></Link>
        </div>
      )}
    </section>
  );
}

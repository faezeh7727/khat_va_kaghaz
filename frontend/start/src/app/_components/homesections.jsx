import { cache, Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import PostCard from "../blogs/_components/postcard";
import CoursesCarousel from "./courses-carousel";
import Spinner from "@/uiSpinner";
import { getPosts } from "@/services/postservices";

const getLatestPosts = cache(() => getPosts({ sort: "latest", limit: 7 }).then((posts) => posts || []));

function SectionHeading({ title, id, href = "/blogs", actionLabel = "همه نوشته‌ها", className = "" }) {
  return (
    <div className={`home-section-heading ${className}`}>
      <h2 id={id}>{title}</h2>
      <Link className="home-section-link" href={href}>
        {actionLabel}
        <ArrowLeftIcon aria-hidden="true" />
      </Link>
    </div>
  );
}

function PostCards({ posts }) {
  if (!posts.length) return null;

  return (
    <ul className="post-list home-featured-list">
      {posts.map((post) => <PostCard key={post._id} {...post} homeCard />)}
    </ul>
  );
}

async function FeaturedPostData() {
  const [post] = await getLatestPosts();
  return post ? <PostCards posts={[post]} /> : <p className="home-data-empty">هنوز نوشته‌ای منتشر نشده است.</p>;
}

async function LatestPostsData() {
  const posts = (await getLatestPosts()).slice(1);
  return posts.length ? <CoursesCarousel posts={posts} /> : <p className="home-data-empty">نوشتهٔ تازه‌ای در دسترس نیست.</p>;
}

function LoadingFallback({ label }) {
  return (
    <div className="home-data-loading">
      <Spinner label={label} />
    </div>
  );
}

export default function HomeSections() {
  return (
    <div className="home-editorial-sections">
      <section className="home-section" aria-labelledby="home-featured-title">
        <SectionHeading title="پیشنهاد سردبیر" id="home-featured-title" />
        <Suspense fallback={<LoadingFallback label="در حال دریافت نوشتهٔ منتخب" />}>
          <FeaturedPostData />
        </Suspense>
      </section>

      <section className="home-section home-latest-section" aria-labelledby="home-latest-title">
        <SectionHeading
          title="تازه‌ترین نوشته‌ها"
          id="home-latest-title"
          actionLabel="همه نوشته‌ها"
          className="home-latest-heading"
        />
        <Suspense fallback={<LoadingFallback label="در حال دریافت نوشته‌های تازه" />}>
          <LatestPostsData />
        </Suspense>
      </section>

    </div>
  );
}

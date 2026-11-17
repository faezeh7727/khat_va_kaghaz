/** @format */

import Image from "next/image";
import CurrentSeason from "@/ui/CurrentSeason";
import NavLink from "@/components/Navlink";
import HomeSections from "./_components/homesections";
import WhyChoose from "./_components/whychoose";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "خانه",
};

const copy = {
  platformLabel: "مجله‌ای برای فکر کردن",
  title: "ایده‌ها، داستان‌ها و نوشته‌هایی برای خواندن",
  description:
    "جایی برای خواندن، نوشتن و به اشتراک گذاشتن ایده‌ها، با مطالبی که ارزش خواندن دارند.",
  readBlogs: "مطالعه بلاگ‌ها",
  manageBlogs: "مدیریت بلاگ",
};

export default function Home() {
  return (
    <>
      <main className="home-page min-h-[calc(100dvh-100px)] px-5 pb-10 pt-4 sm:px-8 sm:pb-14 sm:pt-6 lg:px-12 lg:pt-8">
        <section className="home-hero mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="home-copy order-2 text-right lg:order-1">
            <div
              className="hero-badges mb-6 sm:mb-8"
              aria-label="اطلاعات مجله و فصل جاری"
            >
              <span className="hero-badge hero-badge-magazine">
                <span className="hero-badge-icon" aria-hidden="true">
                  ✦
                </span>
                <span>{copy.platformLabel}</span>
              </span>
              <span className="hero-badge hero-badge-season">
                <span className="hero-badge-icon" aria-hidden="true">
                  🍂
                </span>
                <CurrentSeason />
              </span>
            </div>
            <div className="hero-status-badge" role="status">
              <span className="hero-status-dot" aria-hidden="true" />
              <span>پلتفرم انتشار محتوا و داستان‌سرایی</span>
            </div>
            <h1 className="hero-title mb-4 max-w-3xl text-2xl font-black leading-[1.5] tracking-tight sm:text-3xl sm:leading-[1.4] md:text-4xl lg:text-5xl lg:leading-[1.25]">
              {copy.title}
            </h1>
            <p className="mb-6 max-w-xl text-sm leading-7 text-text-secondary sm:mb-7 sm:text-base sm:leading-8">
              {copy.description}
            </p>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-start">
              <NavLink
                path="/blogs"
                className="btn btn-primary home-cta-button w-full px-5 py-2 sm:w-auto"
              >
                {copy.readBlogs}
              </NavLink>
              <NavLink
                path="/dashboard"
                className="btn btn-outline-primary home-cta-button w-full px-5 py-2 sm:w-auto"
              >
                {copy.manageBlogs}
              </NavLink>
            </div>
            <WhyChoose />
          </div>

          <div className="home-art order-1 lg:order-2">
            <div className="home-art-frame">
              <Image
                src="/editorial-hero.png"
                alt="تصویری انتزاعی از جهان خواندن و نوشتن"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 52vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
        <HomeSections />
      </main>
      <SiteFooter />
    </>
  );
}

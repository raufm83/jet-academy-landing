import { Suspense } from "react";
import AboutUs from "@/components/views/landing/home/about-us";
import Blogs from "@/components/views/landing/home/blogs";
import Gallery from "@/components/views/landing/home/gallery";
import Hero from "@/components/views/landing/home/hero";
import { getPublicHomeHero } from "@/lib/home-hero-public";
import Projects from "@/components/views/landing/home/projects";
import HomeGraduates from "@/components/views/landing/home/graduates";
import CoursesSlider from "@/components/views/landing/home/courses";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { getAllCourses } from "@/utils/api/course";
import { buildAlternates } from "@/utils/seo";
import { homePageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";
import type { Locale } from "@/i18n/request";

export const revalidate = 60;

async function CoursesSection() {
  const courses = await getAllCourses({
    limit: 100,
    page: 1,
    includeUnpublished: false,
  });
  return <CoursesSlider courses={courses} />;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "Metadata",
  });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/", params.locale, baseUrl);
  const { title, description } = await resolvePageMeta(
    "home",
    params.locale,
    t("title"),
    t("description")
  );

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: t("keywords"),
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "JET Academy",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
      locale: params.locale === "az" ? "az_AZ" : "en_US",
      alternateLocale: params.locale === "az" ? "en_US" : "az_AZ",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function Home({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  const homeHeroCms = await getPublicHomeHero();

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const schema = homePageGraph({
    name: "JET Academy",
    description: SITE.description,
    url: base,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
    ],
  });

  return (
    <div className="bg-background w-full">
      <JsonLd data={schema} />
      <div
        className="
          container
          mx-auto
          px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
          2xl:px-10 3xl:px-24 4xl:px-32
          relative z-10
        "
      >
        <Hero locale={locale} cms={homeHeroCms} />
        <Suspense fallback={<div className="my-16 min-h-[280px] w-full animate-pulse rounded-2xl bg-default-100" />}>
          <CoursesSection />
        </Suspense>
        <AboutUs />
        <Suspense fallback={<div className="my-20 h-[300px]" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<div className="my-20 h-[300px]" />}>
          <HomeGraduates />
        </Suspense>
        <Suspense fallback={<div className="my-20 h-[300px]" />}>
          <Gallery />
        </Suspense>
        <FaqSection pageKey="home" locale={locale} />
        <Suspense fallback={<div className="my-20 h-[300px]" />}>
          <Blogs />
        </Suspense>
      </div>
    </div>
  );
}

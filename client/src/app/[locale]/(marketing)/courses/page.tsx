
import CoursesSlider from "@/components/views/landing/home/courses";
import { Locale } from "@/i18n/request";
import type { Course } from "@/types/course";
import { getAllCourses } from "@/utils/api/course";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { addTrailingSlash } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";
import { courseDetailPath, coursesListingPath } from "@/utils/course-paths";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("coursesPage");
  const locale = (await getLocale()) as Locale;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const canonicalPath = coursesListingPath(locale);
  const alternates = {
    canonical: addTrailingSlash(`${baseUrl}/${locale}${canonicalPath}`),
    languages: {
      az: addTrailingSlash(`${baseUrl}/az${coursesListingPath("az")}`),
      en: addTrailingSlash(`${baseUrl}/en${coursesListingPath("en")}`),
      ru: addTrailingSlash(`${baseUrl}/ru${coursesListingPath("ru")}`),
      "x-default": addTrailingSlash(`${baseUrl}/az${coursesListingPath("az")}`),
    },
  };

  const { title, description } = await resolvePageMeta(
    "courses",
    locale,
    t("metaTitle"),
    t("metaDescription")
  );

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      locale: locale === "az" ? "az_AZ" : "en_US",
      alternateLocale: locale === "az" ? "en_US" : "az_AZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CoursesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const t = await getTranslations("coursesPage");
  const courses = await getAllCourses({
    limit: 100,
    page: 1,
    includeUnpublished: false,
  });

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const itemList = ((courses?.items ?? []) as Course[])
    .filter((c) => c.published === true)
    .map((c) => {
      const ttl = c.title as unknown as Record<string, string>;
      const slg = c.slug as unknown as Record<string, string>;
      return {
        name: ttl[locale] ?? ttl.az ?? "",
        url: `${base}${courseDetailPath(locale, slg[locale] ?? slg.az ?? "")}`,
      };
    });
  const schema = collectionPageGraph({
    name: locale === "az" ? "Tədris Sahələri" : "Courses",
    description: SITE.description,
    url: `${base}${coursesListingPath(locale)}`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Tədris Sahələri" : "Courses", url: `${base}${coursesListingPath(locale)}` },
    ],
    itemList,
  });

  return (
    <div className="min-h-screen [@media(min-width:2500px)]:min-h-full  py-16">
      <JsonLd data={schema} />
      <div className="container mx-auto px-10">
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold text-jsblack mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-600 max-w-2xl [@media(min-width:3500px)]:!text-4xl mx-auto [@media(min-width:2500px)]:!text-2xl">
            {t("description")}
          </p>
        </div>
        
        <CoursesSlider courses={courses} showTitle={false} />
      </div>
      <FaqSection pageKey="courses" locale={locale} />
    </div>
  );
}
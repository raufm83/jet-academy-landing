
import ContactFormFloat from "@/components/views/landing/single-course/contact-form-float";
import EligibilitySection from "@/components/views/landing/single-course/course-eligibility";
import CourseHero from "@/components/views/landing/single-course/course-hero";
import TeachersSection from "@/components/views/landing/single-course/course-teachers";
import CoursesSlider from "@/components/views/landing/home/courses";
import { Locale } from "@/i18n/request";
import { getAllCourses, getCourseDetails } from "@/utils/api/course";
import api from "@/utils/api/axios";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BreadcrumbContextWrapper from "@/hooks/BreadcrumbContextWrapper";
import {
  addTrailingSlash,
  htmlToDescription,
  truncateDescription,
  truncateTitle,
} from "@/utils/seo";
import { coursePageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import Breadcrumbs from "@/components/views/landing/bread-crumbs/bread-crumbs";
import { getPageMeta, resolvePageMeta } from "@/utils/api/page-meta";
import FaqSection from "@/components/views/landing/faq/faq-section";
import type { Course } from "@/types/course";
import { courseDetailPath, coursesListingPath } from "@/utils/course-paths";



interface ISingleCoursePageProps {
  params: {
    slug: string;
    locale: string;
  };
}

function courseLangKey(locale: string): "az" | "en" {
  return locale.startsWith("en") ? "en" : "az";
}

function pickCourseTitle(
  title: { az?: string; en?: string } | null | undefined,
  locale: string
): string {
  if (!title || typeof title !== "object") return "";
  const k = courseLangKey(locale);
  return title[k] ?? title.az ?? title.en ?? "";
}

function pickCourseDescription(
  description: { az?: string; en?: string } | null | undefined,
  locale: string
): string {
  if (!description || typeof description !== "object") return "";
  const k = courseLangKey(locale);
  return description[k] ?? description.az ?? description.en ?? "";
}

function pickCourseTags(
  newTags: unknown,
  locale: string
): string[] {
  if (!newTags || typeof newTags !== "object") return [];
  const k = courseLangKey(locale);
  const raw = (newTags as Record<string, unknown>)[k] ??
    (newTags as Record<string, unknown>).az ??
    (newTags as Record<string, unknown>).en;
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export default async function SingleCoursePage({
  params,
}: ISingleCoursePageProps) {
  try {
    const [data, locale, t, tCourseOther, courses, teamMembersRes] =
      await Promise.all([
        getCourseDetails(params.slug),
        getLocale() as Promise<Locale>,
        getTranslations("singleCoursePage"),
        getTranslations("courseInfoCP"),
        getAllCourses({ limit: 100, page: 1, includeUnpublished: false }),
        api.get("/team/active"),
      ]);
    const fetchFaq = async (pageKey: string) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/faq-public?pageKey=${encodeURIComponent(pageKey)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return [];
        const list = await res.json();
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    };

    const [generalCourseFaq, specificCourseFaq] = await Promise.all([
      fetchFaq("course"),
      fetchFaq(`course:${params.slug}`),
    ]);

    const mergedCourseFaq = [...generalCourseFaq, ...specificCourseFaq].filter(
      (item, index, arr) => arr.findIndex((x) => x?.id === item?.id) === index
    );


    if (!data) notFound();

    const currentId = (data as Course).id;
    const otherCourseItems = (courses?.items as Course[] | undefined)?.filter(
      (c) => c.id !== currentId && c.published === true,
    ) ?? [];
    const coursesForSlider = { ...courses, items: otherCourseItems };

    const courseTitle = pickCourseTitle(data.title, locale);
    const allTeachers = teamMembersRes.data ?? [];

    const baseUrl = SITE.baseUrl;
    const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
    const courseDesc = htmlToDescription(
      pickCourseDescription(data.description, locale)
    );
    const schema = coursePageGraph({
      name: courseTitle,
      description: courseDesc,
      url: `${base}${courseDetailPath(locale, params.slug)}`,
      locale,
      breadcrumbItems: [
        { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
        { name: locale === "az" ? "Tədris Sahələri" : "Courses", url: `${base}${coursesListingPath(locale)}` },
        { name: courseTitle, url: `${base}${courseDetailPath(locale, params.slug)}` },
      ],
      tags: pickCourseTags(data.newTags, locale),
    });

    
    return (
   <BreadcrumbContextWrapper title={courseTitle}>
        <JsonLd data={schema} />
        <div className="container pt-4">
          <Breadcrumbs dynamicTitle={courseTitle} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 3xl:px-28 4xl:px-32 my-10 md:my-16 lg:my-10 4xl:my-24 [@media(min-width:2500px)]:!px-[111px] [@media(min-width:3500px)]:px-32">
          

          <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 mb-16">
            <div className="w-full lg:w-2/3">
              <CourseHero
                title={pickCourseTitle(data.title, locale)}
                courseOverviewText={t("courseDescription")}
                tags={pickCourseTags(data.newTags, locale)}
                description={pickCourseDescription(data.description, locale)}
                params={params}
                data={data}
                locale={locale}
              />
            </div>

            <div className="hidden lg:block w-full lg:w-1/3">
              <ContactFormFloat />
            </div>
          </div>

          {data.eligibility && data.eligibility.length > 0 && (
            <EligibilitySection
              locale={locale}
              title={t("whoIsEligibleToEnroll")}
              eligibility={data.eligibility}
            />
          )}

          <TeachersSection
            title={t("teachers")}
            description={t("teachersDescription")}
            data={{ teachers: allTeachers }}
            locale={locale}
          />
          <FaqSection
            locale={locale}
            items={mergedCourseFaq}
            pageKey={mergedCourseFaq.length ? undefined : "course"}
          />

          <div className="lg:hidden mt-10">
            <ContactFormFloat />
          </div>
          
          <CoursesSlider
            key={currentId}
            courses={coursesForSlider}
            variant="swiper"
            customTitle={tCourseOther("title")}
            customDescription={tCourseOther("description")}
            autoplayDelayMs={1600}
          />
        </div>
      </BreadcrumbContextWrapper>
    );
  } catch (error) {
    console.error("Error in SingleCoursePage:", error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: ISingleCoursePageProps): Promise<Metadata> {
  try {
    const data = await getCourseDetails(params.slug);
    const locale = params.locale as Locale;

    if (!data) {
      return {
        title: { absolute: "Not Found" },
        description: "The requested course was not found",
        robots: { index: false },
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";

    const canonicalUrl = addTrailingSlash(
      `${baseUrl}/${locale}${courseDetailPath(locale, params.slug)}`
    );

    const azSlug = data.slug?.az || params.slug;
    const enSlug = data.slug?.en || params.slug;
    const rawTitle =
      data.title?.[locale] ??
      data.title?.az ??
      data.title?.en ??
      "Kurs";

    const fullTitle = `${rawTitle} | JET Academy`;

    // Build description ONLY from course.description, with locale fallbacks,
    // and truncate to 160 characters via htmlToDescription
    const rawDescLocale = data.description?.[locale];
    const rawDescAz = data.description?.az;
    const rawDescEn = data.description?.en;

    const rawDesc = rawDescLocale ?? rawDescAz ?? rawDescEn ?? "";

    const cleanDesc = htmlToDescription(rawDesc || "");
    const meta =
      (await getPageMeta(`course:${params.slug}`, locale)) ||
      (locale === "az" && azSlug !== params.slug
        ? await getPageMeta(`course:${azSlug}`, locale)
        : locale === "en" && enSlug !== params.slug
          ? await getPageMeta(`course:${enSlug}`, locale)
          : null);
    const resolvedMeta = meta
      ? {
          title: truncateTitle(meta.title),
          description: truncateDescription(meta.description || cleanDesc),
        }
      : await resolvePageMeta(
          `course:${params.slug}`,
          locale,
          fullTitle,
          cleanDesc
        );

    return {
      title: { absolute: resolvedMeta.title },
      description: resolvedMeta.description,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          az: addTrailingSlash(`${baseUrl}/az${courseDetailPath("az", azSlug)}`),
          en: addTrailingSlash(`${baseUrl}/en${courseDetailPath("en", enSlug)}`),
          ru: addTrailingSlash(`${baseUrl}/ru${courseDetailPath("ru", azSlug)}`),
          "x-default": addTrailingSlash(`${baseUrl}/az${courseDetailPath("az", azSlug)}`),
        },
      },

      openGraph: {
        title: resolvedMeta.title,
        description: resolvedMeta.description,
        url: canonicalUrl,
        type: "website",
        siteName: "JET Academy",
        locale: locale === "az" ? "az_AZ" : "en_US",
        images: [
          {
            url: "/og-image.jpg",
            width: 1200,
            height: 630,
            alt: rawTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: resolvedMeta.title,
        description: resolvedMeta.description,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: { absolute: "Error | JET Academy" },
      description: "Failed to load course details",
      robots: { index: false },
    };
  }
}



export const revalidate = 60;

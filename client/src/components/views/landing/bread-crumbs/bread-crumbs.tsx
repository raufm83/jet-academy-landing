"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Link as I18nLink } from "@/i18n/routing";
import { useBreadcrumbTitle } from "@/hooks/BreadcrumbTitleContext";
import { useEffect, useState } from "react";
import { PostType } from "@/types/enums";
import { coursesListingPath } from "@/utils/course-paths";

interface BreadcrumbsProps {
  dynamicTitle?: string;
}

export default function Breadcrumbs({
  dynamicTitle: propDynamicTitle,
}: BreadcrumbsProps) {
  const { 
    dynamicTitle: contextDynamicTitle, 
    categoryName: contextCategoryName,
    categorySlug: contextCategorySlug,
    postType: contextPostType
  } = useBreadcrumbTitle();
  const finalDynamicTitle = propDynamicTitle ?? contextDynamicTitle ?? null;

  const fullPathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const [singleTitle, setSingleTitle] = useState<string | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<{
    name: string;
    slug: string;
  } | null>(null);

  const pathname = fullPathname.replace(`/${locale}`, "") || "/";
  const segments = pathname.split("/").filter(Boolean);

  const isSinglePage = segments.length === 2;
  const isGlossaryTermPage = segments[0] === "glossary" && segments[1] === "term";
  const isNewsCategoryPage = segments[0] === "news" && segments[1] === "category";
  const isPostSinglePage = isSinglePage && (segments[0] === "news" || segments[0] === "blog" || segments[0] === "offers" || segments[0] === "events");
  const lastIndex = segments.length - 1;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.jetacademy.az";

  useEffect(() => {
    // Only fetch title from API if not provided via context/props
    // For news single pages, title should come from context (BreadcrumbContextWrapper)
    if (isSinglePage && !finalDynamicTitle && segments[lastIndex]) {
      const slug = segments[lastIndex];
      const parentSegment = segments[0];

      // Skip API call for news single pages - title should come from context
      if (isPostSinglePage) {
        return;
      }

      let apiEndpoint = "";

      if (parentSegment === "course") {
        apiEndpoint = `${baseUrl}/api/course/${slug}`;
      } else {
        return;
      }

      fetch(apiEndpoint)
        .then((res) => {
          if (!res.ok) throw new Error(`${parentSegment} not found`);
          return res.json();
        })
        .then((data) => {
          console.log(`${parentSegment} API Response:`, data);
          const title =
            data?.title?.[locale] || data?.title?.az || data?.title || null;
          console.log(`Selected ${parentSegment} title:`, title);
          setSingleTitle(title);
        })
        .catch((error) => {
          console.error(`${parentSegment} API Error:`, error);
          setSingleTitle(null);
        });
    }

    // Fetch category info for glossary term pages
    if (isGlossaryTermPage && segments[lastIndex]) {
      const slug = segments[lastIndex];
      fetch(`${apiUrl}/glossary/slug/${slug}`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("Glossary term not found");
          return res.json();
        })
        .then((data) => {
          if (data?.category?.name && data?.category?.slug) {
            setCategoryInfo({
              name: data.category.name[locale] || data.category.name.az || data.category.name,
              slug: data.category.slug[locale] || data.category.slug.az || data.category.slug,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching glossary term category:", error);
          setCategoryInfo(null);
        });
    }
  }, [isSinglePage, isGlossaryTermPage, isPostSinglePage, finalDynamicTitle, segments, lastIndex, locale, baseUrl, apiUrl]);

  // Hide breadcrumbs in layout for news single pages (they will be rendered in the page itself with proper title)
  // But show breadcrumbs if dynamicTitle is provided as prop (meaning it's called from the page itself)
  if (isPostSinglePage && !propDynamicTitle) {
    return null;
  }

  // Hide breadcrumbs in layout for glossary term pages (they will be rendered in the page itself with proper title)
  // But show breadcrumbs if dynamicTitle is provided as prop (meaning it's called from the page itself)
  if (isGlossaryTermPage && !propDynamicTitle) {
    return null;
  }

  // Hide breadcrumbs in layout for course single pages (they will be rendered in the page itself with proper title)
  // But show breadcrumbs if dynamicTitle is provided as prop (meaning it's called from the page itself)
  const isCourseSinglePage =
    isSinglePage &&
    (segments[0] === "course" ||
      segments[0] === "courses" ||
      segments[0] === "tedris-saheleri");
  if (isCourseSinglePage && !propDynamicTitle) {
    return null;
  }

  const isVacancySinglePage = isSinglePage && segments[0] === "vacancies";
  if (isVacancySinglePage && !propDynamicTitle) {
    return null;
  }

  if (segments.length === 0) return null;

  const translations: Record<string, Record<string, string>> = {
    az: {
      home: "Ana Səhifə",
      courses: "Tədris Sahələri",
      "tedris-saheleri": "Tədris Sahələri",
      course: "Kurs",
      "about-us": "Haqqımızda",
      contact: "Əlaqə",
      gallery: "Qalereya",
      "dersden-goruntuler": "Qalereya",
      glossary: "Texnoloji Lüğət",
      term: "Termin",
      category: "Kateqoriya",
      search: "Axtarış",
      topic: "Mövzu",
      blog: "Bloq",
      blogs: "Bloqlar",
      news: "Xəbərlər",
      event: "Tədbirlər",
      offers: "Kampaniyalar",
      terms: "Terminlər",
      projects: "Rəylər",
      reyler: "Rəylər",
      feedback: "Rəylər",
      "contact-us": "Bizimlə əlaqə",
      vacancies: "Vakansiyalar",
      graduates: "Məzunlar",
    },
    en: {
      home: "Home",
      courses: "Courses",
      "tedris-saheleri": "Courses",
      course: "Course",
      "about-us": "About Us",
      contact: "Contact Us",
      gallery: "Gallery",
      "dersden-goruntuler": "Gallery",
      glossary: "Glossary",
      term: "Term",
      category: "Category",
      search: "Search",
      topic: "Topic",
      blog: "Blog",
      blogs: "Blogs",
      news: "News",
      event: "Events",
      offers: "Special Offers",
      terms: "Terms",
      projects: "Reviews",
      reyler: "Reviews",
      feedback: "Reviews",
      "contact-us": "Contact Us",
      vacancies: "Vacancies",
      graduates: "Graduates",
    },
    ru: {
      home: "Главная",
      courses: "Наши курсы",
      "tedris-saheleri": "Наши курсы",
      course: "Курс",
      "about-us": "О нас",
      contact: "Контакты",
      gallery: "Галерея",
      "dersden-goruntuler": "Галерея",
      glossary: "Глоссарий",
      term: "Термин",
      category: "Категория",
      search: "Поиск",
      topic: "Тема",
      blog: "Блог",
      blogs: "Блоги",
      news: "Новости",
      event: "События",
      offers: "Акции",
      terms: "Термины",
      projects: "Отзывы",
      reyler: "Отзывы",
      feedback: "Отзывы",
      "contact-us": "Связаться с нами",
      vacancies: "Вакансии",
      graduates: "Выпускники",
    },
  };

  const lang = locale as "az" | "en" | "ru";

  /** /blog?tag=… — Ana Səhifə > Axtarış > Mövzu > taq */
  const tagFilter = searchParams.get("tag")?.trim();
  if (segments.length === 1 && segments[0] === "blog" && tagFilter) {
    const t = translations[lang];
    const displayTag = decodeURIComponent(tagFilter);
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 px-3 py-2.5 text-sm text-gray-600"
      >
        <I18nLink
          href="/"
          className="transition-colors hover:text-jsyellow [@media(min-width:3500px)]:text-2xl"
        >
          {t?.home ?? "Home"}
        </I18nLink>
        <span className="select-none text-gray-400" aria-hidden>
          &gt;
        </span>
        <I18nLink
          href="/blog"
          className="transition-colors hover:text-jsyellow [@media(min-width:3500px)]:text-2xl"
        >
          {t?.search ?? "Search"}
        </I18nLink>
        <span className="select-none text-gray-400" aria-hidden>
          &gt;
        </span>
        <I18nLink
          href="/blog"
          className="transition-colors hover:text-jsyellow [@media(min-width:3500px)]:text-2xl"
        >
          {t?.topic ?? "Topic"}
        </I18nLink>
        <span className="select-none text-gray-400" aria-hidden>
          &gt;
        </span>
        <span className="font-semibold text-[#1C1C1C] [@media(min-width:3500px)]:text-2xl">
          {displayTag}
        </span>
      </nav>
    );
  }

  const capitalizeFirstWord = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getSegmentLabel = (segment: string, index: number): string => {
    // For single pages (course, news) - use context title if available
    if (
      isSinglePage &&
      index === lastIndex &&
      (finalDynamicTitle || singleTitle)
    ) {
      return finalDynamicTitle ?? singleTitle ?? "";
    }

    // For glossary term pages - use context title for the last segment (slug)
    if (
      isGlossaryTermPage &&
      index === lastIndex &&
      finalDynamicTitle
    ) {
      return finalDynamicTitle;
    }

    const currentLang = locale as "az" | "en" | "ru";
    const translation = translations[currentLang]?.[segment.toLowerCase()];

    if (translation) {
      return translation;
    }
    const cleanedSegment = decodeURIComponent(segment).replace(/-/g, " ");
    return capitalizeFirstWord(cleanedSegment);
  };

  return (
    <nav className="p-2 text-sm text-gray-700 flex gap-1 items-center flex-wrap">
      <Link
        href="/"
        className="hover:text-jsyellow transition-colors [@media(min-width:3500px)]:text-2xl"
      >
        {translations[lang]?.home ?? "Home"}
      </Link>

      {(() => {
        const isGlossaryCategoryPage = segments[0] === "glossary" && segments[1] === "category";
        // Use context category if available, otherwise use fetched category info
        const categoryName = contextCategoryName || categoryInfo?.name;
        const categorySlug = contextCategorySlug || categoryInfo?.slug;
        const shouldShowCategory = isGlossaryTermPage && categoryName && categoryName.trim() !== "";

        const breadcrumbItems: Array<{
          label: string;
          href: string;
          isLast: boolean;
        }> = [];

        // Add all segments
        segments.forEach((segment, index) => {
          if (!segment) return;

          // Handle course single pages - skip "course" segment but add "courses" link
          const isCourseSinglePage =
            isSinglePage &&
            (segments[0] === "course" ||
              segments[0] === "courses" ||
              segments[0] === "tedris-saheleri");
          if (isCourseSinglePage && index === 0) {
            // Instead of showing "course", show "courses" (Tədris Sahələri)
            const coursesHref =
              locale === "az"
                ? coursesListingPath(locale)
                : `/${locale}${coursesListingPath(locale)}`;
            breadcrumbItems.push({
              label: translations[lang]?.courses ?? "Courses",
              href: coursesHref,
              isLast: false,
            });
            return;
          }

          // Handle news/blog/events/offers single pages - skip segment but add category link based on postType
          if (isPostSinglePage && index === 0) {
            // Add category link based on postType
            if (contextPostType) {
              let categoryLabel = "";
              let categoryHref = "";
              
              switch (contextPostType) {
                case PostType.BLOG:
                  categoryLabel = translations[lang]?.blogs ?? "Blogs";
                  categoryHref = locale === "az" ? "/blog" : `/${locale}/blog`;
                  break;
                case PostType.NEWS:
                  categoryLabel = translations[lang]?.news ?? "News";
                  categoryHref = locale === "az" ? "/news" : `/${locale}/news`;
                  break;
                case PostType.EVENT:
                  categoryLabel = translations[lang]?.event ?? "Events";
                  categoryHref = locale === "az" ? "/events" : `/${locale}/events`;
                  break;
                case PostType.OFFERS:
                  categoryLabel = translations[lang]?.offers ?? "Special Offers";
                  categoryHref = locale === "az" ? "/offers" : `/${locale}/offers`;
                  break;
              }
              
              if (categoryLabel && categoryHref) {
                breadcrumbItems.push({
                  label: categoryLabel,
                  href: categoryHref,
                  isLast: false,
                });
              }
            }
            return;
          }

          // Skip "news" segment on news category pages
          if (isNewsCategoryPage && index === 0) {
            return;
          }

          // Skip "category" segment on news category pages and glossary category pages
          if ((isNewsCategoryPage || isGlossaryCategoryPage) && index === 1) {
            return;
          }

          // Skip "term" segment on glossary term pages
          if (isGlossaryTermPage && index === 1) {
            return;
          }

          // Calculate href, skipping "term", "category", or "news" segments appropriately
          let hrefSegments = segments.slice(0, index + 1);
          if (isNewsCategoryPage) {
            // For news category pages, always include "news" and "category" in href
            // but skip them in display
            if (index === 2) {
              // For the last segment (event/news/blog), include all segments in href
              hrefSegments = segments.slice(0, index + 1);
            } else {
              hrefSegments = [];
            }
          } else if (isGlossaryTermPage && index > 1) {
            hrefSegments = [segments[0], ...segments.slice(2, index + 1)];
          } else if (isGlossaryTermPage && index === 0) {
            hrefSegments = [segments[0]];
          } else if (isGlossaryCategoryPage && index > 1) {
            hrefSegments = [segments[0], ...segments.slice(2, index + 1)];
          } else if (isGlossaryCategoryPage && index === 0) {
            hrefSegments = [segments[0]];
          }

          let href = hrefSegments.length > 0
            ? (locale === "az"
              ? "/" + hrefSegments.join("/")
              : `/${locale}/` + hrefSegments.join("/"))
            : "#";
          if (href !== "#" && href.endsWith("/course")) href = href.replace(/\/course$/, "/courses");
          const label = getSegmentLabel(segment, index);
          const isLast = index === lastIndex;

          // If this is the "glossary" segment and we need to show category, insert category after it
          if (isGlossaryTermPage && index === 0 && shouldShowCategory) {
            breadcrumbItems.push({
              label,
              href,
              isLast: false,
            });
            // Insert category
            const categoryHref = categorySlug
              ? locale === "az"
                ? `/glossary/category/${categorySlug}`
                : `/${locale}/glossary/category/${categorySlug}`
              : locale === "az"
              ? `/glossary`
              : `/${locale}/glossary`;
            breadcrumbItems.push({
              label: categoryName!,
              href: categoryHref,
              isLast: false,
            });
          } else {
            breadcrumbItems.push({
              label,
              href,
              isLast,
            });
          }
        });

        return breadcrumbItems.map((item, idx) => (
          <span key={`${item.href}-${idx}`} className="flex items-center gap-1">
            <span className="text-gray-400 [@media(min-width:3500px)]:text-2xl">
              &gt;
            </span>
            {item.isLast ? (
              <span className="font-semibold text-jsblack [@media(min-width:3500px)]:text-2xl">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-jsyellow transition-colors [@media(min-width:3500px)]:text-2xl"
              >
                {item.label}
              </Link>
            )}
          </span>
        ));
      })()}
    </nav>
  );
}

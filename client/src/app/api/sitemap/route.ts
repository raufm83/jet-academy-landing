import { NextResponse } from "next/server";
import { getAllPosts } from "@/utils/api/post";
import { getAllCourses } from "@/utils/api/course";
import { PostType } from "@/types/enums";
import { courseDetailPath, coursesListingPath } from "@/utils/course-paths";
import { galleryListingPath } from "@/utils/gallery-paths";

function sitemapApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  return raw || "https://api.jetacademy.az/api";
}

type VacancyForSitemap = {
  id: string;
  slug: { az?: string; en?: string };
  updatedAt?: string;
};

async function fetchVacanciesForSitemap(): Promise<VacancyForSitemap[]> {
  try {
    const res = await fetch(`${sitemapApiBase()}/vacancies`, {
      headers: { accept: "*/*" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as VacancyForSitemap[]) : [];
  } catch {
    return [];
  }
}

function vacancySlugForSitemap(
  v: VacancyForSitemap,
  lang: string
): string {
  const s = v.slug || {};
  const raw =
    lang === "en"
      ? s.en || s.az
      : lang === "ru"
        ? s.en || s.az
        : s.az || s.en;
  return ((raw || "").trim() || v.id) as string;
}

interface GlossaryCategory {
  id: string;
  name: {
    az: string;
    en: string;
  };
  slug: {
    az: string;
    en: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface GlossaryTerm {
  id: string;
  term: {
    az: string;
    en: string;
  };
  slug: {
    az: string;
    en: string;
  };
  categoryId: string;
  published: boolean;
  category: {
    name: {
      az: string;
      en: string;
    };
  };
}

async function getGlossaryCategories(): Promise<GlossaryCategory[]> {
  try {
    const response = await fetch(
      "https://api.jetacademy.az/api/glossary-categories?limit=10000",
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch glossary categories: ${response.status}`
      );
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching glossary categories:", error);
    return [];
  }
}

async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  try {
    const response = await fetch(
      "https://api.jetacademy.az/api/glossary/brief?limit=10000",
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch glossary terms: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching glossary terms:", error);
    return [];
  }
}

export async function GET() {
  const languages = ["az", "en", "ru"];
  const baseUrl = "https://jetacademy.az";

  const staticRoutes = [
    "/",
    "/about-us",
    "/contact-us",
    "/news",
    "/blog",
    "/offers",
    "/events",
    "/glossary",
    "/vacancies",
    "/graduates",
  ];

  const feedbackSitemapEntries = [
    { lang: "az", route: "/reyler" },
    { lang: "en", route: "/feedback" },
    { lang: "ru", route: "/feedback" },
  ].map(({ lang, route }) => ({
    url: `${baseUrl}/${lang}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const staticSitemapEntries = staticRoutes.flatMap((route) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${lang}${route === "/" ? "" : route}`,
      lastModified: new Date().toISOString(),
      changeFrequency:
        route === "/news" ||
          route === "/blog" ||
          route === "/glossary" ||
          route === "/offers" ||
          route === "/events" ||
          route === "/vacancies" ||
          route === "/graduates"
          ? "daily"
          : "monthly",
      priority:
        route === "/"
          ? 1
          : route === "/about-us"
            ? 0.8
            : route === "/contact-us"
              ? 0.7
              : route === "/vacancies" || route === "/graduates"
                ? 0.65
              : route === "/news" ||
                route === "/blog" ||
                route === "/glossary" ||
                route === "/offers" ||
                route === "/events"
                ? 0.9
                : 0.5,
    }))
  );
  const localizedCoursesLandingEntries = languages.map((lang) => ({
    url: `${baseUrl}/${lang}${coursesListingPath(lang)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));
  const localizedGalleryLandingEntries = languages.map((lang) => ({
    url: `${baseUrl}/${lang}${galleryListingPath(lang)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const newsSitemapEntries: any[] = [];
  const blogSitemapEntries: any[] = [];
  const offersSitemapEntries: any[] = [];
  const eventsSitemapEntries: any[] = [];
  const courseSitemapEntries: any[] = [];
  const glossaryCategorySitemapEntries: any[] = [];
  const glossaryTermSitemapEntries: any[] = [];
  const vacancySitemapEntries: any[] = [];

  try {
    const [
      newsResponse,
      offersResponse,
      eventsResponse,
      blogsResponse,
      coursesResponse,
      glossaryCategories,
      glossaryTerms,
      vacanciesList,
    ] = await Promise.all([
      getAllPosts({ page: 1, limit: 1000, postType: PostType.NEWS }).catch(
        () => ({ items: [] })
      ),
      getAllPosts({ page: 1, limit: 1000, postType: PostType.OFFERS }).catch(
        () => ({ items: [] })
      ),
      getAllPosts({ page: 1, limit: 1000, postType: PostType.EVENT }).catch(
        () => ({ items: [] })
      ),
      getAllPosts({ page: 1, limit: 1000, postType: PostType.BLOG }).catch(
        () => ({ items: [] })
      ),
      getAllCourses({ page: 1, limit: 1000 }).catch(() => ({ items: [] })),
      getGlossaryCategories(),
      getGlossaryTerms(),
      fetchVacanciesForSitemap(),
    ]);

    for (const lang of languages) {
      // News
      for (const post of newsResponse.items || []) {
        if (post.slug?.[lang as "az" | "en"]) {
          newsSitemapEntries.push({
            url: `${baseUrl}/${lang}/news/${post.slug[lang as "az" | "en"]}`,
            lastModified: new Date(post.updatedAt || new Date()).toISOString(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // Offers
      for (const post of offersResponse.items || []) {
        if (post.slug?.[lang as "az" | "en"]) {
          offersSitemapEntries.push({
            url: `${baseUrl}/${lang}/offers/${post.slug[lang as "az" | "en"]}`,
            lastModified: new Date(post.updatedAt || new Date()).toISOString(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // Events
      for (const post of eventsResponse.items || []) {
        if (post.slug?.[lang as "az" | "en"]) {
          eventsSitemapEntries.push({
            url: `${baseUrl}/${lang}/events/${post.slug[lang as "az" | "en"]}`,
            lastModified: new Date(post.updatedAt || new Date()).toISOString(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // Blogs
      for (const blog of blogsResponse.items || []) {
        if (blog.slug?.[lang as "az" | "en"]) {
          blogSitemapEntries.push({
            url: `${baseUrl}/${lang}/blog/${blog.slug[lang as "az" | "en"]}`,
            lastModified: new Date(blog.updatedAt || new Date()).toISOString(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // Courses
      for (const course of coursesResponse.items || []) {
        if (course.slug?.[lang as "az" | "en"]) {
          courseSitemapEntries.push({
            url: `${baseUrl}/${lang}${courseDetailPath(
              lang,
              course.slug[lang as "az" | "en"]
            )}`,
            lastModified: new Date(
              course.updatedAt || new Date()
            ).toISOString(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }

      // Glossary Categories
      for (const category of glossaryCategories) {
        if (category.slug?.[lang as "az" | "en"]) {
          glossaryCategorySitemapEntries.push({
            url: `${baseUrl}/${lang}/glossary/category/${category.slug[lang as "az" | "en"]
              }`,
            lastModified: new Date(
              category.updatedAt || new Date()
            ).toISOString(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // Glossary Terms
      for (const term of glossaryTerms) {
        if (term.published && term.slug?.[lang as "az" | "en"]) {
          glossaryTermSitemapEntries.push({
            url: `${baseUrl}/${lang}/glossary/term/${term.slug[lang as "az" | "en"]
              }`,
            lastModified: new Date().toISOString(),
            changeFrequency: "monthly",
            priority: 0.6,
          });
        }
      }

      // Vakansiyalar (tək səhifələr)
      for (const v of vacanciesList) {
        const slug = vacancySlugForSitemap(v, lang);
        if (!slug) continue;
        vacancySitemapEntries.push({
          url: `${baseUrl}/${lang}/vacancies/${encodeURIComponent(slug)}`,
          lastModified: new Date(v.updatedAt || new Date()).toISOString(),
          changeFrequency: "weekly",
          priority: 0.65,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching content for sitemap:", error);
  }

  const allEntries = [
    ...staticSitemapEntries,
    ...localizedCoursesLandingEntries,
    ...localizedGalleryLandingEntries,
    ...feedbackSitemapEntries,
    ...newsSitemapEntries,
    ...offersSitemapEntries,
    ...eventsSitemapEntries,
    ...blogSitemapEntries,
    ...courseSitemapEntries,
    ...glossaryCategorySitemapEntries,
    ...glossaryTermSitemapEntries,
    ...vacancySitemapEntries,
  ];

  const xmlSitemap = generateSitemapXml(allEntries);

  return new NextResponse(xmlSitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

function generateSitemapXml(entries: any[]) {
  const xmlItems = entries
    .map((entry) => {
      return `
      <url>
        <loc>${entry.url}</loc>
        <lastmod>${entry.lastModified}</lastmod>
        <changefreq>${entry.changeFrequency}</changefreq>
        <priority>${entry.priority}</priority>
      </url>
    `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${xmlItems}
    </urlset>
  `;
}

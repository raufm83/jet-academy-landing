import { headers } from "next/headers";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildWebPageSchema,
  buildBreadcrumbListSchema,
  buildCourseProductSchema,
  buildDefinedTermSchema,
  buildArticleSchema,
  pathnameToPageKey,
  stripHtmlTags,
  htmlToDescription,
} from "@/utils/seo";
import { getCourseDetails } from "@/utils/api/course";
import { getPostDetails } from "@/utils/api/post";
import { getPostImageSrc } from "@/utils/helpers/post";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://jetacademy.az";

interface PageMetaItem {
  pageKey: string;
  locale: string;
  title?: string | null;
  description?: string | null;
}

async function fetchPageMeta(): Promise<PageMetaItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/page-meta`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchContact(): Promise<Record<string, unknown> | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/contact`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

function findMeta(
  list: PageMetaItem[],
  pageKey: string,
  locale: string
): { title: string | null; description: string | null } {
  const item = list.find(
    (m) => m.pageKey === pageKey && m.locale === locale
  );
  return {
    title: item?.title ?? null,
    description: item?.description ?? null,
  };
}

const PAGE_KEY_NAMES: Record<string, { az: string; en: string }> = {
  courses: { az: "Tədris Sahələri", en: "Courses" },
  blog: { az: "Bloq", en: "Blog" },
  news: { az: "Xəbərlər", en: "News" },
  events: { az: "Tədbirlər", en: "Events" },
  offers: { az: "Kampaniyalar", en: "Special Offers" },
  glossary: { az: "Texnoloji Lüğət", en: "Glossary" },
  "glossary/terms": { az: "Terminlər", en: "Terms" },
  "about-us": { az: "Haqqımızda", en: "About Us" },
  "contact-us": { az: "Bizimlə əlaqə", en: "Contact Us" },
  gallery: { az: "Qalereya", en: "Gallery" },
  projects: { az: "Rəylər", en: "Reviews" },
};

export default async function JsonLdSchema({
  locale,
}: {
  locale: string;
}) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? `/${locale}`;
  const parsed = pathnameToPageKey(pathname);
  const pageLocale = parsed?.locale ?? locale;
  const pageKey = parsed?.pageKey ?? "home";

  const [metaList, contact] = await Promise.all([
    fetchPageMeta(),
    fetchContact(),
  ]);
  const { title: pageTitle, description: pageDescription } = findMeta(
    metaList,
    pageKey,
    pageLocale
  );

  let breadcrumbTitle = pageTitle;
  let courseData: Awaited<ReturnType<typeof getCourseDetails>> = null;
  let termData: { term: Record<string, string>; definition: Record<string, string> } | null = null;
  let postData: Awaited<ReturnType<typeof getPostDetails>> = null;

  if (pageKey.startsWith("course:")) {
    const slug = pageKey.replace("course:", "");
    try {
      courseData = await getCourseDetails(slug);
      const t = courseData?.title as Record<string, string> | undefined;
      breadcrumbTitle = t?.[pageLocale] ?? t?.az ?? t?.en ?? breadcrumbTitle;
    } catch {
      courseData = null;
    }
  }

  if (pageKey.startsWith("glossary-term:")) {
    const slug = pageKey.replace("glossary-term:", "");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/glossary/slug/${slug}`, { next: { revalidate: 60 } });
        if (res.ok) {
          termData = await res.json();
          breadcrumbTitle = termData?.term?.[pageLocale] ?? termData?.term?.az ?? termData?.term?.en ?? breadcrumbTitle;
        }
      } catch {
        termData = null;
      }
    }
  }

  const postKeyMatch = pageKey.match(/^(blog|news|events|offers):(.+)$/);
  if (postKeyMatch) {
    try {
      postData = await getPostDetails(postKeyMatch[2]);
      if (postData?.title) {
        const t = postData.title as unknown as Record<string, string>;
        breadcrumbTitle = t?.[pageLocale] ?? t?.az ?? t?.en ?? breadcrumbTitle;
      }
    } catch {
      postData = null;
    }
  }

  const baseUrl = BASE_URL;
  const pageUrl = pathname.startsWith("/")
    ? `${baseUrl}${pathname}`
    : `${baseUrl}/${pageLocale}${pageKey === "home" ? "" : `/${pageKey}`}`;

  const organization = buildOrganizationSchema(pageLocale, contact ?? null);
  const webSite = buildWebSiteSchema(pageLocale);
  const fallbackName = PAGE_KEY_NAMES[pageKey]?.[pageLocale as "az" | "en"] ?? PAGE_KEY_NAMES[pageKey]?.az;
  const webPageName = breadcrumbTitle || pageTitle || fallbackName || "JET Academy";
  const webPage = buildWebPageSchema({
    name: webPageName,
    description: pageDescription,
    url: pageUrl,
    locale: pageLocale,
    baseUrl,
  });
  const breadcrumbList = buildBreadcrumbListSchema(pathname, breadcrumbTitle);

  const schemas: Record<string, unknown>[] = [
    organization,
    webSite,
    webPage,
    breadcrumbList,
  ];

  if (courseData && pageKey.startsWith("course:")) {
    const slug = pageKey.replace("course:", "");
    schemas.push(
      buildCourseProductSchema(courseData, pageLocale, slug)
    );
  }

  if (termData && pageKey.startsWith("glossary-term:")) {
    const name = termData.term?.[pageLocale] ?? termData.term?.az ?? termData.term?.en ?? "";
    const rawDef = termData.definition?.[pageLocale] ?? termData.definition?.az ?? "";
    const description = rawDef ? stripHtmlTags(String(rawDef)).slice(0, 300) : undefined;
    schemas.push(
      buildDefinedTermSchema({
        name,
        description: description || undefined,
        url: pageUrl,
        locale: pageLocale,
      })
    );
  }

  if (postData && postKeyMatch) {
    const titleObj = postData.title as unknown as Record<string, string>;
    const contentObj = postData.content as unknown as Record<string, string>;
    const headline = titleObj?.[pageLocale] ?? titleObj?.az ?? titleObj?.en ?? "";
    const content = contentObj?.[pageLocale] ?? contentObj?.az ?? contentObj?.en ?? "";
    const imageUrl = getPostImageSrc(postData.imageUrl, pageLocale as "az" | "en");
    const datePublished = postData.createdAt ? new Date(postData.createdAt).toISOString() : undefined;
    const dateModified = postData.updatedAt ? new Date(postData.updatedAt).toISOString() : undefined;
    schemas.push(
      buildArticleSchema({
        headline,
        description: htmlToDescription(content, 160),
        url: pageUrl,
        imageUrl: imageUrl ?? undefined,
        datePublished,
        dateModified,
        locale: pageLocale,
      })
    );
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas),
      }}
    />
  );
}

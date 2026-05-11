/**
 * SEO utility functions for truncating titles and descriptions
 */

/**
 * Truncates a title to a maximum of 60 characters
 * Cuts at the last space before the limit to avoid breaking words
 * @param title - The title to truncate
 * @param maxLength - Maximum length (default: 60)
 * @returns Truncated title
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
  if (!title || title.length <= maxLength) return title;

  const truncated = title.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If we can find a space in the last 20 characters, cut there
  if (lastSpace > maxLength - 20) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
}

/**
 * Truncates a description to a maximum of 160 characters
 * Cuts at the last space before the limit to avoid breaking words
 * @param description - The description to truncate
 * @param maxLength - Maximum length (default: 160)
 * @returns Truncated description
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
  if (!description || description.length <= maxLength) return description;

  const truncated = description.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If we can find a space in the last 30 characters, cut there
  if (lastSpace > maxLength - 30) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
}

/**
 * Strips HTML tags from a string
 * @param html - HTML string to clean
 * @returns Plain text
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Decodes HTML entities
 * @param text - Text with HTML entities
 * @returns Decoded text
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Converts HTML to plain text and truncates description
 * @param html - HTML string
 * @param maxLength - Maximum length (default: 160)
 * @returns Truncated plain text description
 */
export function htmlToDescription(html: string, maxLength: number = 160): string {
  if (!html) return "";
  const plainText = stripHtmlTags(decodeHtmlEntities(html));
  return truncateDescription(plainText, maxLength);
}

// --- JSON-LD Schema (SEO) ---
// EducationalOrganization, WebSite, WebPage, BreadcrumbList, Course, Article, DefinedTerm.
// Əlaqə məlumatı (email, telefon, ünvan) admin paneldən GET /contact ilə gəlir.

const DEFAULT_BASE_URL = "https://jetacademy.az";

function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return DEFAULT_BASE_URL;
}

const BASE_URL = getBaseUrl();

/** Sayt schema sabitləri (JET Academy) */
export const SITE_SCHEMA = {
  name: "JET Academy",
  alternateNames: ["IT və proqramlaşdırma kursları", "Tədris sahələri"],
  baseUrl: BASE_URL,
  /** Logo: public/logos/jetlogo.webp (build skripti PNG-dən yaradır) */
  logoUrl: `${BASE_URL}/logos/jetlogo.webp`,
  description:
    "JET Academy – IT və proqramlaşdırma kursları, praktiki təhsil, peşəkar müəllimlər.",
  slogan: "Daha parlaq gələcək üçün ilham verən təhsil",
  keywords: [
    "IT kursları",
    "proqramlaşdırma",
    "Front-End",
    "Back-End",
    "Full Stack",
    "JET Academy",
    "Azərbaycan",
  ],
  brand: { "@type": "Brand" as const, name: "JET Academy" },
  contact: {
    url: `${BASE_URL}/contact-us`,
  },
  areaServed: { "@type": "Country" as const, name: "Azərbaycan" },
  image: `${BASE_URL}/og-image.jpg`,
} as const;

function getBase(locale: string): string {
  return locale === "az" ? SITE_SCHEMA.baseUrl : `${SITE_SCHEMA.baseUrl}/${locale}`;
}

/** API-dan gələn contact (phone/address Json ola bilər); GET /contact cavabı */
type ContactForSchema = Record<string, unknown> | null;

function contactAddress(contact: ContactForSchema, locale: string): string | undefined {
  if (!contact?.address) return undefined;
  const a = contact.address;
  if (typeof a === "string") return a.trim() || undefined;
  const v = (a as Record<string, string>)?.[locale] ?? (a as Record<string, string>)?.az ?? (a as Record<string, string>)?.en;
  return typeof v === "string" ? v.trim() || undefined : undefined;
}

function contactPhone(contact: ContactForSchema): string | undefined {
  if (!contact?.phone) return undefined;
  const p = contact.phone;
  if (typeof p === "string") return p.trim().replace(/\s/g, "") || undefined;
  const v = (p as Record<string, string>)?.az ?? (p as Record<string, string>)?.en ?? (p as Record<string, string>)?.value;
  return typeof v === "string" ? v.replace(/\s/g, "") || undefined : undefined;
}

/**
 * EducationalOrganization schema – əlaqə məlumatları admin paneldən (GET /contact)
 */
export function buildOrganizationSchema(locale: string, contact?: ContactForSchema): Record<string, unknown> {
  const base = getBase(locale);
  const lang = locale === "az" ? "az" : "en";
  const email = typeof contact?.email === "string" ? contact.email.trim() : undefined;
  const telephone = contactPhone(contact ?? null);
  const streetAddress = contactAddress(contact ?? null, lang) || contactAddress(contact ?? null, "az");
  const addressObj =
    streetAddress
      ? ({ "@type": "PostalAddress" as const, streetAddress })
      : undefined;

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${base}/#organization`,
    name: SITE_SCHEMA.name,
    alternateName: SITE_SCHEMA.alternateNames,
    url: base,
    logo: SITE_SCHEMA.logoUrl,
    description: SITE_SCHEMA.description,
    slogan: SITE_SCHEMA.slogan,
    keywords: SITE_SCHEMA.keywords.join(", "),
    image: SITE_SCHEMA.image,
    brand: SITE_SCHEMA.brand,
    areaServed: SITE_SCHEMA.areaServed,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: SITE_SCHEMA.contact.url,
      availableLanguage: ["Azerbaijani", "English"],
      ...(email && { email }),
      ...(telephone && { telephone }),
    },
    ...(addressObj && { address: addressObj, location: { "@type": "Place" as const, address: addressObj } }),
  };
  return org;
}

/**
 * WebSite schema – sayt üçün SearchAction ilə
 */
export function buildWebSiteSchema(locale: string): Record<string, unknown> {
  const base = getBase(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE_SCHEMA.name,
    alternateName: SITE_SCHEMA.alternateNames,
    url: base,
    description: SITE_SCHEMA.description,
    publisher: { "@id": `${base}/#organization` },
    inLanguage: ["az", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_SCHEMA.baseUrl}/glossary/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * WebPage schema – hər səhifənin name hissəsində title (səhifə başlığı)
 */
export function buildWebPageSchema(params: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  baseUrl: string;
}): Record<string, unknown> {
  const base = `${params.baseUrl.replace(/\/+$/, "")}${params.locale === "az" ? "" : `/${params.locale}`}`;
  const pageUrl = params.url.startsWith("http") ? params.url : `${params.baseUrl}${params.url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: params.name,
    description: params.description ? truncateDescription(params.description) : undefined,
    url: pageUrl,
    inLanguage: params.locale === "az" ? "az" : "en",
    isPartOf: { "@id": `${base}/#website` },
  };
}

/**
 * Pathname-dən (məs: /az/courses və ya /en/course/frontend) pageKey çıxarır.
 * API page-meta ilə uyğun key: home, about-us, courses, course:slug və s.
 */
export function pathnameToPageKey(pathname: string): {
  pageKey: string;
  locale: string;
} | null {
  const normalized = pathname.replace(/^\/+|\/+$/g, "") || "";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return { pageKey: "home", locale: "az" };
  const locale =
    segments[0] === "en"
      ? "en"
      : segments[0] === "ru"
        ? "ru"
        : segments[0] === "az"
          ? "az"
          : "az";
  const rest = segments.slice(1);
  if (rest.length === 0) return { pageKey: "home", locale };
  const first = rest[0];
  const staticKeys: Record<string, string> = {
    "about-us": "about-us",
    courses: "courses",
    "contact-us": "contact-us",
    blog: "blog",
    news: "news",
    events: "events",
    offers: "offers",
    gallery: "gallery",
    "dersden-goruntuler": "gallery",
    projects: "projects",
    reyler: "projects",
    feedback: "projects",
    glossary: "glossary",
    terms: "glossary/terms",
  };
  if (first === "glossary" && rest[1] === "terms") {
    return { pageKey: "glossary/terms", locale };
  }
  if (first === "glossary" && rest[1] === "term" && rest[2]) {
    return { pageKey: `glossary-term:${rest[2]}`, locale };
  }
  if (first === "blog" && rest.length >= 2) return { pageKey: `blog:${rest[1]}`, locale };
  if (first === "news" && rest.length >= 2) return { pageKey: `news:${rest[1]}`, locale };
  if (first === "events" && rest.length >= 2) return { pageKey: `events:${rest[1]}`, locale };
  if (first === "offers" && rest.length >= 2) return { pageKey: `offers:${rest[1]}`, locale };
  if (staticKeys[first]) return { pageKey: staticKeys[first], locale };
  if (first === "course" && rest.length >= 2) {
    return { pageKey: `course:${rest[1]}`, locale };
  }
  return { pageKey: "home", locale };
}

/**
 * BreadcrumbList schema (JSON-LD) – 3cü (son) element səhifə title-dan götürülür
 */
export function buildBreadcrumbListSchema(
  pathname: string,
  pageTitle: string | null
): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const normalized = pathname.replace(/^\/+|\/+$/g, "") || "";
  const segments = normalized.split("/").filter(Boolean);
  const locRaw = segments[0];
  const loc =
    locRaw === "en" ? "en" : locRaw === "ru" ? "ru" : "az";

  const rest = segments.slice(1);
  const prefix = `/${loc}`;
  const itemList: Array<{ "@type": string; name: string; item: string }> = [
    {
      "@type": "ListItem",
      name:
        loc === "az"
          ? "Ana Səhifə"
          : loc === "ru"
            ? "Главная"
            : "Home",
      item: `${baseUrl}${prefix}`,
    },
  ];
  let currentPath = prefix;
  const names: Record<string, string> = {
    courses: loc === "az" ? "Tədris Sahələri" : "Courses",
    blog: loc === "az" ? "Bloq" : "Blog",
    news: loc === "az" ? "Xəbərlər" : "News",
    events: loc === "az" ? "Tədbirlər" : "Events",
    offers: loc === "az" ? "Kampaniyalar" : "Special Offers",
    glossary: loc === "az" ? "Texnoloji Lüğət" : "Glossary",
    terms: loc === "az" ? "Terminlər" : "Terms",
    term: loc === "az" ? "Termin" : "Term",
    /** Rəylər səhifəsi (köhnə /projects dahil — eyni kontent üçün pageKey projects) */
    projects: loc === "az" ? "Rəylər" : loc === "ru" ? "Отзывы" : "Reviews",
    reyler: loc === "az" ? "Rəylər" : loc === "ru" ? "Отзывы" : "Reviews",
    feedback: loc === "az" ? "Rəylər" : loc === "ru" ? "Отзывы" : "Reviews",
    "about-us": loc === "az" ? "Haqqımızda" : "About Us",
    "contact-us": loc === "az" ? "Bizimlə əlaqə" : "Contact Us",
    gallery: loc === "az" ? "Qalereya" : "Gallery",
    "dersden-goruntuler": loc === "az" ? "Qalereya" : "Gallery",
  };
  for (let i = 0; i < rest.length; i++) {
    const seg = rest[i];
    const isCourseSingle = seg === "course" && rest[i + 1];
    if (isCourseSingle) {
      currentPath = `${prefix}/courses`;
      itemList.push({ "@type": "ListItem", name: names.courses, item: `${baseUrl}${currentPath}` });
      currentPath = `${prefix}/course/${rest[i + 1]}`;
      itemList.push({ "@type": "ListItem", name: pageTitle || rest[i + 1], item: `${baseUrl}${currentPath}` });
      i++;
      continue;
    }
    const pathSegment = seg;
    currentPath = currentPath ? `${currentPath}/${pathSegment}` : `/${pathSegment}`;
    const isLast = i === rest.length - 1;
    const name = isLast && pageTitle ? pageTitle : (names[seg] ?? seg);
    itemList.push({ "@type": "ListItem", name, item: `${baseUrl}${currentPath}` });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itemList.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: { "@type": "WebPage" as const, "@id": item.item },
    })),
  };
}

/**
 * BreadcrumbList – items massivi ilə (səhifələrdən ötürülə bilər)
 */
export function buildBreadcrumbListFromItems(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: { "@type": "WebPage" as const, "@id": item.url },
    })),
  };
}

/**
 * Course səhifəsi – @type ["Course", "Product"], provider = EducationalOrganization
 */
export function buildCourseSchema(params: {
  name: string;
  description?: string;
  url: string;
  locale: string;
  imageUrl?: string | null;
}): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  let image: string | undefined;
  if (params.imageUrl?.trim()) {
    const img = params.imageUrl.trim();
    if (img.startsWith("http")) {
      image = img;
    } else {
      const uploadsBase =
        (process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/, "") ||
        (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") + "/uploads-acad";
      image = uploadsBase ? `${uploadsBase}/${img.replace(/^\//, "")}` : `${baseUrl}/${img.replace(/^\//, "")}`;
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": ["Course", "Product"],
    name: params.name,
    description: params.description,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_SCHEMA.name,
      "@id": `${baseUrl}/#organization`,
    },
    url: params.url,
    inLanguage: params.locale === "az" ? "az" : "en",
    ...(image && { image }),
  };
}

/**
 * Article – bloq/xəbər/kampaniya/tədbir single səhifələri üçün
 */
export function buildArticleSchema(params: {
  headline: string;
  description?: string;
  url: string;
  imageUrl?: string | null;
  datePublished?: string;
  dateModified?: string;
  locale: string;
  author?: { name: string; url?: string } | null;
}): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const image =
    params.imageUrl?.trim()
      ? { "@type": "ImageObject" as const, url: params.imageUrl.trim() }
      : undefined;
  const author = params.author
    ? params.author.url
      ? { "@type": "Person" as const, name: params.author.name, url: params.author.url }
      : { "@type": "Person" as const, name: params.author.name }
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    name: params.headline,
    description: params.description,
    image,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    inLanguage: params.locale === "az" ? "az" : "en",
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE_SCHEMA.name,
      "@id": `${baseUrl}/#organization`,
    },
    ...(author && { author }),
  };
}

/**
 * Glossary tək termin səhifəsi – DefinedTerm
 */
export function buildDefinedTermSchema(params: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
}): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: params.name,
    description: params.description ?? undefined,
    url: params.url,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: SITE_SCHEMA.name + " Texnoloji Lüğət",
      url: `${baseUrl}/${params.locale}/glossary/terms`,
    },
  };
}

/** @deprecated buildCourseSchema istifadə edin */
export function buildCourseProductSchema(
  course: { title?: Record<string, string>; description?: Record<string, string>; imageUrl?: string | null; slug?: Record<string, string> },
  locale: string,
  slug: string
): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const title = course?.title?.[locale] ?? course?.title?.az ?? course?.title?.en ?? "";
  const desc = course?.description?.[locale] ?? course?.description?.az ?? "";
  const plainDesc = typeof desc === "string" ? stripHtmlTags(desc).slice(0, 200) : "";
  const url = locale === "az" ? `${baseUrl}/course/${slug}` : `${baseUrl}/${locale}/course/${slug}`;
  return buildCourseSchema({
    name: title,
    description: plainDesc,
    url,
    locale,
    imageUrl: course?.imageUrl ?? undefined,
  });
}
export const trimMetaTitle = truncateTitle;
export const trimMetaDescription = truncateDescription;

export function addTrailingSlash(url: string): string {
  const [baseWithQuery, hash = ""] = url.split("#");
  const [basePath, query = ""] = baseWithQuery.split("?");
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;

  return `${normalizedBasePath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

/**
 * Rəylər səhifəsi: /az/reyler və /en/feedback (və /ru/feedback) kimi fərqli path-lər üçün hreflang.
 */
export function buildAlternatesFeedbacks(
  locale: string,
  base?: string,
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const baseUrl = (base || getBaseUrl()).replace(/\/$/, "");
  const pathAz = "/reyler";
  const pathIntl = "/feedback";
  const url = (loc: string, pathSeg: string) =>
    addTrailingSlash(`${baseUrl}/${loc}${pathSeg}`);
  const pathFor = (loc: string) => (loc === "az" ? pathAz : pathIntl);
  const canonical = url(locale, pathFor(locale));

  return {
    canonical,
    languages: {
      az: url("az", pathAz),
      en: url("en", pathIntl),
      ru: url("ru", pathIntl),
      "x-default": url("az", pathAz),
    },
  };
}

/**
 * Builds a consistent canonical URL and hreflang alternates object for Next.js metadata.
 *
 * URL convention:
 *   - az            → https://jetacademy.az/az/{path}
 *   - en            → https://jetacademy.az/en/{path}
 *   - x-default     → https://jetacademy.az/{path}
 *
 * @param path   - Page path WITHOUT locale prefix, e.g. "/courses" or "/course/frontend"
 * @param locale - Current page locale ("az" | "en")
 * @param base   - Override base URL (defaults to NEXT_PUBLIC_APP_URL)
 */
export function buildAlternates(
  path: string,
  locale: string,
  base?: string
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const baseUrl = (base || getBaseUrl()).replace(/\/$/, "");
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;

  const localeUrl = (loc: string) => addTrailingSlash(`${baseUrl}/${loc}${normalizedPath}`);
  const xDefaultUrl = normalizedPath
    ? addTrailingSlash(`${baseUrl}${normalizedPath}`)
    : `${baseUrl}/`;

  return {
    canonical: localeUrl(locale),
    languages: {
      az: localeUrl("az"),
      en: localeUrl("en"),
      "x-default": xDefaultUrl,
    },
  };
}

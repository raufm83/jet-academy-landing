/**
 * JSON-LD schema builders for JET Academy.
 *
 * Architecture:
 *   - Every public page renders ONE <script type="application/ld+json"> with a single @graph
 *   - The @graph always starts with Organization + WebSite nodes (shared identity)
 *   - Each page adds its own containers: WebPage/AboutPage/ContactPage/CollectionPage/ItemPage
 *     + BreadcrumbList + domain entity (Course, Article, Event, Product, DefinedTerm …)
 *   - Containers reference each other via @id only (no duplication)
 *
 * Rule: WebPage, BreadcrumbList, and ItemList are SEPARATE containers in the @graph.
 */

const BASE_URL = (
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://jetacademy.az"
).replace(/\/+$/, "");

export const SITE = {
  name: "JET Academy",
  alternateNames: ["IT və proqramlaşdırma kursları", "Tədris sahələri"],
  baseUrl: BASE_URL,
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
  image: `${BASE_URL}/og-image.jpg`,
  contactUrl: `${BASE_URL}/contact-us`,
  schemaAddress: {
    az: "Bakı şəhəri",
    en: "Baku city",
  },
} as const;

type Lang = "az" | "en";
const getLang = (locale: string): Lang => (locale === "en" ? "en" : "az");
const getBase = (locale: string) =>
  locale === "az" ? SITE.baseUrl : `${SITE.baseUrl}/${locale}`;

function n(url: string): string {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

// ─── Reusable nodes ──────────────────────────────────────────────

export function orgNode(
  locale: string,
  contact?: { email?: string; phone?: string } | null
): Record<string, unknown> {
  const base = getBase(locale);
  const lang = getLang(locale);
  const streetAddress = SITE.schemaAddress[lang];
  const address = streetAddress
    ? { "@type": "PostalAddress" as const, streetAddress }
    : undefined;

  return {
    "@type": "EducationalOrganization",
    "@id": `${base}/#organization`,
    name: SITE.name,
    alternateName: SITE.alternateNames,
    url: base,
    logo: SITE.logoUrl,
    description: SITE.description,
    slogan: SITE.slogan,
    image: SITE.image,
    brand: { "@type": "Brand", name: SITE.name },
    areaServed: { "@type": "Country", name: "Azərbaycan" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: SITE.contactUrl,
      availableLanguage: ["Azerbaijani", "English"],
      ...(contact?.email?.trim() && { email: contact.email.trim() }),
      ...(contact?.phone?.trim() && { telephone: contact.phone.trim() }),
    },
    ...(address && {
      address,
      location: { "@type": "Place", address },
    }),
  };
}

export function webSiteNode(locale: string): Record<string, unknown> {
  const base = getBase(locale);
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE.name,
    alternateName: SITE.alternateNames,
    url: base,
    description: SITE.description,
    publisher: { "@id": `${base}/#organization` },
    inLanguage: [getLang(locale)],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.baseUrl}/glossary/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function breadcrumbNode(
  id: string,
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    "@id": n(id),
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: {
        "@type": "WebPage",
        "@id": n(item.url),
        url: n(item.url),
        name: item.name,
      },
    })),
  };
}

function wrap(locale: string, ...nodes: Record<string, unknown>[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [orgNode(locale), webSiteNode(locale), ...nodes],
  };
}

// ─── Page-level graph builders ───────────────────────────────────

/** Homepage: WebPage + BreadcrumbList */
export function homePageGraph(p: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;

  return wrap(
    p.locale,
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      about: { "@id": `${base}/#organization` },
      breadcrumb: { "@id": bcId },
    }
  );
}

/** About page: AboutPage + BreadcrumbList */
export function aboutPageGraph(p: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;

  return wrap(
    p.locale,
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage", "AboutPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": `${base}/#organization` },
      breadcrumb: { "@id": bcId },
    }
  );
}

/** Contact page: ContactPage + BreadcrumbList */
export function contactPageGraph(p: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  streetAddress?: string;
  email?: string;
  telephone?: string;
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const address = p.streetAddress
    ? { "@type": "PostalAddress" as const, streetAddress: p.streetAddress }
    : undefined;

  return wrap(
    p.locale,
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage", "ContactPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE.name,
        url: base,
        ...(address && { address }),
        ...(p.email && { email: p.email }),
        ...(p.telephone && { telephone: p.telephone }),
      },
      breadcrumb: { "@id": bcId },
    }
  );
}

/** Collection / listing page: CollectionPage + BreadcrumbList + ItemList (separate) */
export function collectionPageGraph(p: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  itemList?: { name: string; url: string }[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const itemListId = `${url}#itemlist`;

  const nodes: Record<string, unknown>[] = [
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage", "CollectionPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      breadcrumb: { "@id": bcId },
      ...(p.itemList?.length ? { mainEntity: { "@id": itemListId } } : {}),
    },
  ];

  if (p.itemList?.length) {
    nodes.push({
      "@type": "ItemList",
      "@id": itemListId,
      itemListElement: p.itemList.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: n(item.url),
      })),
    });
  }

  return wrap(p.locale, ...nodes);
}

/** Generic static page: WebPage + BreadcrumbList (gallery, projects etc.) */
export function staticPageGraph(p: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;

  return wrap(
    p.locale,
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      breadcrumb: { "@id": bcId },
    }
  );
}

/** Course single: ItemPage + BreadcrumbList + Course (separate) */
export function coursePageGraph(p: {
  name: string;
  description?: string;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  imageUrl?: string;
  tags?: string[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const courseId = `${url}#course`;

  return wrap(
    p.locale,
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage", "ItemPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": courseId },
      breadcrumb: { "@id": bcId },
    },
    {
      "@type": "Course",
      "@id": courseId,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      provider: {
        "@type": "EducationalOrganization",
        "@id": `${base}/#organization`,
        name: SITE.name,
        url: base,
      },
      ...(p.imageUrl && { image: { "@type": "ImageObject", url: p.imageUrl } }),
      ...(p.tags?.length && { teaches: p.tags.join(", ") }),
    }
  );
}

/** Blog single: WebPage + BreadcrumbList + Article/BlogPosting (separate) */
export function blogSingleGraph(p: {
  headline: string;
  description?: string;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  imageUrl?: string | null;
  datePublished?: string;
  dateModified?: string;
  author?: { name: string; url?: string } | null;
  wordCount?: number;
  keywords?: string[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const articleId = `${url}#article`;
  const imageId = `${url}#primaryimage`;
  const authorId = `${url}#author`;
  const orgId = `${base}/#organization`;
  const hasImage = Boolean(p.imageUrl?.trim());
  const hasAuthor = Boolean(p.author?.name?.trim());

  const nodes: Record<string, unknown>[] = [
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage"],
      "@id": `${url}#webpage`,
      name: p.headline,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": articleId },
      breadcrumb: { "@id": bcId },
      ...(hasImage && { primaryImageOfPage: { "@id": imageId } }),
    },
    {
      "@type": ["Article", "BlogPosting"],
      "@id": articleId,
      headline: p.headline,
      name: p.headline,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      mainEntityOfPage: { "@id": `${url}#webpage` },
      publisher: { "@id": orgId },
      datePublished: p.datePublished ?? undefined,
      dateModified: p.dateModified ?? p.datePublished ?? undefined,
      ...(hasAuthor && { author: { "@id": authorId } }),
      ...(hasImage && { image: { "@id": imageId } }),
      ...(p.wordCount && { wordCount: p.wordCount }),
      ...(p.keywords?.length && { keywords: p.keywords.join(", ") }),
      articleSection: "Blog",
    },
  ];

  if (hasAuthor) {
    nodes.push({
      "@type": "Person",
      "@id": authorId,
      name: p.author!.name!.trim(),
      ...(p.author!.url && { url: p.author!.url }),
    });
  }

  if (hasImage) {
    nodes.push({
      "@type": "ImageObject",
      "@id": imageId,
      url: p.imageUrl!,
      contentUrl: p.imageUrl!,
    });
  }

  return wrap(p.locale, ...nodes);
}

/** News single: WebPage + BreadcrumbList + NewsArticle (separate) */
export function newsSingleGraph(p: {
  headline: string;
  description?: string;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  imageUrl?: string | null;
  datePublished?: string;
  dateModified?: string;
  author?: { name: string } | null;
  wordCount?: number;
  keywords?: string[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const articleId = `${url}#newsarticle`;
  const imageId = `${url}#primaryimage`;
  const authorId = `${url}#author`;
  const orgId = `${base}/#organization`;
  const hasImage = Boolean(p.imageUrl?.trim());
  const hasAuthor = Boolean(p.author?.name?.trim());

  const nodes: Record<string, unknown>[] = [
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage"],
      "@id": `${url}#webpage`,
      name: p.headline,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": articleId },
      breadcrumb: { "@id": bcId },
      ...(hasImage && { primaryImageOfPage: { "@id": imageId } }),
    },
    {
      "@type": ["Article", "NewsArticle"],
      "@id": articleId,
      headline: p.headline,
      name: p.headline,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      mainEntityOfPage: { "@id": `${url}#webpage` },
      publisher: { "@id": orgId },
      datePublished: p.datePublished ?? undefined,
      dateModified: p.dateModified ?? p.datePublished ?? undefined,
      ...(hasAuthor && { author: { "@id": authorId } }),
      ...(hasImage && { image: { "@id": imageId } }),
      ...(p.wordCount && { wordCount: p.wordCount }),
      ...(p.keywords?.length && { keywords: p.keywords.join(", ") }),
    },
  ];

  if (hasAuthor) {
    nodes.push({ "@type": "Person", "@id": authorId, name: p.author!.name!.trim() });
  }
  if (hasImage) {
    nodes.push({ "@type": "ImageObject", "@id": imageId, url: p.imageUrl!, contentUrl: p.imageUrl! });
  }

  return wrap(p.locale, ...nodes);
}

/** Event single: WebPage + BreadcrumbList + Event (separate) */
export function eventSingleGraph(p: {
  name: string;
  description?: string;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  imageUrl?: string | null;
  startDate?: string;
  endDate?: string;
  locationAddress?: string | null;
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const lang = getLang(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const eventId = `${url}#event`;
  const placeId = `${url}#place`;
  const imageId = `${url}#primaryimage`;
  const orgId = `${base}/#organization`;
  const hasImage = Boolean(p.imageUrl?.trim());
  const streetAddress = p.locationAddress?.trim() || SITE.schemaAddress[lang];

  const nodes: Record<string, unknown>[] = [
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: lang,
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": eventId },
      breadcrumb: { "@id": bcId },
      ...(hasImage && { primaryImageOfPage: { "@id": imageId } }),
    },
    {
      "@type": "Event",
      "@id": eventId,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: lang,
      location: { "@id": placeId },
      organizer: { "@id": orgId },
      ...(p.startDate && { startDate: p.startDate }),
      ...(p.endDate && { endDate: p.endDate }),
      ...(hasImage && { image: { "@id": imageId } }),
    },
    {
      "@type": "Place",
      "@id": placeId,
      name: SITE.name,
      address: { "@type": "PostalAddress", streetAddress },
    },
  ];

  if (hasImage) {
    nodes.push({ "@type": "ImageObject", "@id": imageId, url: p.imageUrl!, contentUrl: p.imageUrl! });
  }

  return wrap(p.locale, ...nodes);
}

/** Offers single: WebPage + BreadcrumbList + Product + Offer (separate) */
export function offerSingleGraph(p: {
  name: string;
  description?: string;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
  imageUrl?: string | null;
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const productId = `${url}#product`;
  const offerId = `${url}#offer`;
  const imageId = `${url}#primaryimage`;
  const orgId = `${base}/#organization`;
  const hasImage = Boolean(p.imageUrl?.trim());

  const nodes: Record<string, unknown>[] = [
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage"],
      "@id": `${url}#webpage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": productId },
      breadcrumb: { "@id": bcId },
      ...(hasImage && { primaryImageOfPage: { "@id": imageId } }),
    },
    {
      "@type": "Product",
      "@id": productId,
      name: p.name,
      description: p.description ?? undefined,
      url,
      brand: { "@id": orgId },
      offers: { "@id": offerId },
      ...(hasImage && { image: { "@id": imageId } }),
    },
    {
      "@type": "Offer",
      "@id": offerId,
      url,
      itemOffered: { "@id": productId },
      seller: { "@id": orgId },
      availability: "https://schema.org/InStock",
    },
  ];

  if (hasImage) {
    nodes.push({ "@type": "ImageObject", "@id": imageId, url: p.imageUrl!, contentUrl: p.imageUrl! });
  }

  return wrap(p.locale, ...nodes);
}

/** Glossary term single: ItemPage + BreadcrumbList + DefinedTerm (separate) */
export function glossaryTermGraph(p: {
  name: string;
  description?: string | null;
  url: string;
  locale: string;
  breadcrumbItems: { name: string; url: string }[];
}): Record<string, unknown> {
  const base = getBase(p.locale);
  const url = n(p.url);
  const bcId = `${url}#breadcrumb`;
  const termId = `${url}#term`;
  const termSetUrl = `${base}/glossary/terms`;

  return wrap(
    p.locale,
    breadcrumbNode(bcId, p.breadcrumbItems),
    {
      "@type": ["WebPage", "ItemPage"],
      "@id": `${url}#itempage`,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      isPartOf: { "@id": `${base}/#website` },
      mainEntity: { "@id": termId },
      breadcrumb: { "@id": bcId },
    },
    {
      "@type": "DefinedTerm",
      "@id": termId,
      name: p.name,
      description: p.description ?? undefined,
      url,
      inLanguage: getLang(p.locale),
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: `${SITE.name} Texnoloji Lüğət`,
        url: n(termSetUrl),
      },
    }
  );
}

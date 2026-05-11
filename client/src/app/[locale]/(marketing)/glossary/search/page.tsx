import GlossarySearch from "@/components/views/landing/glossary/glossary-search";
import GlossaryTermList from "@/components/views/landing/glossary/glossary-term-list";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { truncateTitle, truncateDescription, buildAlternates } from "@/utils/seo";
import { staticPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";

interface SearchParams {
  q?: string;
  page?: string;
}

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const query = searchParams.q || "";

  const rawPageTitle = query
    ? t("glossarySearchResultsTitle", { query }) ||
      `"${query}" üçün axtarış nəticələri | JET Academy`
    : t("glossarySearchPageTitle") || "Axtarış | JET Academy";

  const alternates = buildAlternates("/glossary/search", locale, baseUrl);

  const rawDescription =
    t("glossarySearchDescription") ||
    "JET Academy glossariy lüğətində axtarış edin";

  const title = truncateTitle(rawPageTitle);
  const description = truncateDescription(rawDescription);

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
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function searchGlossaryTerms(query: string, page = 1, limit = 24) {
  if (!query.trim()) {
    return { items: [], meta: { total: 0, page: 1, limit, totalPages: 0 } };
  }

  try {
    const params = new URLSearchParams();
    params.append("q", query.trim());
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary/search?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to search glossary terms");
    }

    return res.json();
  } catch (error) {
    console.error("Error searching glossary terms:", error);
    return { items: [], meta: { total: 0, page: 1, limit, totalPages: 0 } };
  }
}

export default async function GlossarySearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const locale = params.locale;
  const cookieStore = cookies();
  const language = locale || cookieStore.get("NEXT_LOCALE")?.value || "az";

  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1", 10);

  const { items: terms, meta } = await searchGlossaryTerms(query, page);

  const translations = {
    az: {
      title: query ? `"${query}" üçün axtarış nəticələri` : "Axtarış",
      noQueryTitle: "Axtarış",
      categoryText: "Kateqoriya",
      emptyText: "Axtarışınıza uyğun termin tapılmadı",
      searchPlaceholder: "Termin axtar...",
    },
    en: {
      title: query ? `Search results for "${query}"` : "Search",
      noQueryTitle: "Search",
      categoryText: "Category",
      emptyText: "No terms found for your search",
      searchPlaceholder: "Search term...",
    },
  };

  const t = translations[language as keyof typeof translations];

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const searchSchema = staticPageGraph({
    name: locale === "az" ? "Axtarış" : "Search",
    description: locale === "az" ? "Glossariy axtarışı" : "Glossary search",
    url: `${base}/glossary/search`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Texnoloji Lüğət" : "Glossary", url: `${base}/glossary` },
      { name: locale === "az" ? "Axtarış" : "Search", url: `${base}/glossary/search` },
    ],
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <JsonLd data={searchSchema} />
      <GlossarySearch
        placeholderText={t.searchPlaceholder}
        initialQuery={query}
      />

      <GlossaryTermList
        terms={terms}
        title={query ? t.title : t.noQueryTitle}
        categoryText={t.categoryText}
        language={language}
        emptyText={t.emptyText}
      />

      {/* Pagination component could be added here */}
      {meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          {/* Your pagination component */}
        </div>
      )}
    </div>
  );
}

import GlossaryPagination from "@/components/views/landing/glossary/glossary-pagination";
import GlossaryTermList from "@/components/views/landing/glossary/glossary-term-list";
import GlossaryTermFilter from "@/components/views/landing/glossary/glossary-term-filter";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const glossaryT = await getTranslations({
    locale,
    namespace: "glossary.terms",
  });

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az").replace(/\/$/, "");

  const alternates = buildAlternates(
    `/glossary/terms`,
    locale,
    baseUrl
  );

  const rawPageTitle = t("glossaryTermsPageTitle") || "Bütün Terminlər | JET Academy";

  const rawDescription =
    glossaryT("description") ||
    "JET Academy glossariy lüğətində bütün IT terminləri";

  const pageKey = "glossary/terms";
  const { title, description } = await resolvePageMeta(
    pageKey,
    locale,
    rawPageTitle,
    rawDescription
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
      },
    },
  };
}

interface SearchParams {
  search?: string;
  categoryId?: string;
  page?: string;
}

async function getGlossaryTerms(search?: string, categoryId?: string, page = 1, limit = 24) {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("sortBy", "createdAt");
    params.append("order", "desc");

    if (search) params.append("search", search);
    if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch glossary terms");
    }

    return res.json();
  } catch (error) {
    console.error("Error loading glossary terms:", error);
    return { items: [], meta: { total: 0, page: 1, limit, totalPages: 0 } };
  }
}

async function getGlossaryCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/glossary-categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error loading glossary categories:", error);
    return [];
  }
}

export default async function GlossaryTermsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const cookieStore = cookies();
  const language = locale || cookieStore.get("NEXT_LOCALE")?.value || "az";

  const search = searchParams.search;
  const categoryId = searchParams.categoryId;
  const page = parseInt(searchParams.page || "1", 10);

  const [{ items: terms, meta }, categories] = await Promise.all([
    getGlossaryTerms(search, categoryId, page),
    getGlossaryCategories(),
  ]);

  if (search && terms && terms.length > 0) {
    const searchLower = search.toLowerCase();
    terms.sort((a: any, b: any) => {
      const aTerm = a.term?.[language]?.toLowerCase() || "";
      const bTerm = b.term?.[language]?.toLowerCase() || "";
      const aStarts = aTerm.startsWith(searchLower) ? -1 : 1;
      const bStarts = bTerm.startsWith(searchLower) ? -1 : 1;
      if (aStarts !== bStarts) {
        return aStarts - bStarts;
      }
      return 0;
    });
  }

  const glossaryT = await getTranslations({
    locale: language,
    namespace: "glossary.terms",
  });
  const paginationT = await getTranslations({
    locale: language,
    namespace: "glossary.pagination",
  });

  const title = glossaryT("title") || (locale === "az" ? "Terminlər" : "Terms");
  const searchPlaceholder = glossaryT("searchPlaceholder") || (locale === "az" ? "Axtarış..." : "Search...");
  const allCategoriesText = glossaryT("allCategories") || (locale === "az" ? "Bütün Kateqoriyalar" : "All Categories");

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const schema = collectionPageGraph({
    name: locale === "az" ? "Terminlər" : "Terms",
    description: locale === "az" ? "Bütün IT terminləri" : "All IT terms",
    url: `${base}/glossary/terms`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Texnoloji Lüğət" : "Glossary", url: `${base}/glossary` },
      { name: locale === "az" ? "Terminlər" : "Terms", url: `${base}/glossary/terms` },
    ],
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <JsonLd data={schema} />

      <GlossaryTermFilter
        categories={categories}
        initialSearch={search}
        initialCategoryId={categoryId}
        searchPlaceholder={searchPlaceholder}
        allCategoriesText={allCategoriesText}
        language={language}
      />

      <GlossaryTermList
        terms={terms}
        title={title}
        categoryText={glossaryT("categoryText")}
        language={language}
        emptyText={glossaryT("emptyText")}
      />

      {meta.totalPages > 1 && (
        <GlossaryPagination
          currentPage={page}
          totalPages={meta.totalPages}
          previousText={paginationT("previous")}
          nextText={paginationT("next")}
        />
      )}
    </div>
  );
}

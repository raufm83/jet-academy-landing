import GlossaryAlphabetNav from "@/components/views/landing/glossary/glossary-alphabet-nav";
import GlossaryPagination from "@/components/views/landing/glossary/glossary-pagination";
import GlossaryTermList from "@/components/views/landing/glossary/glossary-term-list";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";

const normalizeLetter = (letter?: string) =>
  letter?.replace(/\/+$/, "") || undefined;

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { letter?: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const glossaryT = await getTranslations({
    locale,
    namespace: "glossary.terms",
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const letter = normalizeLetter(searchParams.letter);

  const qs = new URLSearchParams();
  if (letter) qs.set("letter", letter);
  const queryString = qs.toString() ? `?${qs}` : "";

  const alternates = buildAlternates(
    `/glossary/terms${queryString}`,
    locale,
    baseUrl
  );

  const rawPageTitle = letter
    ? t("glossaryTermsLetterPageTitle", { letter }) ||
      `"${letter}" ilə başlayan terminlər | JET Academy`
    : t("glossaryTermsPageTitle") || "Bütün Terminlər | JET Academy";

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
  letter?: string;
  page?: string;
}

async function getGlossaryTerms(letter?: string, page = 1, limit = 24) {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (letter) params.append("letter", letter);

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

export default async function GlossaryTermsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const cookieStore = cookies();
  const language = locale || cookieStore.get("NEXT_LOCALE")?.value || "az";

  const letter = normalizeLetter(searchParams.letter);
  const page = parseInt(searchParams.page || "1", 10);

  const { items: terms, meta } = await getGlossaryTerms(letter, page);

  const glossaryT = await getTranslations({
    locale: language,
    namespace: "glossary.terms",
  });
  const paginationT = await getTranslations({
    locale: language,
    namespace: "glossary.pagination",
  });

  const title = letter
    ? `"${letter}" ilə başlayan terminlər`
    : glossaryT("title");

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

      <GlossaryAlphabetNav language={language} allText={glossaryT("allText")} />

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

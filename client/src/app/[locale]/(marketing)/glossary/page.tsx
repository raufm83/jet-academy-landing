import GlossaryPage from "@/components/views/landing/glossary/glossary-page";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const glossaryT = await getTranslations({ locale, namespace: "glossary" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/glossary", locale, baseUrl);

  const rawTitle = t("glossaryPageTitle") || "Glossariy | JET Academy";
  const rawDescription =
    glossaryT("subtitle") || "IT və proqramlaşdırma terminləri lüğəti";

  const { title, description } = await resolvePageMeta(
    "glossary",
    locale,
    rawTitle,
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

async function getGlossaryCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary-categories`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch glossary categories");
    }

    return res.json();
  } catch (error) {
    console.error("Error loading glossary categories:", error);
    return [];
  }
}

export default async function GlossaryIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const cookieStore = cookies();
  const language = locale || cookieStore.get("NEXT_LOCALE")?.value || "az";

  const categories = await getGlossaryCategories();
  const glossaryT = await getTranslations({
    locale: language,
    namespace: "glossary",
  });

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const schema = collectionPageGraph({
    name: locale === "az" ? "Texnoloji Lüğət" : "Glossary",
    description: locale === "az" ? "IT və proqramlaşdırma terminləri lüğəti" : "IT and programming terms glossary",
    url: `${base}/glossary`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Texnoloji Lüğət" : "Glossary", url: `${base}/glossary` },
    ],
  });

  return (
    <>
    <JsonLd data={schema} />
    <GlossaryPage
      categories={categories}
      language={language}
      title={glossaryT("title")}
      subtitle={glossaryT("subtitle")}
      searchPlaceholder={glossaryT("searchPlaceholder")}
      allTermsText={glossaryT("allTermsText")}
      categoriesTitle={glossaryT("categoriesTitle")}
      termsText={glossaryT("termsText")}
      emptyText={glossaryT("emptyText")}
    />
    <FaqSection pageKey="glossary" locale={locale} />
    </>
  );
}

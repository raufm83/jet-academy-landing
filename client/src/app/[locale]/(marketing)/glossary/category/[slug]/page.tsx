import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import GlossaryTermList from "@/components/views/landing/glossary/glossary-term-list";
import { getTranslations } from "next-intl/server";
import { truncateTitle, truncateDescription, buildAlternates } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";

  let categoryName = "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary-categories/slug/${slug}`
    );
    if (res.ok) {
      const category = await res.json();
      categoryName = category.name[locale] || "";
    }
  } catch (error) {
    console.error("Error fetching category:", error);
  }

  const rawPageTitle = categoryName
    ? `${categoryName} | Glossariy | JET Academy`
    : "Glossariy Kateqoriyası | JET Academy";
  const alternates = buildAlternates(`/glossary/category/${slug}`, locale, baseUrl);

  const rawDescription =
    t("glossaryCategoryDescription", { category: categoryName }) ||
    `JET Academy glossariy lüğətində ${categoryName} kateqoriyasına aid terminlər`;

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

async function getGlossaryCategory(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary-categories/slug/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch glossary category");
    }

    return res.json();
  } catch (error) {
    console.error("Error loading glossary category:", error);
    throw error;
  }
}

async function getTermsByCategory(categoryId: string, page = 1, limit = 24) {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/glossary/category/${categoryId}?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch glossary terms");
    }

    return res.json();
  } catch (error) {
    console.error("Error loading glossary terms by category:", error);
    return { items: [], meta: { total: 0, page: 1, limit, totalPages: 0 } };
  }
}

export default async function GlossaryCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const cookieStore = cookies();
  const language = cookieStore.get("NEXT_LOCALE")?.value || "az";

  const page = parseInt(searchParams.page || "1", 10);

  let category;
  try {
    category = await getGlossaryCategory(params.slug);
  } catch (error) {
    console.error("Error fetching glossary category:", error);
    notFound();
  }

  const { items: terms, meta } = await getTermsByCategory(category.id, page);

  const translations = {
    az: {
      title: `${category.name[language]} kateqoriyası`,
      categoryText: "Kateqoriya",
      emptyText: "Bu kateqoriyada termin tapılmadı",
      searchPlaceholder: "Termin axtar...",
    },
    en: {
      title: `Category ${category.name[language]}`,
      categoryText: "Category",
      emptyText: "No terms found in this category",
      searchPlaceholder: "Search term...",
    },
  };

  const t = translations[language as keyof typeof translations];

  const locale = params.locale;
  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const catName = category.name[language] || params.slug;
  const catSchema = collectionPageGraph({
    name: catName,
    description: locale === "az"
      ? `${catName} kateqoriyasına aid terminlər`
      : `Terms in ${catName} category`,
    url: `${base}/glossary/category/${params.slug}`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Texnoloji Lüğət" : "Glossary", url: `${base}/glossary` },
      { name: catName, url: `${base}/glossary/category/${params.slug}` },
    ],
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <JsonLd data={catSchema} />

      <GlossaryTermList
        terms={terms}
        categoryName={category.name[language]}
        title={t.title}
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

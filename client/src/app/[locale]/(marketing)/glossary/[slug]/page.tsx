import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import GlossaryTermDetail from "@/components/views/landing/glossary/glossary-term-detail";
import { truncateTitle, htmlToDescription, buildAlternates } from "@/utils/seo";
import { staticPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const cookieStore = cookies();
  const language = cookieStore.get("NEXT_LOCALE")?.value || "az";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const locale = language === "en" ? "en" : "az";

  try {
    const term = await getGlossaryTerm(params.slug);

    const rawTitle = `${term.term[language]}`;
    const rawDescription = term.definition[language] || "";

    const title = truncateTitle(rawTitle);
    const description = htmlToDescription(rawDescription);

    return {
      title,
      description,
      alternates: buildAlternates(`/glossary/term/${params.slug}`, locale, baseUrl),
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Glossary Term | JET Academy",
      description: "IT terminology glossary",
    };
  }
}

async function getGlossaryTerm(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary/slug/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch glossary term");
    }

    return res.json();
  } catch (error) {
    console.error("Error loading glossary term:", error);
    throw error;
  }
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const locale = params.locale;
  const cookieStore = cookies();
  const language = locale || cookieStore.get("NEXT_LOCALE")?.value || "az";

  let term;
  try {
    term = await getGlossaryTerm(params.slug);
  } catch (error) {
    console.error("Error fetching glossary term:", error);
    notFound();
  }

  const termContent = term.term[language];
  const definitionContent = term.definition[language];

  const categoryName = term.category?.name[language];
  const categorySlug = term.category?.slug[language];

  const translations = {
    az: {
      categoryText: "Kateqoriya",
      relatedTermsText: "Əlaqəli terminlər",
      buttonText: "PDF formatında yüklə",
      loadingText: "Hazırlanır..."
    },
    en: {
      categoryText: "Category",
      relatedTermsText: "Related Terms",
      buttonText: "Download as PDF",
      loadingText: "Preparing..."
    },
  };

  const t = translations[language as keyof typeof translations];

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const redirectSchema = staticPageGraph({
    name: termContent || params.slug,
    description: htmlToDescription(definitionContent || ""),
    url: `${base}/glossary/${params.slug}`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Texnoloji Lüğət" : "Glossary", url: `${base}/glossary` },
      { name: termContent || params.slug, url: `${base}/glossary/${params.slug}` },
    ],
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <JsonLd data={redirectSchema} />
      <GlossaryTermDetail
        term={termContent}
        definition={definitionContent}
        categoryName={categoryName}
        categorySlug={categorySlug}
        relatedTerms={term.relatedTermsData || []}
        categoryText={t.categoryText}
        relatedTermsText={t.relatedTermsText}
        language={language}
        buttonText={t.buttonText}
        loadingText={t.loadingText}
      />
    </div>
  );
}

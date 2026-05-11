import GlossaryTermDetail from "@/components/views/landing/glossary/glossary-term-detail";
import PostAuthorCard from "@/components/views/landing/post/author-card";
import CoursesSlider from "@/components/views/landing/home/courses";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAllCourses } from "@/utils/api/course";
import { getContact } from "@/utils/api/contact";
import BreadcrumbContextWrapper from "@/hooks/BreadcrumbContextWrapper";
import { truncateTitle, htmlToDescription, buildAlternates } from "@/utils/seo";
import Breadcrumbs from "@/components/views/landing/bread-crumbs/bread-crumbs";
import { glossaryTermGraph, SITE } from "@/data/site-schema";
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
  const { locale, slug } = params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";

  let termName = "";
  let termDefinition = "";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary/slug/${slug}`
    );
    if (res.ok) {
      const term = await res.json();
      termName = term.term[locale] || "";
      termDefinition = term.definition[locale] || "";
    }
  } catch (error) {
    console.error("Error fetching term:", error);
  }

  const rawPageTitle = locale == "az" ? termName + " " + t("whats") : locale == "en" ? t("whats") + " " + termName + "?"  : "Glossariy Termini | JET Academy";
  const alternates = buildAlternates(`/glossary/term/${slug}`, locale, baseUrl);

  const rawDescription =
    termDefinition ||
    t("glossaryTermDefaultDescription") ||
    "IT və proqramlaşdırma termini haqqında məlumat";

  const title = truncateTitle(rawPageTitle);
  const description = htmlToDescription(rawDescription);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "article",
      locale: locale === "az" ? "az_AZ" : "en_US",
      alternateLocale: locale === "az" ? "en_US" : "az_AZ",
    },
    twitter: {
      card: "summary",
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

async function getGlossaryTerm(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/glossary/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch glossary term");
    return res.json();
  } catch (error) {
    console.error("Error loading glossary term:", error);
    throw error;
  }
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { locale, slug } = params;
  const cookieStore = cookies();
  const language = locale || cookieStore.get("NEXT_LOCALE")?.value || "az";

  let term;
  try {
    term = await getGlossaryTerm(slug);
  } catch (error) {
    console.error("Error loading glossary term:", error);
    notFound();
  }

  const termContent = term.term[language];
  const definitionContent = term.definition[language];
  const categoryName = term.category?.name[language];
  const categorySlug = term.category?.slug[language];

  const [glossaryT, courses] = await Promise.all([
    getTranslations({ locale: language, namespace: "glossary.term" }),
    getAllCourses({ includeUnpublished: false }),
  ]);
  const contact = await getContact().catch(() => ({} as Record<string, unknown>));

  const rawPhone = contact?.phone;
  const phoneForPdf = (() => {
    if (!rawPhone) return "";
    if (typeof rawPhone === "string") return rawPhone.trim();
    if (typeof rawPhone === "number") return String(rawPhone);
    if (typeof rawPhone === "object" && rawPhone !== null) {
      const obj = rawPhone as Record<string, unknown>;
      const val = obj.az ?? obj.en ?? obj.value ?? "";
      return typeof val === "string" ? val.trim() : String(val || "");
    }
    return "";
  })();

  const pdfButtonText = language === "az" ? "PDF formatında yüklə" : "Download as PDF";

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const termDescription = htmlToDescription(definitionContent || "");
  const termSchema = glossaryTermGraph({
    name: termContent,
    description: termDescription,
    url: `${base}/glossary/term/${slug}`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Texnoloji Lüğət" : "Glossary", url: `${base}/glossary` },
      { name: locale === "az" ? "Terminlər" : "Terms", url: `${base}/glossary/terms` },
      { name: termContent, url: `${base}/glossary/term/${slug}` },
    ],
  });

  return (
    <BreadcrumbContextWrapper 
      title={termContent}
      categoryName={categoryName}
      categorySlug={categorySlug}
    >
      <JsonLd data={termSchema} />
      <div className="container pt-4 flex flex-wrap justify-between items-center gap-4">
        <Breadcrumbs dynamicTitle={termContent} />
        
        {/* <DownloadPdfButton
          term={termContent}
          definition={definitionContent}
          buttonText={pdfButtonText}
        /> */}
      </div>

      <div className="container flex flex-col gap-8 lg:gap-4 mx-auto px-4 py-12">
        <GlossaryTermDetail
          term={termContent}
          definition={definitionContent}
          categoryName={categoryName}
          categorySlug={categorySlug}
          relatedTerms={term.relatedTermsData || []}
          categoryText={glossaryT("categoryText")}
          relatedTermsText={glossaryT("relatedTermsText")}
          language={language}
          buttonText={pdfButtonText}
          loadingText={glossaryT("loadingPdf")}
          phoneForPdf={phoneForPdf}
        />

        {term.author?.role !== "AUTHOR" && term.author && (
          <PostAuthorCard
            author={term.author}
            authorLabel={language === "az" ? "Müəllif" : "Author"}
            locale={language === "az" ? "az" : "en"}
          />
        )}

        <CoursesSlider
          courses={courses}
          variant="swiper"
          customTitle={language === "az" ? "IT sahəsini öyrənməyə başla" : "Start learning IT today"}
          customDescription=""
        />
      </div>
    </BreadcrumbContextWrapper>
  );
}

export const revalidate = 60;
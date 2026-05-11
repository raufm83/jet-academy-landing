import React from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale } from "@/i18n/request";
import { getActiveVacancies } from "@/utils/api/vacancy";
import VacancyCard from "@/components/views/landing/vacancy/vacancy-card";
import MarketingEmptyState from "@/components/shared/marketing-empty-state";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import JsonLd from "@/components/seo/json-ld";
import { collectionPageGraph, SITE } from "@/data/site-schema";

/** API deploy zamanı əlçatan olmaya bilər — statik build xətası olmasın */
export const revalidate = 60;

function vacancySlugForSchema(
  v: { slug: { az: string; en?: string | null; ru?: string | null }; id: string },
  locale: Locale
): string {
  const s = v.slug;
  const raw =
    locale === "en"
      ? s.en || s.az
      : locale === "ru"
        ? s.az || s.en
        : s.az || s.en;
  return ((raw || "").trim() || v.id) as string;
}

interface VacanciesPageProps {
  params: { locale: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations("vacancies");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/vacancies", locale, baseUrl);

  const { title, description } = await resolvePageMeta(
    "vacancies",
    locale,
    t("metaTitle"),
    t("metaDescription")
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
      locale: locale === "az" ? "az_AZ" : locale === "ru" ? "ru_RU" : "en_US",
    },
  };
}

export default async function VacanciesPage({ params, searchParams }: VacanciesPageProps) {
  setRequestLocale(params.locale);
  const locale = params.locale as Locale;
  const currentPage = Number(searchParams.page) || 1;

  const [t, data] = await Promise.all([
    getTranslations("vacancies"),
    getActiveVacancies(currentPage, 12),
  ]);

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;

  const schema = collectionPageGraph({
    name: t("title"),
    description: t("description"),
    url: `${base}/vacancies`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : locale === "ru" ? "Главная" : "Home", url: base },
      { name: t("title"), url: `${base}/vacancies` },
    ],
    itemList: data.items.map((v) => ({
      name: v.title[locale] || v.title.az,
      url: `${base}/vacancies/${encodeURIComponent(vacancySlugForSchema(v, locale))}`,
    })),
  });

  const hasItems = data.items.length > 0;

  return (
    <section className="relative w-full min-w-0 overflow-visible pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-14">
      <JsonLd data={schema} />

      <div className="container relative z-[1]">
        <header className="mb-7 px-4 py-5 text-center sm:mb-9 md:mb-10 md:py-6">
          <h1 className="mb-4 font-bold text-[#1F2937] text-3xl sm:text-4xl md:text-[2.5rem] tracking-tight">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-[15px] leading-relaxed text-[#5c5c5c] sm:text-base md:text-lg">
            {t("description")}
          </p>
        </header>

        {hasItems ? (
          <ul className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {data.items.map((vacancy) => (
              <li key={vacancy.id} className="flex min-h-0 h-full min-w-0">
                <VacancyCard vacancy={vacancy} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <MarketingEmptyState
            compact
            imageSrc="/images/no-vacancies.svg"
            imageAlt=""
            title={t("emptyTitle")}
          />
        )}
      </div>
    </section>
  );
}

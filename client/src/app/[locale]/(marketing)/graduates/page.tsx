import React from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale } from "@/i18n/request";
import { getGraduatesPublic } from "@/utils/api/graduate";
import GraduateCard from "@/components/views/landing/graduates/graduate-card";
import MarketingEmptyState from "@/components/shared/marketing-empty-state";
import { buildAlternates } from "@/utils/seo";
import JsonLd from "@/components/seo/json-ld";
import { staticPageGraph, SITE } from "@/data/site-schema";
import FaqSection from "@/components/views/landing/faq/faq-section";

export const revalidate = 60;

interface GraduatesPageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params,
}: GraduatesPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations("graduates");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/graduates", locale, baseUrl);

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates,
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: alternates.canonical,
      type: "website",
      locale: locale === "az" ? "az_AZ" : "en_US",
    },
  };
}

export default async function GraduatesPage({ params }: GraduatesPageProps) {
  setRequestLocale(params.locale);
  const locale = params.locale as Locale;

  const [t, graduates] = await Promise.all([
    getTranslations("graduates"),
    getGraduatesPublic(),
  ]);

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;

  const schema = staticPageGraph({
    name: t("title"),
    description: t("description"),
    url: `${base}/graduates`,
    locale,
    breadcrumbItems: [
      {
        name: locale === "az" ? "Ana Səhifə" : "Home",
        url: base,
      },
      { name: t("title"), url: `${base}/graduates` },
    ],
  });

  return (
    <section className="relative w-full min-w-0 overflow-hidden bg-transparent pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20">
      <JsonLd data={schema} />

      <div className="container relative z-[1]">
        <header className="mb-10 px-4 py-6 text-center sm:mb-12 md:mb-14 md:py-8">
          <h1 className="mb-4 font-bold text-[#1F2937] text-3xl sm:text-4xl md:text-[2.5rem] tracking-tight">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-[15px] leading-relaxed text-[#5c5c5c] sm:text-base md:text-lg">
            {t("description")}
          </p>
        </header>

        {graduates.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-10">
            {graduates.map((graduate, index) => (
              <GraduateCard
                key={graduate.id}
                graduate={graduate}
                locale={locale}
                loadEager={index === 0}
              />
            ))}
          </div>
        ) : (
          <MarketingEmptyState compact title={t("noGraduates")} />
        )}
      </div>

      <FaqSection pageKey="graduates" locale={locale} />
    </section>
  );
}

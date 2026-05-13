import React from "react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Locale } from "@/i18n/request";
import { getVacancyDetail } from "@/utils/api/vacancy";
import { htmlToDescription, buildAlternates } from "@/utils/seo";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";
import { getFaqByPage } from "@/utils/api/faq";
import BreadcrumbContextWrapper from "@/hooks/BreadcrumbContextWrapper";
import Breadcrumbs from "@/components/views/landing/bread-crumbs/bread-crumbs";
import { SITE } from "@/data/site-schema";
import { hasVisibleHtml, pickMultilingualHtml } from "@/utils/multilingual-html";
import { MdCalendarToday, MdTrendingUp, MdWorkOutline } from "react-icons/md";

export const dynamic = "force-dynamic";

interface VacancySinglePageProps {
  params: { slug: string; locale: string };
}

function formatDeadline(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function normalizeEmploymentType(value?: string | null): string {
  const v = (value || "").trim();
  if (!v) return "—";
  return v
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function defaultValidThrough(datePosted: string): string {
  const base = new Date(datePosted);
  if (Number.isNaN(base.getTime())) {
    const y = new Date().getFullYear();
    return `${y + 1}-12-31`;
  }
  const d = new Date(base);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export async function generateMetadata({ params }: VacancySinglePageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const [vacancy, t] = await Promise.all([
    getVacancyDetail(params.slug),
    getTranslations("vacancies"),
  ]);

  if (!vacancy) return { title: "Not Found" };

  const vacancyName = vacancy.title[locale] || vacancy.title.az;
  const title = t("cardTitle", { name: vacancyName });
  const description = htmlToDescription(vacancy.description[locale] || vacancy.description.az);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates(`/vacancies/${params.slug}`, locale, baseUrl);

  return {
    title: `${title} | JET Academy`,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "article",
    },
  };
}

export default async function VacancySinglePage({ params }: VacancySinglePageProps) {
  setRequestLocale(params.locale);
  const locale = params.locale as Locale;

  const [t, vacancy, faqItems] = await Promise.all([
    getTranslations("vacancies"),
    getVacancyDetail(params.slug),
    getFaqByPage("vacancies"),
  ]);

  if (!vacancy) notFound();

  const vacancyName = vacancy.title[locale] || vacancy.title.az;
  const title = t("cardTitle", { name: vacancyName });
  const description = vacancy.description[locale] || vacancy.description.az;
  const requirementsHtml = pickMultilingualHtml(vacancy.requirements, locale);
  const workConditionsHtml = pickMultilingualHtml(
    vacancy.workConditions,
    locale
  );
  const careerEmail = t("careerEmail");
  const aboutTitle =
    locale === "en"
      ? "About this role"
      : locale === "ru"
        ? "О вакансии"
        : "İş Haqqında";
  const experienceText =
    (vacancy.jobLevel?.[locale === "en" ? "en" : "az"] || vacancy.jobLevel?.az || "").trim() || "—";
  const employmentType = normalizeEmploymentType(vacancy.employmentType);
  const deadlineText = formatDeadline(vacancy.deadline);

  let remainingDays: number | null = null;
  if (vacancy.deadline) {
    const dl = new Date(vacancy.deadline);
    if (!Number.isNaN(dl.getTime())) {
      remainingDays = Math.ceil((dl.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
  }

  const validThrough =
    vacancy.deadline && !Number.isNaN(new Date(vacancy.deadline).getTime())
      ? new Date(vacancy.deadline).toISOString().slice(0, 10)
      : defaultValidThrough(vacancy.createdAt);

  const jobPostingSchema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: vacancyName,
    description,
    datePosted: vacancy.createdAt,
    validThrough,
    employmentType: vacancy.employmentType || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "JET Academy",
      sameAs: SITE.baseUrl,
      logo: `${SITE.baseUrl}/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Olimpiya küçəsi 6A",
        addressLocality: "Baku",
        addressRegion: "Baku",
        postalCode: "AZ1000",
        addressCountry: "AZ",
      },
    },
  };

  return (
    <BreadcrumbContextWrapper title={title}>
      <JsonLd data={jobPostingSchema} />

      <div className="w-full min-w-0 bg-transparent">
        <section className="w-full min-w-0 pb-16 pt-6 sm:pb-20 sm:pt-8 md:pt-10">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 [@media(min-width:2500px)]:px-24">
            <div className="mx-auto mb-6 w-full max-w-4xl">
              <Breadcrumbs dynamicTitle={title} />
            </div>

            <article
              className="
                mx-auto w-full max-w-4xl overflow-hidden rounded-3xl
                border border-slate-200/90 bg-white
                shadow-[0_12px_48px_rgba(21,96,189,0.12)]
              "
            >
              <header className="bg-jsyellow px-5 py-6 sm:px-8 sm:py-8">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                    {t("badgeLabel")}
                  </span>
                  {remainingDays !== null && remainingDays >= 0 && remainingDays <= 7 && (
                    <span className="inline-flex items-center rounded-full bg-red-500/95 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      {remainingDays === 0
                        ? locale === "en"
                          ? "Last day!"
                          : locale === "ru"
                            ? "Последний день!"
                            : "Son gün!"
                        : locale === "en"
                          ? `${remainingDays} day${remainingDays > 1 ? "s" : ""} left`
                          : locale === "ru"
                            ? `Осталось ${remainingDays} дн.`
                            : `${remainingDays} gün qalıb`}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-[2rem]">
                  {title}
                </h1>
              </header>

              <div className="flex flex-col gap-5 border-b border-neutral-200 bg-white px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-6">
                <div className="flex min-w-0 items-center gap-3 sm:max-w-[33%] sm:flex-1">
                  <MdCalendarToday
                    className="shrink-0 text-2xl text-jsyellow"
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-[#1F2937]">{deadlineText}</p>
                </div>
                <div className="flex min-w-0 items-center gap-3 sm:max-w-[33%] sm:flex-1">
                  <MdWorkOutline className="shrink-0 text-2xl text-jsyellow" aria-hidden />
                  <p className="text-sm font-semibold text-[#1F2937]">{employmentType}</p>
                </div>
                <div className="flex min-w-0 items-center gap-3 sm:max-w-[33%] sm:flex-1">
                  <MdTrendingUp className="shrink-0 text-2xl text-jsyellow" aria-hidden />
                  <p className="text-sm font-semibold text-[#1F2937]">{experienceText}</p>
                </div>
              </div>

              <section className="border-b border-neutral-200 px-5 py-8 sm:px-8 sm:py-10">
                <h2 className="mb-4 text-lg font-bold text-[#111827] sm:text-xl">{aboutTitle}</h2>
                <div
                  className="prose max-w-none text-base leading-relaxed text-neutral-700 prose-p:my-3 prose-headings:text-[#111827] prose-a:text-jsyellow prose-li:marker:text-jsyellow"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </section>

              {hasVisibleHtml(requirementsHtml) ? (
                <section className="border-b border-neutral-200 px-5 py-8 sm:px-8 sm:py-10">
                  <h2 className="mb-4 text-lg font-bold text-[#111827] sm:text-xl">
                    {t("requirementsTitle")}
                  </h2>
                  <div
                    className="prose max-w-none text-base leading-relaxed text-neutral-700 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:marker:text-jsyellow prose-a:text-jsyellow"
                    dangerouslySetInnerHTML={{ __html: requirementsHtml }}
                  />
                </section>
              ) : null}

              {hasVisibleHtml(workConditionsHtml) ? (
                <section className="border-b border-neutral-200 px-5 py-8 sm:px-8 sm:py-10">
                  <h2 className="mb-4 text-lg font-bold text-[#111827] sm:text-xl">
                    {t("workConditionsTitle")}
                  </h2>
                  <div
                    className="prose max-w-none text-base leading-relaxed text-neutral-700 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:marker:text-jsyellow prose-a:text-jsyellow"
                    dangerouslySetInnerHTML={{ __html: workConditionsHtml }}
                  />
                </section>
              ) : null}

              <footer className="px-5 py-8 text-center sm:px-8 sm:py-10">
                <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[#4B5563] sm:text-base">
                  {t("cvCtaBefore")}{" "}
                  <a
                    href={`mailto:${careerEmail}`}
                    className="font-semibold text-jsyellow underline decoration-jsyellow/50 underline-offset-[3px] hover:opacity-90"
                  >
                    {careerEmail}
                  </a>{" "}
                  {t("cvCtaAfter", { vacancyName })}
                </p>
              </footer>
            </article>

            {faqItems.length > 0 && (
              <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
                <FaqSection items={faqItems} locale={locale} />
              </div>
            )}
          </div>
        </section>
      </div>
    </BreadcrumbContextWrapper>
  );
}

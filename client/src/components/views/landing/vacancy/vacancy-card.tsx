"use client";

import React from "react";
import { MdArrowForward, MdCalendarToday, MdTrendingUp, MdWorkOutline } from "react-icons/md";
import { useTranslations } from "next-intl";
import { Vacancy } from "@/types/vacancy";
import { Locale } from "@/i18n/request";
import { Link } from "@/i18n/routing";

interface VacancyCardProps {
  vacancy: Vacancy;
  locale: Locale;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

/** Plain text: if longer than `maxChars`, cut at a word boundary and add `...`. */
function truncateWithEllipsis(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  let cut = t.slice(0, maxChars).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxChars * 0.55)) {
    cut = cut.slice(0, lastSpace).trimEnd();
  }
  return cut.length > 0 ? `${cut}...` : `${t.slice(0, maxChars)}...`;
}

function pickSlug(v: Vacancy, locale: Locale): string {
  const s = v.slug;
  const raw =
    locale === "en"
      ? s.en || s.az
      : locale === "ru"
        ? s.az || s.en
        : s.az || s.en;
  const slug = (raw || "").trim();
  return slug || v.id;
}

function formatDeadline(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function getRemainingDays(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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

export default function VacancyCard({ vacancy, locale }: VacancyCardProps) {
  const t = useTranslations("vacancies");
  const normalizedLocale: "az" | "en" = locale === "en" ? "en" : "az";
  const title = vacancy.title[locale] || vacancy.title.az;
  const description = vacancy.description[locale] || vacancy.description.az;
  const slug = pickSlug(vacancy, locale);
  const cleanDescription = stripHtml(description);
  const preview = truncateWithEllipsis(cleanDescription, 250);
  const deadlineText = formatDeadline(vacancy.deadline);
  const remainingDays = getRemainingDays(vacancy.deadline);
  const employmentType = normalizeEmploymentType(vacancy.employmentType);
  const experienceText =
    (vacancy.jobLevel?.[normalizedLocale] || vacancy.jobLevel?.az || "").trim();

  return (
    <Link
      href={`/vacancies/${encodeURIComponent(slug)}`}
      className="
        group relative flex h-full min-h-[520px] w-full flex-col overflow-hidden rounded-3xl
        border border-slate-200/90 bg-white
        shadow-[0_12px_40px_rgba(21,96,189,0.1)]
        transition-all duration-300
        hover:border-jsyellow/25 hover:shadow-[0_18px_48px_rgba(21,96,189,0.14)]
      "
    >
      {/* Sabit ən azı böyük başlıq zonası — badge/title sətirləri dəyişsə də blok hündürlüyü sabit qalır */}
      <div className="relative flex min-h-[132px] flex-shrink-0 flex-col bg-jsyellow px-5 pt-4 pb-5 sm:min-h-[140px] sm:px-6 sm:pt-5 sm:pb-6">
        <div className="mb-3 flex min-h-[1.75rem] flex-wrap items-center gap-2">
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
        <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-snug text-white sm:min-h-[3.125rem] sm:text-xl">
          {title}
        </h3>
      </div>

      {/* Təsvir + meta + CTA: təsvir bloku sabit hündürlük (line-clamp-3 üçün) */}
      <div className="relative flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <div className="h-[4.6875rem] shrink-0 overflow-hidden sm:h-[5.0625rem]">
          <p className="line-clamp-3 text-[13px] leading-relaxed text-[#5c5c5c] sm:text-sm">
            {preview || "\u00A0"}
          </p>
        </div>

        <div className="mt-4 flex flex-shrink-0 flex-col gap-2.5">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-100/95 px-3.5 py-2.5 text-left">
            <MdCalendarToday
              className="shrink-0 text-xl text-jsyellow"
              aria-hidden
            />
            <p className="min-w-0 text-xs font-semibold leading-tight text-[#374151] sm:text-sm">
              {deadlineText ?? "—"}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-neutral-100/95 px-3.5 py-2.5 text-left">
            <MdWorkOutline
              className="shrink-0 text-xl text-jsyellow"
              aria-hidden
            />
            <p className="min-w-0 text-xs font-semibold leading-tight text-[#374151] sm:text-sm">
              {employmentType}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-neutral-100/95 px-3.5 py-2.5 text-left">
            <MdTrendingUp
              className="shrink-0 text-xl text-jsyellow"
              aria-hidden
            />
            <p className="min-w-0 text-xs font-semibold leading-tight text-[#374151] sm:text-sm">
              {experienceText || "—"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5 sm:pt-6">
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-jsyellow px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform duration-200 group-hover:-translate-y-px sm:text-sm">
              {t("applyNow")}
              <MdArrowForward size={18} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

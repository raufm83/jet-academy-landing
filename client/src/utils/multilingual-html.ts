import type { Locale } from "@/i18n/request";

/** Çoxdilli HTML blokundan cari dil üçün mətn (boşdursa digər dilə keçir). */
export function pickMultilingualHtml(
  block: { az?: string | null; en?: string | null } | null | undefined,
  locale: Locale
): string {
  if (!block || typeof block !== "object") return "";
  const az = String(block.az ?? "").trim();
  const en = String(block.en ?? "").trim();
  if (locale === "en") return en || az;
  if (locale === "ru") return az || en;
  return az || en;
}

/** Quill və s. üçün: yalnız boş tag/br/qalırsa false. */
export function hasVisibleHtml(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

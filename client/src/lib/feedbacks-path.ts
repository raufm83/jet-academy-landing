/**
 * Rəylər (student projects / feedbacks) səhifəsinin URL segmenti — dilə görə fərqlidir.
 * next-intl Link href-ləri locale prefiksi olmadan verilir (/reyler, /feedback).
 */
export function feedbacksPathSegment(locale: string): "reyler" | "feedback" {
  return locale === "az" ? "reyler" : "feedback";
}

/** Məs: az → "/reyler", en/ru → "/feedback" */
export function feedbacksPageHref(locale: string): string {
  return `/${feedbacksPathSegment(locale)}`;
}

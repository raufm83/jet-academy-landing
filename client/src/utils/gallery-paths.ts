import { Locale } from "@/i18n/request";

type SupportedLocale = "az" | "en" | "ru";

function normalizeLocale(locale?: string | Locale): SupportedLocale {
  const l = (locale || "az").slice(0, 2).toLowerCase();
  if (l === "en") return "en";
  if (l === "ru") return "ru";
  return "az";
}

export function galleryListingPath(locale?: string | Locale): string {
  return normalizeLocale(locale) === "az"
    ? "/dersden-goruntuler"
    : "/gallery";
}

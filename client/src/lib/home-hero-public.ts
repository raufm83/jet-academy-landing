import type { Locale } from "@/i18n/request";
import { getApiBaseURL } from "@/utils/api/api-base-url";

/** API `GET /home-hero-public` — yalnız AZ və EN */
export type HeroLocales = {
  az: string;
  en: string;
};

export type HomeHeroPublic = {
  contentHtml: HeroLocales;
  imageAlt: HeroLocales;
  imageUrl: string | null;
};

export function pickHeroLocale(
  block: Partial<HeroLocales> | null | undefined,
  locale: Locale
): string {
  if (!block || typeof block !== "object") return "";
  const az = String(block.az ?? "").trim();
  const en = String(block.en ?? "").trim();
  if (locale === "en") return en || az;
  /** RU üçün ayrıca CMS yoxdur — EN, sonra AZ */
  if (locale === "ru") return en || az;
  return az || en;
}

const NULL_BODY = "null";

export async function getPublicHomeHero(): Promise<HomeHeroPublic | null> {
  const base = getApiBaseURL().replace(/\/$/, "");
  if (!base) return null;
  try {
    const res = await fetch(`${base}/home-hero-public`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim() === "" || text.trim() === NULL_BODY) return null;
    const data = JSON.parse(text) as HomeHeroPublic | null;
    if (data === null) return null;
    if (typeof data !== "object" || !("contentHtml" in data)) return null;
    return data;
  } catch {
    return null;
  }
}

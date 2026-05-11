import type { Locale } from "@/i18n/request";
import { getApiBaseURL } from "@/utils/api/api-base-url";

export type AboutLocales = { az: string; en: string };

export type AboutPagePublic = {
  introTitle: AboutLocales;
  introDescription1: AboutLocales;
  introDescription2: AboutLocales;
  introDescription3: AboutLocales;
  introImageUrl: string | null;
  introImageAlt: AboutLocales;
  missionSectionTitle: AboutLocales;
  missionTitle: AboutLocales;
  missionDescription: AboutLocales;
  visionTitle: AboutLocales;
  visionDescription: AboutLocales;
  missionVisionImageUrl: string | null;
  missionVisionImageAlt: AboutLocales;
};

export function pickAboutLocale(
  block: Partial<AboutLocales> | null | undefined,
  locale: Locale
): string {
  if (!block || typeof block !== "object") return "";
  const az = String(block.az ?? "").trim();
  const en = String(block.en ?? "").trim();
  if (locale === "en") return en || az;
  if (locale === "ru") return en || az;
  return az || en;
}

/** Mətn: CMS boşdursa tərcümə fallback */
export function mergeAboutText(
  cms: string,
  fallback: string
): string {
  const s = cms?.trim();
  if (s) return s;
  return fallback;
}

export async function getPublicAboutPage(): Promise<AboutPagePublic | null> {
  const base = getApiBaseURL().replace(/\/$/, "");
  if (!base) return null;
  try {
    const res = await fetch(`${base}/about-page-public`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AboutPagePublic | null;
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

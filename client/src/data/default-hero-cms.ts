import type { HeroLocales } from "@/lib/home-hero-public";
import azMessages from "@/messages/az.json";
import enMessages from "@/messages/en.json";

const BADGE_TEXT = "#yaratmağabaşla";

const COLOR_ACCENT = "#1560bd";
const COLOR_BODY_TEXT = "#1C1C1C";
const COLOR_MUTED = "#5c5c5c";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHeroHtml(hero: {
  toJetAcademy: string;
  welcome: string;
  description: string;
}): string {
  const paragraphs = hero.description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="color:${COLOR_MUTED};font-weight:500;font-size:1rem;line-height:1.65;margin:0 0 0.75rem 0;">${escapeHtml(p)}</p>`
    )
    .join("");

  return [
    `<p style="color:${COLOR_ACCENT};font-weight:600;margin:0 0 0.5rem 0;font-size:0.95rem;">${escapeHtml(BADGE_TEXT)}</p>`,
    `<h1 style="font-weight:700;color:${COLOR_BODY_TEXT};font-size:clamp(1.35rem,4vw,2.25rem);line-height:1.2;margin:0 0 0.75rem 0;">${escapeHtml(hero.toJetAcademy)} <span style="color:${COLOR_ACCENT};font-weight:700;">${escapeHtml(hero.welcome)}!</span></h1>`,
    paragraphs,
  ].join("");
}

/** Saytda CMS boş olanda göstərilən default hero HTML — AZ və EN */
export function getDefaultHeroCmsContent(): HeroLocales {
  const az = azMessages.hero;
  const en = enMessages.hero;
  return {
    az: buildHeroHtml({
      toJetAcademy: az.toJetAcademy,
      welcome: az.welcome,
      description: az.description,
    }),
    en: buildHeroHtml({
      toJetAcademy: en.toJetAcademy,
      welcome: en.welcome,
      description: en.description,
    }),
  };
}

export function getDefaultHeroImageAlt(): HeroLocales {
  return {
    az: "JET Academy tələbəsi proqramlaşdırma öyrənir",
    en: "JET Academy student learning programming",
  };
}

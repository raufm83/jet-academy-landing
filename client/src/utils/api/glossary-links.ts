import {
  GlossaryLinkTerm,
  linkGlossaryTerms,
} from "@/utils/glossary-autolink";

type Loc = "az" | "en";

async function getGlossaryLinkTerms(locale: Loc): Promise<GlossaryLinkTerm[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/glossary/brief?limit=2000&page=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const items: any[] = json?.items ?? [];
    return items
      .map((it) => {
        const text = it?.term?.[locale];
        const slug = it?.slug?.[locale];
        if (!text || !slug || it?.published === false) return null;
        return { text, href: `/${locale}/glossary/term/${slug}` };
      })
      .filter(Boolean) as GlossaryLinkTerm[];
  } catch {
    return [];
  }
}

export async function autolinkGlossary(
  html: string,
  locale: Loc,
  currentSlug?: string
): Promise<string> {
  if (!html) return html;
  const terms = await getGlossaryLinkTerms(locale);
  const excludeHref = currentSlug
    ? `/${locale}/glossary/term/${currentSlug}`
    : undefined;
  return linkGlossaryTerms(html, terms, { max: 10, excludeHref });
}

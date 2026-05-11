export interface PageMetaResponse {
  id: string;
  pageKey: string;
  locale: string;
  title: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function normalizeMetaValue(value?: string | null): string | null {
  const normalized = value?.trim();
  if (!normalized || normalized === "—") return null;
  return normalized;
}

export async function getPageMeta(
  pageKey: string,
  locale: string
): Promise<PageMetaResponse | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(
      `${API_URL}/page-meta?pageKey=${encodeURIComponent(pageKey)}&locale=${encodeURIComponent(locale)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.id ? data : null;
  } catch {
    return null;
  }
}

export async function resolvePageMeta(
  pageKey: string,
  locale: string,
  fallbackTitle: string,
  fallbackDescription: string
): Promise<{ title: string; description: string }> {
  const { trimMetaTitle, trimMetaDescription } = await import("@/utils/seo");
  const meta = await getPageMeta(pageKey, locale);

  return {
    title: trimMetaTitle(
      normalizeMetaValue(meta?.title) ?? fallbackTitle
    ),
    description: trimMetaDescription(
      normalizeMetaValue(meta?.description) ?? fallbackDescription
    ),
  };
}

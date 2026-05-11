import type { Vacancy } from "@/types/vacancy";
import { getApiBaseURL } from "./axios";

function vacanciesUrl(): string {
  const base = getApiBaseURL().replace(/\/+$/, "");
  return `${base}/vacancies`;
}

function sortVacanciesByOrder(items: Vacancy[]): Vacancy[] {
  return [...items].sort((a, b) => {
    const orderDiff = Number(b.order ?? 0) - Number(a.order ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * SSR üçün fetch (axios bəzən build/Docker mühitində əlavə xəta verir).
 * Cavab həmişə təhlükəsiz parse olunur.
 */
export async function getVacanciesPublic(): Promise<Vacancy[]> {
  try {
    const res = await fetch(vacanciesUrl(), {
      next: { revalidate: 30 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return [];
    }
    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      return sortVacanciesByOrder(data as Vacancy[]);
    }
    return [];
  } catch {
    return [];
  }
}

/** @deprecated getVacanciesPublic istifadə edin */
export const getActiveVacancies = async (
  page = 1,
  limit = 20
): Promise<{ items: Vacancy[]; meta: { total: number } }> => {
  void page;
  void limit;
  const items = await getVacanciesPublic();
  const start = Math.max(0, (page - 1) * limit);
  const paginatedItems = items.slice(start, start + limit);
  return {
    items: paginatedItems,
    meta: { total: items.length },
  };
};

export async function getVacancyBySlugPublic(
  slug: string
): Promise<Vacancy | null> {
  if (!slug?.trim()) return null;
  try {
    const base = getApiBaseURL().replace(/\/+$/, "");
    const url = `${base}/vacancies/by-slug/${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as Vacancy;
  } catch {
    return null;
  }
}

/** @deprecated getVacancyBySlugPublic istifadə edin */
export const getVacancyDetail = getVacancyBySlugPublic;

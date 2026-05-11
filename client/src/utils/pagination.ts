/**
 * Səhifələmə üçün ümumi məntiq: URL-də `page` query parametri,
 * nömrə siyahısı (ellipsis ilə).
 */

export type PaginationItem = number | "ellipsis";

/**
 * `baseUrl` — path və mövcud sorğu, məs: `/en/blog`, `/az/news?tag=foo` və ya `?tag=x&page=3`
 * `page` — 1-dən başlayan səhifə. 1 olanda `page` parametri silinir (təmiz URL).
 */
export function buildPaginationHref(baseUrl: string, page: number): string {
  const trimmed = baseUrl.trim();
  const qIndex = trimmed.indexOf("?");
  const path = qIndex === -1 ? trimmed : trimmed.slice(0, qIndex);
  const query = qIndex === -1 ? "" : trimmed.slice(qIndex + 1);
  const params = new URLSearchParams(query);

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

/**
 * Cari səhifə və qonşular + 1 və son səhifə; boşluqlarda "ellipsis".
 * @param delta — mərkəzdən hər tərəfə neçə nömrə (default 2)
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  delta = 2
): PaginationItem[] {
  if (totalPages <= 1) return [];

  const current = Math.min(Math.max(1, currentPage), totalPages);

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: PaginationItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]);
  }

  return out;
}

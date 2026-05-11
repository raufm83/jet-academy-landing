import { Prisma } from '@prisma/client';

/**
 * MongoDB Json sahəsində (məs. { az, en, ru? }) axtarış.
 * Prisma SQL üçün olan path/string_json filterləri MongoDB Json ilə uyğun gəlmir.
 */
export function jsonBilingualContains(
  data: Prisma.JsonValue | null | undefined,
  searchRaw: string,
): boolean {
  const s = searchRaw.trim().toLowerCase();
  if (!s) return true;
  if (data == null) return false;
  if (typeof data === 'object' && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    for (const k of ['az', 'en', 'ru'] as const) {
      const v = o[k];
      if (v != null && String(v).toLowerCase().includes(s)) return true;
    }
  } else if (typeof data === 'string' && data.toLowerCase().includes(s)) {
    return true;
  }
  return false;
}

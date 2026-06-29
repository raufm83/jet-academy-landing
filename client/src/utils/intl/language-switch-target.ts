import { PUBLIC_API_BASE } from "@/constants/public-api-base";

/** Kursun hər iki dildəki slug-u (dil dəyişəndə URL doğru olsun) */
export async function fetchCourseSlugsFromApi(
  slugFromUrl: string
): Promise<{ az?: string; en?: string } | null> {
  const s = slugFromUrl.trim();
  if (!s) return null;
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE}/courses/slug/${encodeURIComponent(s)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      slug?: { az?: string; en?: string };
    };
    const obj = data?.slug;
    if (!obj || typeof obj !== "object") return null;
    return {
      ...(obj.az && { az: String(obj.az).trim() }),
      ...(obj.en && { en: String(obj.en).trim() }),
    };
  } catch {
    return null;
  }
}

export async function fetchBlogSlugsFromApi(
  slugFromUrl: string
): Promise<{ az?: string; en?: string } | null> {
  const s = slugFromUrl.trim();
  if (!s) return null;
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE}/posts/slug/${encodeURIComponent(s)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      slug?: { az?: string; en?: string };
    };
    const obj = data?.slug;
    if (!obj || typeof obj !== "object") return null;
    return {
      ...(obj.az && { az: String(obj.az).trim() }),
      ...(obj.en && { en: String(obj.en).trim() }),
    };
  } catch {
    return null;
  }
}

/**
 * Dil keçidindən əvvəl: next-intl `usePathname()` bəzən `[slug]` placeholder qaytarır;
 * `next/navigation` pathname isə real `/az/course/foo/` verir — bu dəstək hər iki halı birləşdirir.
 */
export function pathnameWithoutLeadingLocale(fullPathname: string): string {
  const p = fullPathname.startsWith("/") ? fullPathname : `/${fullPathname}`;
  const wantTrailingSlash = p.length > 1 && p.endsWith("/");
  const segs = p.split("/").filter(Boolean);
  if (segs[0] === "az" || segs[0] === "en") {
    segs.shift();
  }
  if (segs.length === 0) {
    return "/";
  }
  let out = `/${segs.join("/")}`;
  if (wantTrailingSlash && out !== "/") out += "/";
  return out;
}

export function interpolatePathnameDynamicSegments(
  template: string,
  routeParams: Readonly<Record<string, string | string[] | undefined>>
): string {
  return template.replace(/\[([^\]]+)\]/g, (_, key: string) => {
    const v = routeParams[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s != null && String(s) !== "" ? String(s) : `[${key}]`;
  });
}

/** Axios və server `fetch` üçün vahid API kökü — `course.ts` birbaşa axios yükləməsin deyə ayrıca fayl. */

function normalizeApiRoot(url: string): string {
  const base = url.replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

export function getApiBaseURL(): string {
  if (typeof window !== "undefined") {
    const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (pub) {
      return normalizeApiRoot(pub);
    }
    return `${window.location.origin}/api/be`;
  }

  const secret = process.env.API_URL?.trim();
  if (secret) {
    return normalizeApiRoot(secret);
  }
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub) {
    return normalizeApiRoot(pub);
  }

  const siteOrigin =
    process.env.NEXT_INTERNAL_SITE_URL?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  return `${siteOrigin}/api/be`;
}

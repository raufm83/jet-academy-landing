/**
 * Resolve an image path (absolute URL or relative /uploads path)
 * into a full URL suitable for next/image src.
 */
export function buildImageUrl(raw?: string): string {
  if (!raw) return "/default-course-image.svg";

  if (raw.startsWith("http")) {
    return raw.replace(/^(https?:\/\/[^/]+)\/api(\/uploads\/)/i, "$1$2");
  }

  const base =
    (process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/, "") ||
    (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  if (!base) {
    if (raw.startsWith("/uploads") || raw.startsWith("/uploads-acad"))
      return raw;
    return `/uploads-acad/courses/${raw}`;
  }

  const full = raw.startsWith("/uploads") || raw.startsWith("/uploads-acad")
    ? `${base}${raw}`
    : `${base}/uploads-acad/courses/${raw}`;

  return full.replace(/^(https?:\/\/[^/]+)\/api(\/uploads\/)/i, "$1$2");
}

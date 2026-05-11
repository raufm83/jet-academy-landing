/**
 * Sayt üzrə şəkil URL-lərinin vahid həlli: CDN/API prefiksləri, köhnə yollar,
 * `uploads` / `uploads-acad` / `gallery` normalizasiyası.
 *
 * `next/image` üçün src hazırlayır; eyni funksiya lightbox və digər <img> üçün də istifadə olunur.
 */
import { buildImageUrl } from "@/utils/imageUrl";

export type OptimizedImageContext =
  | "gallery"
  | "course"
  | "project"
  | "graduate"
  | "team"
  | "generic";

function sanitizeBase(value?: string): string {
  return (value || "")
    .replace(/\/$/, "")
    .replace(/\/api\/?$/, "")
    .replace(/\/uploads-acad\/?$/, "")
    .replace(/\/uploads\/?$/, "");
}

function getCdnBase(): string {
  return (
    sanitizeBase(process.env.NEXT_PUBLIC_CDN_URL) ||
    sanitizeBase(process.env.NEXT_PUBLIC_API_URL) ||
    ""
  );
}

/** API hostunda `/api/uploads/` → `/uploads/` (statik serv üçün) */
function normalizeAbsoluteUploadsUrl(url: string): string {
  return url.replace(/^(https?:\/\/[^/]+)\/api(\/uploads\/)/i, "$1$2");
}

const FALLBACK: Record<OptimizedImageContext, string> = {
  gallery: "/default-gallery-image.jpg",
  course: "/default-course-image.svg",
  project: "/default-project-image.jpg",
  graduate: "/default-gallery-image.jpg",
  team: "/default-course-image.svg",
  generic: "/default-course-image.svg",
};

/**
 * Şəkil yolunu brauzer üçün tam, düzgün URL-ə çevirir.
 *
 * @param raw - DB-dən gələn nisbi yol və ya tam URL
 * @param context - hansı modul üçün prefiks qaydaları tətbiq olunsun
 */
export function resolveOptimizedImageUrl(
  raw: string | null | undefined,
  context: OptimizedImageContext = "generic"
): string {
  if (!raw || !String(raw).trim()) {
    return FALLBACK[context] ?? FALLBACK.generic;
  }

  const input = String(raw).trim();

  if (context === "course") {
    return buildImageUrl(input);
  }

  const base = getCdnBase();

  if (context === "team") {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return normalizeAbsoluteUploadsUrl(input);
    }
    const normalizedPath = input.replace(/^\/+/, "");
    if (normalizedPath.startsWith("uploads/")) {
      return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
    }
    if (normalizedPath.startsWith("uploads-acad/")) {
      const rest = normalizedPath.slice("uploads-acad/".length);
      return base ? `${base}/uploads/${rest}` : `/uploads/${rest}`;
    }
    return base
      ? `${base}/uploads/${normalizedPath}`
      : `/uploads/${normalizedPath}`;
  }

  if (context === "project") {
    if (input.startsWith("http")) return input;
    if (!base) {
      if (input.startsWith("/uploads") || input.startsWith("/uploads-acad")) {
        return input;
      }
      return `/uploads-acad/projects/${input}`;
    }
    if (input.startsWith("/uploads") || input.startsWith("/uploads-acad")) {
      return `${base}${input}`;
    }
    return `${base}/uploads-acad/projects/${input}`;
  }

  if (context === "graduate") {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return input;
    }
    const normalizedPath = input.replace(/^\/+/, "");
    if (normalizedPath.startsWith("uploads/")) {
      return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
    }
    return base
      ? `${base}/uploads/${normalizedPath}`
      : `/uploads/${normalizedPath}`;
  }

  if (context === "gallery") {
    if (!input) return FALLBACK.gallery;

    if (input.startsWith("http://") || input.startsWith("https://")) {
      try {
        const url = new URL(input);
        if (url.pathname.startsWith("/uploads-acad/")) {
          url.pathname = `/uploads${url.pathname}`;
          return url.toString();
        }
        if (url.pathname.startsWith("/gallery/")) {
          url.pathname = `/uploads${url.pathname}`;
          return url.toString();
        }
        return normalizeAbsoluteUploadsUrl(input);
      } catch {
        return input;
      }
    }

    const normalizedPath = input.replace(/^\/+/, "");

    if (normalizedPath.startsWith("uploads/")) {
      return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("uploads-acad/")) {
      return base
        ? `${base}/uploads/${normalizedPath}`
        : `/uploads/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("gallery/")) {
      return base
        ? `${base}/uploads/${normalizedPath}`
        : `/uploads/${normalizedPath}`;
    }

    return base
      ? `${base}/uploads/${normalizedPath}`
      : `/uploads/${normalizedPath}`;
  }

  /* generic */
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return normalizeAbsoluteUploadsUrl(input);
  }
  const normalizedPath = input.replace(/^\/+/, "");
  if (normalizedPath.startsWith("uploads/")) {
    return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
  }
  return base
    ? `${base}/uploads/${normalizedPath}`
    : `/uploads/${normalizedPath}`;
}

/** Qalereya grid / kart üçün `sizes` (4 sütun desktop) */
export const GALLERY_GRID_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 320px";

/** `next/image` keyfiyyəti — şəbəkə vs. keyfiyyət balansı */
export const OPTIMIZED_IMAGE_QUALITY_GRID = 64;
export const OPTIMIZED_IMAGE_QUALITY_PREVIEW = 70;

import { Course } from "@/types/course";
import { Locale } from "@/i18n/request";
import { courseDetailPath, coursesListingPath } from "@/utils/course-paths";

type L2 = "az" | "en";

/**
 * Normalize locale to "az" or "en"
 */
export const normalizeLocale = (locale?: string | Locale): L2 => {
  const s = (locale || "az").slice(0, 2).toLowerCase();
  return s === "en" ? "en" : "az";
};

/** Ay sayını göstərmə (məs. 1.5 → "1.5", 3 → "3"). */
export function formatCourseDurationMonths(value: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toString();
}

/** API/cache bəzən string və ya ondalıq verir; kartlarda vahid göstərim üçün. */
export function coerceCourseDurationMonths(
  raw: unknown,
  fallback = 6
): number {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const n = parseFloat(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Get multilingual content with fallback
 */
export function getMultilingualContent<T = string>(
  obj: unknown,
  locale: L2,
  fallbacks: L2[] = ["az", "en"]
): T | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<L2, T | undefined>;
  return rec[locale] ?? rec[fallbacks[0]] ?? rec[fallbacks[1]];
}

/** API bəzən APP_URL=.../api ilə saxlanmış köhnə URL qaytarır; statik fayllar /uploads/* üzrədir. */
function fixCourseImageUrlString(imageUrl: string): string {
  return imageUrl.replace(/^(https?:\/\/[^/]+)\/api(\/uploads\/)/i, "$1$2");
}

/**
 * Get image URL with CDN support
 */
export const getCourseImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return "/default-course-image.svg";
  if (imageUrl.startsWith("http")) return fixCourseImageUrlString(imageUrl);

  const base =
    (process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/, "") ||
    (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  if (!base) {
    if (imageUrl.startsWith("/uploads") || imageUrl.startsWith("/uploads-acad"))
      return imageUrl;
    return `/uploads-acad/courses/${imageUrl}`;
  }

  if (imageUrl.startsWith("/uploads") || imageUrl.startsWith("/uploads-acad")) {
    return fixCourseImageUrlString(`${base}${imageUrl}`);
  }
  return fixCourseImageUrlString(`${base}/uploads-acad/courses/${imageUrl}`);
};

/**
 * Extract course data for display
 */
export interface CourseDisplayData {
  title: string;
  slogan: string;
  tags: string[];
  slug: string;
  lessonPerWeek?: number;
  duration: number | string;
  ageRange?: string;
  level?: string;
  href: string;
  cardStyle: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  };
}

export const getCourseDisplayData = (
  course: Course,
  locale: L2,
  translations?: {
    defaultSlogan?: string;
    lessonPerWeek?: string;
    lesson?: string;
    duration?: string;
    months?: string;
    age?: string;
    level?: string;
  }
): CourseDisplayData => {
  const title =
    getMultilingualContent<string>(course.title, locale) ??
    getMultilingualContent<string>(course.title, "az") ??
    "Untitled Course";

  const slogan =
    getMultilingualContent<string>(course.slogan, locale) ??
    getMultilingualContent<string>(course.shortDescription, locale) ??
    translations?.defaultSlogan ??
    (locale === "az"
      ? "Texnologiya dünyasına ilk addımını at!"
      : "Make your first step in tech!");

  const tags =
    (getMultilingualContent<string[]>(course.newTags, locale) ??
      course.tag ??
      []) as string[];

  const slug =
    getMultilingualContent<string>(course.slug, locale) ??
    getMultilingualContent<string>(course.slug, "az") ??
    "";

  const href = slug
    ? `/${locale}${courseDetailPath(locale, slug)}`
    : `/${locale}${coursesListingPath(locale)}`;

  const cardStyle = {
    backgroundColor: course.backgroundColor || "#FFE082",
    borderColor: course.borderColor || "#F59E0B",
    textColor: course.textColor || "#1A1A1A",
  };

  return {
    title,
    slogan,
    tags,
    slug,
    lessonPerWeek: course.lessonPerWeek !== undefined && course.lessonPerWeek !== null ? course.lessonPerWeek : undefined,
    duration: formatCourseDurationMonths(
      coerceCourseDurationMonths(course.duration, 6)
    ),
    ageRange: course.ageRange,
    level: getMultilingualContent<string>(course.level, locale),
    href,
    cardStyle,
  };
};


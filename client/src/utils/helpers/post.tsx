import { PostType } from "@/types/enums";
import { PostImageUrl } from "@/types/post";
import { MdArticle, MdEvent, MdFeed } from "react-icons/md";

export type LocalizedTags = { az: string[]; en: string[] };

function dedupeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

export function getPostTagFormValues(tags: unknown): LocalizedTags {
  if (!tags) return { az: [], en: [] };

  if (!Array.isArray(tags)) {
    if (
      typeof tags === "object" &&
      tags !== null &&
      "az" in tags &&
      "en" in tags
    ) {
      const localized = tags as { az?: unknown; en?: unknown };
      return {
        az: dedupeTags(Array.isArray(localized.az) ? localized.az.map(String) : []),
        en: dedupeTags(Array.isArray(localized.en) ? localized.en.map(String) : []),
      };
    }
    return { az: [], en: [] };
  }

  const az: string[] = [];
  const en: string[] = [];

  for (const entry of tags) {
    if (typeof entry === "string") {
      const tag = entry.trim();
      if (tag) {
        az.push(tag);
        en.push(tag);
      }
      continue;
    }

    if (typeof entry === "object" && entry !== null) {
      const localized = entry as {
        az?: string | string[];
        en?: string | string[];
      };

      if (Array.isArray(localized.az) || Array.isArray(localized.en)) {
        az.push(...(Array.isArray(localized.az) ? localized.az.map(String) : []));
        en.push(...(Array.isArray(localized.en) ? localized.en.map(String) : []));
        continue;
      }

      if (typeof localized.az === "string" && localized.az.trim()) {
        az.push(localized.az.trim());
      }
      if (typeof localized.en === "string" && localized.en.trim()) {
        en.push(localized.en.trim());
      }
    }
  }

  return {
    az: dedupeTags(az),
    en: dedupeTags(en),
  };
}

/** Siyahı səhifəsi yolu (teq linkləri üçün) */
export function getPostListingPath(postType: PostType): string {
  switch (postType) {
    case PostType.BLOG:
      return "/blog";
    case PostType.NEWS:
      return "/news";
    case PostType.EVENT:
      return "/events";
    case PostType.OFFERS:
      return "/offers";
    default:
      return "/news";
  }
}

/** Həmin teqlə filtr olunmuş post siyahısına keçid */
export function buildPostTagHref(postType: PostType, tag: string): string {
  const base = getPostListingPath(postType);
  return `${base}?tag=${encodeURIComponent(tag)}`;
}

export function getLocalizedPostTags(
  tags: unknown,
  locale: "az" | "en" | "ru"
): string[] {
  const l = locale === "ru" ? "az" : locale;
  const localized = getPostTagFormValues(tags);
  return l === "en"
    ? dedupeTags(localized.en.length ? localized.en : localized.az)
    : dedupeTags(localized.az.length ? localized.az : localized.en);
}

export function getAllPostTags(tags: unknown): string[] {
  const localized = getPostTagFormValues(tags);
  return dedupeTags([...localized.az, ...localized.en]);
}

/** Post-un dilə uyğun şəkil path-ini qaytarır. EN üçün yoxdursa AZ, AZ üçün yoxdursa EN götürülür. */
export function getPostImageUrl(
  imageUrl: PostImageUrl | null | undefined,
  locale: "az" | "en" | "ru"
): string | undefined {
  const l = locale === "ru" ? "az" : locale;
  if (!imageUrl) return undefined;
  if (typeof imageUrl === "string") {
    const s = imageUrl.trim();
    return s || undefined;
  }
  const az = typeof imageUrl.az === "string" ? imageUrl.az.trim() : "";
  const en = typeof imageUrl.en === "string" ? imageUrl.en.trim() : "";
  const path = l === "en" ? (en || az) : (az || en);
  return path || undefined;
}

/** Şəkil üçün base URL: CDN və ya API origin + /uploads (digər şəkillərlə eyni). */
function getImageBaseUrl(): string {
  const cdn = (process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/, "");
  if (cdn) return cdn;
  const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const origin = api.endsWith("/api") ? api.slice(0, -4) : api;
  return origin ? `${origin}/uploads` : "";
}

/** Post şəkilinin tam CDN URL-i (path və ya obyekt + locale). */
export function getPostImageSrc(
  imageUrl: PostImageUrl | null | undefined,
  locale: "az" | "en" | "ru"
): string | undefined {
  const path = getPostImageUrl(imageUrl, locale);
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getImageBaseUrl();
  return base ? `${base}/${path.replace(/^\//, "")}` : undefined;
}

/**
 * Məzun şəkilləri (WYSIWYG) üçün göstərmə URL-i.
 * Relative /uploads/... saxlanılırsa olduğu kimi qaytarır (Next.js rewrite API-yə yönləndirir).
 * Tam URL və data URI toxunulmaz.
 */
export function getContentImageFullUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return "";
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) return relativePath;
  if (relativePath.startsWith("data:")) return relativePath;
  if (relativePath.startsWith("/uploads/")) return relativePath.split("?")[0];
  const path = relativePath.replace(/^\//, "");
  const withUploads = path.startsWith("uploads/") ? `/${path}` : `/uploads/${path}`;
  return withUploads.split("?")[0];
}

/**
 * Məzun şəkil üçün tam (absolute) URL – next/image və editor üçün.
 * Eyni origin fetch problemlərini aradan qaldırır.
 */
export function getContentImageAbsoluteUrl(relativePath: string | null | undefined): string {
  const path = getContentImageFullUrl(relativePath);
  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:"))
    return path;
  const baseWithUploads = getImageBaseUrl();
  if (!baseWithUploads) return path;
  const origin = baseWithUploads.replace(/\/uploads\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Məzun şəkil src-dən path çıxarır: /uploads/post-content/... və ya post-content/... */
function getContentImageRelativePath(src: string): string | null {
  const s = src.trim().split("?")[0];
  if (!s) return null;
  if (s.startsWith("/uploads/post-content/")) return s;
  const i = s.indexOf("post-content/");
  if (i === -1) return null;
  const path = s.slice(i);
  return path.startsWith("uploads/") ? `/${path}` : `/uploads/${path}`;
}

/** HTML məzmundakı img src-ləri cari mühit üçün tam URL-ə çevirir. Data URI (base64) və http(s) toxunulmaz. */
export function rewriteContentImageUrls(html: string): string {
  if (!html || typeof html !== "string") return html;
  return html.replace(
    /<img([^>]*)\ssrc=["']([^"']+)["']/gi,
    (_, attrs, src) => {
      let raw = src.trim();
      const dataUriStart = raw.indexOf("data:image");
      if (dataUriStart > 0 && (raw.startsWith("http://") || raw.startsWith("https://"))) {
        raw = raw.slice(dataUriStart);
      }
      if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://"))
        return `<img${attrs} src="${raw}"`;
      const relative = getContentImageRelativePath(raw);
      const pathToUse = relative || raw;
      const fullSrc = getContentImageFullUrl(pathToUse);
      return fullSrc ? `<img${attrs} src="${fullSrc}"` : `<img${attrs} src="${raw}"`;
    }
  );
}

/** <img> tag-dan src və alt atributlarını çıxarır. */
function getImgAttrs(attrsStr: string): { src: string; alt: string } {
  // (?:^|\s) — start of string or whitespace, so `src="..."` at the beginning of
  // the captured attribute string (no leading space) is matched correctly.
  const srcMatch = attrsStr.match(/(?:^|\s)src=["']([^"']+)["']/i);
  const altMatch = attrsStr.match(/(?:^|\s)alt=["']([^"']*)["']/i);
  return {
    src: srcMatch ? srcMatch[1].trim() : "",
    alt: altMatch ? altMatch[1].trim() : "",
  };
}

export type ContentSegment =
  | { type: "html"; value: string }
  | { type: "img"; src: string; alt: string };

/**
 * HTML məzmunu seqmentlərə ayırır: mətn (html) və şəkillər (img).
 * Şəkillər Next.js Image ilə 1024×1024 göstərilmək üçün ayrılır.
 * next/image üçün həmişə absolute URL istifadə olunur (domain remotePatterns-də olmalıdır).
 */
export function parseContentWithImages(html: string): ContentSegment[] {
  if (!html || typeof html !== "string") return [{ type: "html", value: html }];
  const segments: ContentSegment[] = [];
  // Quill <img src="..." /> və ya <img src="...">; boşluq ixtiyari
  const re = /<img\s*([^>]+?)\s*\/?>/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: "html", value: html.slice(lastIndex, m.index) });
    }
    const { src, alt } = getImgAttrs(m[1]);
    if (src) {
      let normalizedSrc: string;
      if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) {
        normalizedSrc = src;
      } else {
        const relative = getContentImageRelativePath(src);
        const pathToUse = relative || src;
        normalizedSrc = getContentImageAbsoluteUrl(pathToUse) || getContentImageFullUrl(pathToUse) || src;
      }
      segments.push({ type: "img", src: normalizedSrc, alt });
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < html.length) {
    segments.push({ type: "html", value: html.slice(lastIndex) });
  }
  return segments.length ? segments : [{ type: "html", value: html }];
}

export const getPostTypeIcon = (postType: PostType) => {
  switch (postType) {
    case PostType.BLOG:
      return <MdArticle className="w-5 h-5" />;
    case PostType.NEWS:
      return <MdFeed className="w-5 h-5" />;
    case PostType.EVENT:
      return <MdEvent className="w-5 h-5" />;
    default:
      return null;
  }
};

export const getPostTypeName = (postType: PostType, t: any) => {
  switch (postType) {
    case PostType.BLOG:
      return t("blog");
    case PostType.NEWS:
      return t("news");
    case PostType.EVENT:
      return t("event");
    default:
      return postType;
  }
};

export const getTextContent = (content: any, locale: string) => {
  let textContent = "";
  try {
    if (typeof content[locale] === "string") {
      textContent = content[locale].replace(/<[^>]*>/g, "");
    } else if (content[locale]?.["content[az]"]) {
      textContent =
        locale === "az"
          ? content[locale]["content[az]"]
          : content[locale]["content[en]"];
    }
  } catch (error) {
    console.error("Error parsing content:", error);
    textContent = "";
  }

  return textContent;
};

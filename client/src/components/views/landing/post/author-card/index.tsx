"use client";

import { Post } from "@/types/post";

interface PostAuthorCardProps {
  author: Post["author"];
  authorLabel?: string;
  locale?: "az" | "en" | "ru";
}

function getNamePart(
  value: string | { az?: string; en?: string; ru?: string } | null | undefined,
  locale: string
): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  const v = (value as Record<string, string>)[locale] ?? value.az ?? value.en ?? (value as { ru?: string }).ru;
  return (v ?? "").trim();
}

export default function PostAuthorCard({ author, authorLabel = "Müəllif", locale = "az" }: PostAuthorCardProps) {
  if (!author) return null;

  const avatarUrl = author.profile?.avatarUrl;
  const sl = author.profile?.socialLinks;
  const professionRaw = author.profile?.profession;
  const profession =
    professionRaw != null && typeof professionRaw === "object"
      ? getNamePart(professionRaw as { az?: string; en?: string }, locale)
      : (typeof professionRaw === "string" ? professionRaw : "");
  // Prefer author.firstName/lastName (from API), else socialLinks
  const first = getNamePart(author.firstName ?? sl?.authorName, locale);
  const last = getNamePart(author.lastName ?? sl?.authorSurname, locale);
  const authorPosition = getNamePart(sl?.authorPosition, locale) || profession;
  const displayName =
    first || last ? [first, last].filter(Boolean).join(" ") : author.name || "";

  // Same as team/gallery and working code: CDN + avatarUrl (API returns "profile/filename.webp")
  const cdn = process.env.NEXT_PUBLIC_CDN_URL || "";
  const imgSrc = avatarUrl
    ? cdn && !avatarUrl.startsWith("http")
      ? `${cdn}/${avatarUrl}`
      : avatarUrl
    : null;

  return (
    <section
      className="rounded-xl border border-gray-200/80 bg-gray-50/60 px-4 py-3"
      aria-label={authorLabel}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.onerror = null;
                t.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
              }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-lg font-semibold text-jsyellow"
              aria-hidden
            >
              {(displayName || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            {authorLabel}
          </p>
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {displayName}
          </p>
          {authorPosition && (
            <p className="text-sm font-normal text-gray-500 leading-tight mt-0.5">
              {authorPosition}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

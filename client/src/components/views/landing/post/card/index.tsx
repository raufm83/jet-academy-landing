import { Locale } from "@/i18n/request";
import { Post } from "@/types/post";
import { formatDate, formatTime } from "@/utils/formatters/formatDate";
import {
  getLocalizedPostTags,
  getTextContent,
  getPostImageSrc,
  buildPostTagHref,
} from "@/utils/helpers/post";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { MdCalendarMonth, MdAccessTime } from "react-icons/md";

interface PostCardProps {
  post: Post;
  locale: Locale;
  t: any;
  /** Grid / swiper: yalnız ilk element üçün şəkil prioriteti */
  imagePriority?: boolean;
  compact?: boolean;
}

export default function PostCard({
  post,
  locale,
  t,
  imagePriority = false,
  compact = false,
}: PostCardProps) {
  const dateValue = post.eventDate || post.createdAt;
  const dateStr = formatDate(dateValue);
  const timeStr = formatTime(dateValue);
  const showTime = post.postType !== "OFFERS";
  const title = post.title[locale];
  const slug = post.slug[locale];
  const localizedTags = getLocalizedPostTags(post.tags, locale);

  const content = getTextContent(post.content, locale);
  const contentPreview =
    content.substring(0, 150) + (content.length > 150 ? "..." : "");

  const postPath =
    post.postType === "BLOG"
      ? "blog"
      : post.postType === "OFFERS"
        ? "offers"
        : post.postType === "EVENT"
          ? "events"
          : "news";

  const postUrl = `/${postPath}/${slug}`;

  const firstTag = localizedTags[0];
  const restTagCount =
    localizedTags.length > 1 ? localizedTags.length - 1 : 0;

  return (
    <div
      className="bg-[#fef7eb] border border-jsyellow rounded-3xl overflow-hidden 
        flex flex-col h-full w-full min-h-0 transition-all duration-300  
        hover:shadow-lg hover:shadow-[rgba(252,174,30,0.15)]"
    >
      <Link href={postUrl} className="flex flex-col flex-1 min-h-0">
        {(() => {
          const imageSrc = getPostImageSrc(post.imageUrl, locale);
          return imageSrc ? (
            <div
              className={`relative w-full shrink-0 overflow-hidden rounded-t-3xl bg-[#e8e0d4] ${
                compact ? "aspect-[4/3]" : "aspect-[4/3]"
              }`}
            >
              <Image
                quality={64}
                src={imageSrc}
                alt={
                  post.imageAlt?.[locale] ||
                  (typeof title === "string" ? title : "Post image")
                }
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                className="object-cover object-center"
                priority={imagePriority}
                {...(!imagePriority ? { loading: "lazy" as const } : {})}
              />
            </div>
          ) : null;
        })()}

        <div className={`${compact ? "p-5 sm:p-6 pb-4" : "p-6 pb-4"} flex min-h-0 flex-1 flex-col`}>
          <div className={`flex justify-between items-center ${compact ? "mb-3" : "mb-3"}`}>
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 [@media(min-width:3500px)]:!text-xl ${compact ? "text-sm" : "text-sm"}`}>
              {post.postType === "OFFERS" && (
                <span className="sr-only">{t("expiryDateLabel")}: </span>
              )}
              {post.postType === "EVENT" && (
                <span className="sr-only">{t("eventDateLabel")}: </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MdCalendarMonth
                  className="w-4 h-4 [@media(min-width:3500px)]:!w-6 [@media(min-width:3500px)]:!h-6 text-jsyellow flex-shrink-0"
                  aria-hidden
                />
                {dateStr}
              </span>
              {showTime && timeStr && (
                <span className="inline-flex items-center gap-1.5">
                  <MdAccessTime
                    className="w-4 h-4 [@media(min-width:3500px)]:!w-6 [@media(min-width:3500px)]:!h-6 text-jsyellow flex-shrink-0"
                    aria-hidden
                  />
                  {timeStr}
                </span>
              )}
            </div>
          </div>

          <h2
            className={`font-bold mb-3 [@media(min-width:3500px)]:!text-4xl line-clamp-2 ${
              compact ? "text-xl" : "text-xl"
            }`}
          >
            {typeof title === "string" ? title : title?.["title[az]"] || ""}
          </h2>

          <p
            className={`text-gray-600 [@media(min-width:3500px)]:!text-2xl mb-0 flex-grow ${
              compact ? "line-clamp-2 text-sm" : "line-clamp-3"
            }`}
          >
            {contentPreview}
          </p>
        </div>
      </Link>

      <div
        className={`pt-0 flex items-center justify-between gap-3 mt-auto ${
          compact ? "px-5 pb-5 sm:px-6 sm:pb-6 text-base" : "px-6 pb-6"
        }`}
      >
        <Link
          href={postUrl}
          className="text-jsblack [@media(min-width:3500px)]:!text-2xl font-medium hover:underline shrink-0"
        >
          {t("readMore")} →
        </Link>

        {localizedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-end shrink-0">
            {firstTag ? (
              <Link
                href={buildPostTagHref(post.postType, firstTag)}
                className="bg-jsyellow/10 text-jsblack px-2 py-1 text-xs rounded-full hover:bg-jsyellow/25 transition-colors"
              >
                {firstTag}
              </Link>
            ) : null}
            {restTagCount > 0 ? (
              <span className="bg-jsyellow/10 text-jsblack px-2 py-1 text-xs rounded-full">
                +{restTagCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

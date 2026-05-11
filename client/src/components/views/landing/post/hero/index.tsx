/* eslint-disable @next/next/no-img-element */
import { PostType, EventStatus } from "@/types/enums";
import { PostImageUrl } from "@/types/post";
import {
  getLocalizedPostTags,
  getPostImageSrc,
  parseContentWithImages,
  rewriteContentImageUrls,
  buildPostTagHref,
} from "@/utils/helpers/post";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";

interface PostHeroProps {
  title: string;
  type: string;
  eventDate?: string;
  eventTime?: string;
  dateIcon?: React.ReactNode;
  timeIcon?: React.ReactNode;
  eventStatus?: EventStatus;
  content: string;
  tags: unknown;
  /** Tam URL, relative path və ya { az?, en? } obyekti (locale-ə uyğun seçilir) */
  imageUrl?: string | PostImageUrl | null;
  imageAlt?: string;
  /** Cari dil (URL-dən); verilməzsə getLocale() istifadə olunur. /en-də şəkil üçün mütləq ötürün. */
  locale?: "az" | "en" | "ru";
  eventDateText: string;
  eventTimeText?: string;
  tagsText: string;
  /** Teq linkləri üçün post növü */
  postType?: PostType;
}

export default async function PostHero({
  title,
  type,
  eventDate,
  eventTime,
  dateIcon,
  timeIcon,
  eventStatus,
  content,
  tags,
  imageUrl,
  imageAlt,
  locale: localeProp,
  eventDateText,
  eventTimeText,
  tagsText,
  postType,
}: PostHeroProps) {
  const locale = (localeProp ?? (await getLocale())) as "az" | "en" | "ru";
  const imageSrc =
    imageUrl != null
      ? getPostImageSrc(
          typeof imageUrl === "string" || (typeof imageUrl === "object" && !Array.isArray(imageUrl))
            ? imageUrl
            : undefined,
          locale
        )
      : undefined;
  const localizedTags = getLocalizedPostTags(tags, locale);

  const getEventStatusName = (status?: EventStatus) => {
    if (!status) return null;

    switch (status) {
      case EventStatus.UPCOMING:
        return locale === "az" ? "Gələcək" : "Предстоящий";
      case EventStatus.PAST:
        return locale === "az" ? "Keçmiş" : "Прошедший";
      case EventStatus.ONGOING:
        return locale === "az" ? "Davam edir" : "Активная";
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-wrap items-center gap-4">
        <span
          className={`px-4 py-2 rounded-full capitalize ${
            type === PostType.BLOG
              ? "bg-blue-100 text-blue-800"
              : type === PostType.NEWS
              ? "bg-green-100 text-green-800"
              : "bg-jsyellow/10 text-jsblack"
          }`}
        >
          {type}
        </span>

        {eventDate && (
          <span className="bg-jsyellow/10 text-jsblack px-4 py-2 rounded-full flex items-center gap-2">
            {dateIcon}
            {`${eventDateText}: ${eventDate}`}
          </span>
        )}

        {eventTime && (
          <span className="bg-jsyellow/10 text-jsblack px-4 py-2 rounded-full flex items-center gap-2">
            {timeIcon}
            {`${eventTimeText}: ${eventTime}`}
          </span>
        )}

        {eventStatus && (
          <span
            className={`px-4 py-2 rounded-full capitalize ${
              eventStatus === EventStatus.UPCOMING
                ? "bg-jsyellow/10 text-jsblack"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {getEventStatusName(eventStatus)}
          </span>
        )}
      </div>

      <h1 className="text-xl leading-snug sm:text-2xl md:text-[clamp(1.375rem,2.8vw,1.75rem)] lg:text-[clamp(1.5rem,2vw,2rem)] font-bold text-jsblack">
        {title}
      </h1>

      {imageSrc && (
        <div className="relative mt-10 w-full aspect-[16/9]">
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            fill
            className="object-cover rounded-[32px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
            priority
            quality={80}
          />
        </div>
      )}

      <div className="post-body post-body-quill prose max-w-none text-gray-600 prose-headings:text-jsblack prose-li:ml-4 prose-li:list-disc prose-img:block prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-p:my-2 md:prose-p:my-2.5 xl:prose-p:my-2.5 2xl:prose-p:my-3 prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0">
        {parseContentWithImages(rewriteContentImageUrls(content)).map(
          (segment, index) =>
            segment.type === "html" ? (
              segment.value ? (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: segment.value }}
                  className="post-content-html w-full min-w-0 [overflow-wrap:anywhere]"
                />
              ) : null
            ) : (
              <span key={index} className="not-prose my-3 block w-full leading-none">
                <img
                  src={segment.src}
                  alt={segment.alt || title}
                  className="block max-h-none w-full max-w-full rounded-lg h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            )
        )}
      </div>


      {localizedTags.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">{tagsText}:</h3>
          <div className="flex flex-wrap gap-2">
            {localizedTags.map((tag, index) =>
              postType ? (
                <Link
                  key={`${tag}-${index}`}
                  href={buildPostTagHref(postType, tag)}
                  className="bg-jsyellow/10 text-jsblack px-3 py-1 rounded-full text-sm hover:bg-jsyellow/25 transition-colors"
                >
                  {tag}
                </Link>
              ) : (
                <span
                  key={index}
                  className="bg-jsyellow/10 text-jsblack px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

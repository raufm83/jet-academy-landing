"use client";

import { getAllPosts } from "@/utils/api/post";
import { Post } from "@/types/post";
import { Locale } from "@/i18n/request";
import { getPostImageSrc } from "@/utils/helpers/post";
import { PostType } from "@/types/enums";
import { useEffect, useRef, useState } from "react";
import { formatDate, formatTime } from "@/utils/formatters/formatDate";
import { MdCalendarMonth, MdAccessTime } from "react-icons/md";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";

interface RelatedPostsProps {
  title: string;
  locale: Locale;
  currentPostId: string;
  postType: PostType;
  tags?: string[];
  /** Server-fetched related posts (e.g. all other blogs); shown immediately in slider */
  initialRelatedPosts?: Post[];
}

export default function RelatedPosts({
  title,
  locale,
  currentPostId,
  postType,
  initialRelatedPosts = [],
}: RelatedPostsProps) {
  const t = useTranslations("blogPage");
  const [relatedPosts, setRelatedPosts] = useState<Post[]>(initialRelatedPosts);

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (initialRelatedPosts.length > 0) {
      setRelatedPosts(initialRelatedPosts);
      return;
    }
    const fetchPosts = async () => {
      try {
        let filteredResult: Post[] = [];
        try {
          const sameTypePosts = await getAllPosts({
            page: 1,
            limit: 20,
            postType,
          });
          filteredResult = (sameTypePosts.items ?? [])
            .filter((post) => post.id !== currentPostId && post.postType === postType)
            .slice(0, 6);
        } catch (error) {
          console.warn("Related posts fetch failed:", error);
        }
        if (filteredResult.length < 3) {
          try {
            const allPostsResult = await getAllPosts({ page: 1, limit: 20 });
            const more = (allPostsResult.items ?? [])
              .filter(
                (post) =>
                  post.id !== currentPostId &&
                  !filteredResult.some((fp) => fp.id === post.id)
              )
              .slice(0, 6 - filteredResult.length);
            filteredResult = [...filteredResult, ...more];
          } catch {
            // ignore
          }
        }
        setRelatedPosts(filteredResult.slice(0, 6));
      } catch (error) {
        console.error("RelatedPosts fetch error:", error);
        setRelatedPosts([]);
      }
    };
    fetchPosts();
  }, [currentPostId, postType, initialRelatedPosts]);

  if (relatedPosts.length === 0) {
    return (
      <p className="text-gray-500 mt-6">
        {t("noPostsFound") || "No related posts available"}
      </p>
    );
  }

  return (
    <div className="mt-12 relative">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <button
            ref={prevRef}
            className="w-10 h-10 flex items-center justify-center bg-[#FFF7E6] rounded-full border border-jsyellow hover:bg-jsyellow hover:text-white transition"
            aria-label="Əvvəlki"
            type="button"
          >

            <svg width="24" height="24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="w-10 h-10 flex items-center justify-center bg-[#FFF7E6] rounded-full border border-jsyellow hover:bg-jsyellow hover:text-white transition"
            aria-label="Növbəti"
            type="button"
          >

            <svg width="24" height="24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <Swiper
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay, Navigation]}
        spaceBetween={24}
        slidesPerView={1.2}

        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}

        onBeforeInit={(swiper) => {

          if (
            swiper.params.navigation &&
            typeof swiper.params.navigation !== "boolean"
          ) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        breakpoints={{
          640: { slidesPerView: 1.2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 3 },
          2500: { slidesPerView: 4 }, 
        }}
      >
        {relatedPosts.map((post, index) => (
          <SwiperSlide key={post.id} className="!h-auto flex items-stretch">
            <div className="flex h-full min-h-0 w-full">
              <RelatedPostCard
                post={post}
                locale={locale}
                t={t}
                loadEager={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

interface RelatedPostCardProps {
  post: Post;
  locale: Locale;
  t: (key: string) => string;
  loadEager?: boolean;
}

function RelatedPostCard({ post, locale, t, loadEager = false }: RelatedPostCardProps) {
  const dateStr = formatDate(post.createdAt);
  const timeStr = formatTime(post.createdAt);
  const showTime = post.postType !== "OFFERS";

  const getPostTypeLabel = (type: PostType) => {
    switch (type) {
      case PostType.BLOG:
        return t("blog");
      case PostType.NEWS:
        return t("news");
      case PostType.EVENT:
        return t("event");
      case PostType.OFFERS:
        return t("offers");
      default:
        return type;
    }
  };

  const contentPreview =
    (post.content?.[locale]?.replace(/<[^>]*>/g, "")?.slice(0, 100) ?? "") +
    "...";

  const getPostUrlPrefix = (type: PostType) => {
    switch (type) {
      case PostType.BLOG:
        return "blog";
      case PostType.OFFERS:
        return "offers";
      case PostType.EVENT:
        return "events";
      case PostType.NEWS:
      default:
        return "news";
    }
  };

  const postUrl = post.slug[locale]
    ? `/${getPostUrlPrefix(post.postType)}/${post.slug[locale]}`
    : `/${getPostUrlPrefix(post.postType)}/${post.slug["az"] || post.id}`;

  const readMoreText =
    t("readMore") || (locale === "az" ? "Daha çox oxu" : "Читать далее");

  return (
    <Link
      href={postUrl}
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[32px] border border-jsyellow bg-[#fef7eb] transition-transform duration-300 hover:shadow-lg hover:shadow-[rgba(252,174,30,0.15)]"
    >
      {(() => {
        const imageSrc = getPostImageSrc(post.imageUrl, locale);
        return imageSrc ? (
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-[32px] bg-[#e8e0d4]">
            <Image
              src={imageSrc}
              alt={post.title[locale] || "Post image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover object-center"
              quality={64}
              priority={loadEager}
              {...(!loadEager ? { loading: "lazy" as const } : {})}
            />
          </div>
        ) : null;
      })()}
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MdCalendarMonth className="w-3.5 h-3.5 text-jsyellow flex-shrink-0" aria-hidden />
              {dateStr}
            </span>
            {showTime && timeStr && (
              <span className="inline-flex items-center gap-1">
                <MdAccessTime className="w-3.5 h-3.5 text-jsyellow flex-shrink-0" aria-hidden />
                {timeStr}
              </span>
            )}
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              post.postType === PostType.BLOG
                ? "bg-blue-100 text-blue-800"
                : post.postType === PostType.NEWS
                ? "bg-green-100 text-green-800"
                : post.postType === PostType.EVENT
                ? "bg-purple-100 text-purple-800"
                : post.postType === PostType.OFFERS
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {getPostTypeLabel(post.postType)}
          </span>
        </div>
        <h3 className="font-semibold text-xl mb-3 line-clamp-2">
          {post.title[locale] || "Title not available"}
        </h3>
        <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-600">
          {contentPreview}
        </p>
        <span className="mt-auto font-medium text-jsyellow hover:underline">
          {readMoreText} →
        </span>
      </div>
    </Link>
  );
}

"use client";

import { Locale } from "@/i18n/request";
import { Post, PostsResponse } from "@/types/post";
import { useLocale, useTranslations } from "next-intl";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PostCard from "../../post/card";

interface SliderProps {
  data: PostsResponse;
}

export default function PostsSlider({ data }: SliderProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("postsPage");

  return (
    <div className="pt-1 pb-4 4xl:py-6">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
          1500: { slidesPerView: 4, spaceBetween: 28 },
        }}
        className="!pb-4 4xl:!pb-6"
        watchOverflow
        observer
        observeParents
      >
        {data.items.map((post: Post, idx: number) => (
          <SwiperSlide key={idx} className="!h-auto flex items-stretch">
            <div className="flex h-full min-h-0 w-full">
              <PostCard
                t={t}
                locale={locale}
                post={post}
                imagePriority={idx === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

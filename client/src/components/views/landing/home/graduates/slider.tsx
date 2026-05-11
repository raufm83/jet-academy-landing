"use client";

import GraduateCard from "@/components/views/landing/graduates/graduate-card";
import type { Graduate } from "@/types/graduate";
import type { Locale } from "@/i18n/request";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface GraduatesSliderProps {
  graduates: Graduate[];
  locale: Locale;
}

export default function GraduatesSlider({
  graduates,
  locale,
}: GraduatesSliderProps) {
  return (
    <div className="pt-1 pb-4 4xl:py-6">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={graduates.length > 3}
        spaceBetween={24}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          2560: { slidesPerView: 4 },
          3540: { slidesPerView: 6 },
        }}
        className="!pb-4"
      >
        {graduates.map((graduate, index) => (
          <SwiperSlide
            key={graduate.id}
            className="!h-auto min-h-[420px] rounded-3xl 4xl:rounded-[48px]"
          >
            <div className="h-full min-h-[420px] shadow-lg rounded-3xl 4xl:rounded-[48px]">
              <GraduateCard
                graduate={graduate}
                locale={locale}
                loadEager={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

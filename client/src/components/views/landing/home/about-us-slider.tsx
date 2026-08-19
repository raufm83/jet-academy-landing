"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface AboutUsSliderProps {
  points: { title: string; description: string }[];
}

export default function AboutUsSlider({ points }: AboutUsSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative group">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          if (typeof swiper.params.navigation !== "boolean" && swiper.params.navigation) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 2, spaceBetween: 24 },
          2500: { slidesPerView: 4, spaceBetween: 32 },
        }}
        className="pb-4"
      >
        {points.map((point, index) => (
          <SwiperSlide key={index} className="h-auto">
            <div
              className={`
                h-full w-full border
                flex items-start
                gap-3 4xl:gap-6
                bg-white border-jsyellow
                rounded-[32px]
                p-6 4xl:p-8
                text-jsblack
              `}
            >
              <div
                className="
                  bg-jsyellow text-white font-bold
                  flex items-center justify-center
                  text-xl 4xl:text-2xl
                  rounded-full
                  p-4
                  h-10 w-10 4xl:h-12 4xl:w-12 shrink-0
                  [@media(min-width:3500px)]:!text-2xl
                "
              >
                {index + 1}
              </div>

              <div className="flex flex-col gap-4 4xl:gap-6">
                <h3 className="font-semibold text-xl sm:text-[22px] lg:text-lg xl:text-[28px] 4xl:text-3xl [@media(min-width:3500px)]:!text-3xl">
                  {point.title}
                </h3>
                <p className="text-base 4xl:text-lg [@media(min-width:3500px)]:!text-2xl">
                  {point.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex justify-center gap-4 mt-6 md:hidden">
        <button
          ref={prevRef}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-500 hover:text-jsyellow hover:border-jsyellow transition-colors disabled:opacity-50"
          aria-label="Previous"
        >
          <MdChevronLeft size={24} />
        </button>
        <button
          ref={nextRef}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-500 hover:text-jsyellow hover:border-jsyellow transition-colors disabled:opacity-50"
          aria-label="Next"
        >
          <MdChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

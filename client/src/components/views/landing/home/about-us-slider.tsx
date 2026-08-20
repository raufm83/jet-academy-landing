"use client";

import React from "react";
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

  const PointCard = ({ point, index }: { point: { title: string; description: string }; index: number }) => (
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
        <h3 className="font-semibold text-lg sm:text-xl lg:text-base xl:text-[22px] 4xl:text-2xl [@media(min-width:3500px)]:!text-3xl">
          {point.title}
        </h3>
        <p className="text-sm md:text-base 4xl:text-lg [@media(min-width:3500px)]:!text-2xl">
          {point.description}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Slider */}
      <div className="relative group md:hidden">
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={{
            prevEl: ".about-prev",
            nextEl: ".about-next",
          }}
          spaceBetween={16}
          slidesPerView={1}
          className="pb-4"
        >
          {points.map((point, index) => (
            <SwiperSlide key={index} className="h-auto">
              <PointCard point={point} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="about-prev flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-500 hover:text-jsyellow hover:border-jsyellow transition-colors disabled:opacity-50"
            aria-label="Previous"
          >
            <MdChevronLeft size={24} />
          </button>
          <button
            className="about-next flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-500 hover:text-jsyellow hover:border-jsyellow transition-colors disabled:opacity-50"
            aria-label="Next"
          >
            <MdChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
        {points.map((point, index) => (
          <PointCard key={index} point={point} index={index} />
        ))}
      </div>
    </>
  );
}

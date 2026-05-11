"use client";

import CourseCard from "@/components/shared/course-card";
import { Course } from "@/types/course";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface SwiperWrapperProps {
  courses: Course[];
  locale: string;
  autoplayDelayMs?: number;
  translations: {
    lessonPerWeek: string;
    lesson: (count: number) => string;
    duration: string;
    months: string;
  };
}

export default function SwiperWrapper({
  courses,
  locale,
  autoplayDelayMs = 2500,
  translations,
}: SwiperWrapperProps) {
  return (
    <>
      <style jsx global>{`
        @media (min-width: 1024px) {
          .courses-swiper .swiper,
          .courses-swiper .swiper-wrapper,
          .courses-swiper .swiper-slide {
            overflow: visible !important;
          }
          .courses-swiper .swiper-wrapper {
            align-items: stretch !important;
          }
          .courses-swiper .swiper-slide {
            display: flex !important;
            height: auto !important;
          }
        }
      `}</style>
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: autoplayDelayMs, disableOnInteraction: false }}
        loop={courses.length > 1}
        autoHeight
        className="py-6"
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 22 },
          1536: { slidesPerView: 4, spaceBetween: 24 },
        }}
      >
        {courses.map((course, index) => (
          <SwiperSlide
            key={course.id}
            className="h-auto overflow-visible lg:!flex lg:!h-auto"
            style={{ zIndex: courses.length - index }}
          >
            <CourseCard
              course={course}
              locale={locale}
              translations={translations}
              onlyTitleBold
              imagePriority={false}
              className="hover:z-[2] transform-gpu will-change-transform lg:h-full lg:min-h-0 lg:w-full"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}

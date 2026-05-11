"use client";

import { TeamMember } from "@/types/team";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import TeamMemberCard from "./team-member-card";
import { Locale } from "@/i18n/request";

interface TeamSliderProps {
  teamMembers: TeamMember[];
  locale: Locale;
}

export default function TeamSlider({ teamMembers, locale }: TeamSliderProps) {
  return (
    <div className="pt-2 pb-8 4xl:py-12">
      <Swiper
        modules={[Autoplay, Pagination, Keyboard]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        keyboard={{
          enabled: true,
        }}
        loop={teamMembers.length > 5}
        grabCursor={true}
        spaceBetween={24}
        centeredSlides={true}
        centerInsufficientSlides={true}
        breakpoints={{
          0:    { slidesPerView: 1.6, spaceBetween: 16 },
          480:  { slidesPerView: 1.9, spaceBetween: 20 },
          640:  { slidesPerView: 2.2, spaceBetween: 24 },
          768:  { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
          1280: { slidesPerView: 5, spaceBetween: 24 },
          1536: { slidesPerView: 6, spaceBetween: 30 },
          2500: { slidesPerView: 7, spaceBetween: 40 },
          3500: { slidesPerView: 9, spaceBetween: 50 },
        }}
        className="!pb-20 !pt-2 !px-0 !overflow-visible"
      >
        {teamMembers?.map((member, index) => (
          <SwiperSlide key={member.id} className="!h-auto flex items-stretch">
            <div className="w-full h-full flex">
              <TeamMemberCard
                member={member}
                index={index}
                locale={locale}
                loadEager={index < 2}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #D1D5DB;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #1560bd !important;
          width: 24px !important;
          border-radius: 99px !important;
        }
      `}</style>
    </div>
  );
}

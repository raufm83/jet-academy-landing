"use client";

import SectionTitle from "@/components/shared/section-title";
import { CourseTeacherAsMember, TeamMember } from "@/types/team";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import TeamMemberCard from "../about/team-member-card";
import { Locale } from "@/i18n/request";

interface TeachersSectionProps {
  data: { teachers: (CourseTeacherAsMember | TeamMember)[] };
  locale: Locale;
  title: string;
  description: string;
}

export default function TeachersSection({
  data,
  locale,
  title,
  description,
}: TeachersSectionProps) {
  const activeTeachers =
    data.teachers?.filter((t) => {
      if ("teacher" in t) {
        return t.teacher?.isActive !== false;
      }
      return (t as TeamMember).isActive !== false;
    }) ?? [];

  if (activeTeachers.length === 0) return null;

  return (
    <section className="mt-10 md:mt-20 relative select-none w-full overflow-hidden">
      <SectionTitle title={title} description={description} />

      <div className="py-8 4xl:py-12">
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
          loop={activeTeachers.length > 5}
          grabCursor={true}
          spaceBetween={24}
          centeredSlides={true}
          centerInsufficientSlides={true}
          breakpoints={{
            0: { slidesPerView: 1.6, spaceBetween: 16 },
            480: { slidesPerView: 1.9, spaceBetween: 20 },
            640: { slidesPerView: 2.2, spaceBetween: 24 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
            1536: { slidesPerView: 6, spaceBetween: 30 },
            2500: { slidesPerView: 7, spaceBetween: 40 },
            3500: { slidesPerView: 9, spaceBetween: 50 },
          }}
          className="!pb-20 !pt-2 !px-0 !overflow-visible"
        >
          {activeTeachers.map((teacher, index) => (
            <SwiperSlide key={teacher.id} className="!h-auto flex items-stretch">
              <div className="w-full h-full flex">
                <TeamMemberCard
                  member={teacher}
                  index={index}
                  locale={locale}
                  noHover={false}
                  isCoursePage={true}
                  loadEager={index < 2}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #d1d5db;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #1560bd !important;
          width: 24px !important;
          border-radius: 99px !important;
        }
      `}</style>
    </section>
  );
}

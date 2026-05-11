"use client";
import ProjectCard from "@/components/views/landing/projects/project-card";
import { ProjectResponse } from "@/types/student-projects";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface SliderProps {
  data: ProjectResponse;
}

export default function ProjectSlider({ data }: SliderProps) {
  return (
    <div className="pt-1 pb-4 4xl:py-6">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={data.items.length > 3}
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
        {data.items.map((project, idx) => (
          <SwiperSlide
            key={project.id}
            className="!h-[327px] rounded-3xl 4xl:rounded-[48px]"
          >
            <div className="h-full shadow-lg rounded-3xl 4xl:rounded-[48px]">
              <ProjectCard
                key={project.id}
                description={project.description}
                title={project.title}
                imageUrl={resolveOptimizedImageUrl(project.imageUrl, "project")}
                link={project.link}
                category={project.category}
                loadEager={idx === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

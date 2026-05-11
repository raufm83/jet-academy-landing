"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import SectionTitle from "@/components/shared/section-title";
import { CourseResponse } from "@/types/course";
import { useLocale, useTranslations } from "next-intl";
import CourseCard from "@/components/shared/course-card";

const SwiperWrapper = lazy(() => import("./swiper-wrapper"));

interface ICoursesSlider {
  courses: CourseResponse;
  showTitle?: boolean;
  variant?: "grid" | "swiper";
  customTitle?: string;
  customDescription?: string;
  autoplayDelayMs?: number;
}

const CoursesSlider = ({
  courses,
  showTitle = true,
  variant = "grid",
  customTitle,
  customDescription,
  autoplayDelayMs,
}: ICoursesSlider) => {
  const t = useTranslations("courseInfo");
  const currentLocale = useLocale();
  /** Swiper SSR ilə problemli ola bilər; grid isə dərhal SSR/CSR göstərilir. */
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const displayCourses =
    courses?.items?.filter((c) => c.published === true) ?? [];
  if (displayCourses.length === 0) return null;

  const swiperDeferred = variant === "swiper" && !isClient;

  const title = customTitle ?? t("title");
  const description = customDescription ?? t("description");

  const translations = {
    lessonPerWeek: t("lessonPerWeek"),
    lesson: (count: number) => t("lesson", { count }),
    duration: t("duration"),
    months: t("months"),
  };

  const skeleton = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[320px] sm:h-[340px] rounded-2xl bg-gray-100" />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto my-12 sm:my-16 lg:my-20 px-0">
      {showTitle && <SectionTitle title={title} description={description} />}

      <div
        className={
        variant === "swiper"
          ? "relative overflow-hidden lg:overflow-visible courses-swiper"
          : "relative"
        }
      >
        {swiperDeferred ? (
          skeleton
        ) : variant === "swiper" ? (
          <Suspense fallback={skeleton}>
            <SwiperWrapper
              courses={displayCourses}
              locale={currentLocale}
              translations={translations}
              autoplayDelayMs={autoplayDelayMs}
            />
          </Suspense>
        ) : (
          <div
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
              gap-6 sm:gap-8 lg:gap-10 py-6
            "
          >
            {displayCourses.map((course, index) => (
              <div key={course.id} style={{ zIndex: displayCourses.length - index }} className="relative">
                <CourseCard
                  course={course}
                  locale={currentLocale}
                  translations={translations}
                  imagePriority={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesSlider;

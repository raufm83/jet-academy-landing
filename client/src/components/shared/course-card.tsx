"use client";

import { Course } from "@/types/course";
import Image from "next/image";
import Link from "next/link";
import { getCourseDisplayData, getCourseImageUrl, normalizeLocale } from "@/utils/course-helpers";
import { Locale } from "@/i18n/request";

interface CourseCardProps {
  course: Course;
  locale?: string | Locale;
  translations?: {
    lessonPerWeek?: string;
    lesson?: string | ((count: number) => string);
    duration?: string;
    months?: string;
    age?: string;
    level?: string;
  };
  showAge?: boolean;
  showLevel?: boolean;
  /** Sliders: only the course title is bold; body/meta/tags stay regular weight */
  onlyTitleBold?: boolean;
  className?: string;
  /** LCP / ilk slayt: künclük şəkil üçün priority */
  imagePriority?: boolean;
}

export default function CourseCard({
  course,
  locale,
  translations = {},
  showAge = false,
  showLevel = false,
  onlyTitleBold = false,
  className = "",
  imagePriority = false,
}: CourseCardProps) {
  const normalizedLocale = normalizeLocale(locale);
  const data = getCourseDisplayData(course, normalizedLocale);
  const cardImgSrc = getCourseImageUrl(course.imageUrl);

  const getLessonText = (count: number) => {
    if (typeof translations.lesson === "function") {
      return translations.lesson(count);
    }
    return translations.lesson || (normalizedLocale === "az" ? "dərs" : "lesson");
  };

  const lessonPerWeek = course.lessonPerWeek;

  return (
    <Link
      href={data.href}
      className={`
          group relative isolate z-0 flex flex-col justify-between
          font-normal
          rounded-2xl overflow-hidden
          p-6 sm:p-10
          min-h-[280px] sm:min-h-[340px]
          transition-all duration-300
          hover:scale-[1.03] hover:shadow-xl
          cursor-pointer
          ${
            onlyTitleBold
              ? "[&_p]:!font-normal [&_span]:!font-normal [&_h2]:!font-bold"
              : ""
          }
          ${className}
        `}
      style={{
        backgroundColor: data.cardStyle.backgroundColor,
        color: data.cardStyle.textColor,
        border: `2px solid ${data.cardStyle.borderColor}`,
      }}
    >
      <div className="relative z-0">
        <h2 className="text-2xl sm:text-2xl font-bold mb-3 leading-tight text-gray-900 line-clamp-2">
          {data.title}
        </h2>
        <p className="text-base sm:text-lg font-normal opacity-80 line-clamp-2">
          {data.slogan}
        </p>
      </div>

      <div className="relative z-0 mt-4 flex flex-col gap-1 text-sm opacity-90 sm:mt-5 sm:text-base">
        {!!lessonPerWeek && (
          <p className="font-normal">
            <span>
              {translations.lessonPerWeek ||
                (normalizedLocale === "az" ? "Həftədə" : "Per week")}
              :
            </span>{" "}
            {lessonPerWeek} {getLessonText(lessonPerWeek)}
          </p>
        )}
        {showAge && data.ageRange && (
          <p className="font-normal">
            <span>
              {translations.age || (normalizedLocale === "az" ? "Yaş:" : "Age:")}
            </span>{" "}
            {data.ageRange}
          </p>
        )}
        {showLevel && data.level && (
          <p className="font-normal">
            <span>
              {translations.level || (normalizedLocale === "az" ? "Səviyyə:" : "Level:")}
            </span>{" "}
            {data.level}
          </p>
        )}
        <p className="font-normal">
          <span>
            {translations.duration || (normalizedLocale === "az" ? "Müddət:" : "Duration:")}
          </span>{" "}
          {data.duration}{" "}
          {translations.months || (normalizedLocale === "az" ? "ay" : "months")}
        </p>
      </div>

      {data.tags.length > 0 && (
        <div className="relative z-0 mt-6 -mx-8 overflow-hidden px-8">
          <div className="scrolling-tags flex w-max gap-2">
            {[...data.tags, ...data.tags].map((tag, i) => (
              <span
                key={`${course.id}-${i}`}
                className="
                    rounded-full bg-white bg-opacity-80 px-3.5 py-1.5 text-sm font-normal
                    shadow-sm whitespace-nowrap sm:px-3 sm:py-1 sm:text-sm
                  "
                style={{
                  color: data.cardStyle.textColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="
          pointer-events-none absolute z-[1] h-[120px] w-[120px] rounded-full opacity-30 blur-2xl
          -bottom-7 -right-7
          sm:-bottom-10 sm:-right-10 sm:h-[160px] sm:w-[160px]
        "
        style={{ backgroundColor: data.cardStyle.borderColor }}
        aria-hidden
      />

      <div
        className="
            pointer-events-none absolute bottom-3 right-3 z-[60] h-[132px] w-[132px] drop-shadow-lg
            transition-transform duration-300 group-hover:scale-105
            min-[400px]:bottom-3.5 min-[400px]:right-3.5 min-[400px]:h-[140px] min-[400px]:w-[140px]
            sm:bottom-8 sm:right-6 sm:h-[140px] sm:w-[140px] sm:group-hover:scale-110
          "
      >
        <Image
          src={cardImgSrc}
          alt=""
          fill
          className="object-contain object-right"
          sizes="(max-width:639px) 144px, 150px"
          unoptimized={cardImgSrc.endsWith(".svg")}
          quality={imagePriority ? 64 : 62}
          priority={imagePriority}
          {...(!imagePriority && !cardImgSrc.endsWith(".svg")
            ? { loading: "lazy" as const }
            : {})}
        />
      </div>
    </Link>
  );
}

import React from "react";
import Image from "next/image";
import LazyHtmlContent from "@/components/shared/lazy-html-content";
import CourseContent from "./course-content";
import { deferEmbedsInHtml } from "@/utils/deferEmbedsInHtml";
import { BLUR_PLACEHOLDER_YELLOW } from "@/utils/imagePlaceholder";
import { buildImageUrl } from "@/utils/imageUrl";
import { Locale } from "@/i18n/request";
import { getTranslations } from "next-intl/server";

interface CourseHeroProps {
  title: string;
  description: string;
  courseOverviewText: string;
  tags?: string[];
  locale: Locale;
  data: any;
  params: {
    slug: string;
    locale: string;
  };
}

export default async function CourseHero({
  title,
  description,
  courseOverviewText,
  tags = [],
  locale,
  data,
}: CourseHeroProps) {
  const t = await getTranslations("singleCoursePage");

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 lg:gap-6 animate-fadeIn">
      <h1 className="font-bold leading-snug text-jsblack text-[clamp(20px,2.2vw,34px)] lg:text-[clamp(28px,2vw,40px)] [@media(min-width:2500px)]:!text-5xl [@media(min-width:3500px)]:!text-6xl">
        {title}
      </h1>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-[clamp(11px,1.1vw,14px)] [@media(min-width:2500px)]:!text-xl [@media(min-width:3500px)]:!text-2xl"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6 w-full">
        <div
          className="relative bg-[#fef7eb]/60 border border-jsyellow rounded-xl sm:rounded-2xl lg:rounded-[32px] p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg w-full min-h-[200px]"
        >
          {data?.imageUrl && (
            <Image
              src={buildImageUrl(data.imageUrl)}
              alt=""
              fill
              priority
              quality={85}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER_YELLOW}
              className="object-cover rounded-xl sm:rounded-2xl lg:rounded-[32px] opacity-[0.05]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 800px"
              fetchPriority="high"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl lg:rounded-[32px]" />
          <div className="relative z-10">
            <p className="font-semibold mb-2 sm:mb-3 lg:mb-4 text-[clamp(16px,1.6vw,22px)] lg:text-[clamp(18px,1.5vw,26px)] [@media(min-width:2500px)]:!text-3xl [@media(min-width:3500px)]:!text-4xl">
              {courseOverviewText}
            </p>
            <LazyHtmlContent
              html={deferEmbedsInHtml(description)}
              className="prose prose-xs sm:prose-sm lg:prose-base max-w-none text-[clamp(14px,1.35vw,18px)] font-normal leading-relaxed text-jsblack/90 [&_p]:font-normal [&_li]:font-normal [&_strong]:font-semibold [@media(min-width:2500px)]:!text-2xl [@media(min-width:3500px)]:!text-3xl"
              skipClean
            />
          </div>
        </div>

        <div className="w-full">
          <CourseContent title={t("courseModules")} locale={locale === "en" ? "en" : "az"} modules={data.modules} />
        </div>
      </div>
    </div>
  );
}

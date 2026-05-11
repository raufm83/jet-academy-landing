"use client";
import { Link } from "@/i18n/routing";
import { cn } from "@/utils/cn";
import { coursesListingPath } from "@/utils/course-paths";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { HiArrowSmRight } from "react-icons/hi";

export default function HeroConsult() {
  const t = useTranslations("hero");
  const locale = useLocale();
  return (
    <Link
      href={coursesListingPath(locale)}
      className={cn(
        "group/btn",
        "bg-jsyellow hover:bg-white border hover:border-jsyellow hover:text-jsyellow text-white hover:opacity-70",
        "py-2.5 px-6 rounded-[28px]",
        "flex items-center transition-all duration-300 justify-center gap-2 flex-row-reverse",
        "font-semibold",
        "shadow-jsshadow mx-auto lg:mx-0",
        "[@media(min-width:3500px)]:!text-2xl",
        "w-fit"
      )}
    >
      <span className="inline-flex transition-transform duration-300 group-hover/btn:rotate-[10deg]">
        <HiArrowSmRight
          size={22}
          className="[@media(min-width:3500px)]:!w-8 [@media(min-width:3500px)]:!h-8"
          aria-hidden
        />
      </span>
      <span className="transition-transform duration-300 group-hover/btn:-translate-y-px">
        {t("getConsult")}
      </span>
    </Link>
  );
}

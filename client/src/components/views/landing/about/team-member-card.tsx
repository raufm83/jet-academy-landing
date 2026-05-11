"use client";

import type { Locale } from "@/i18n/request";
import { CourseTeacherAsMember, TeamMember } from "@/types/team";
import { cn } from "@/utils/cn";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";
import Image from "next/image";
import { memo } from "react";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshIR0dIiIdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

const TeamMemberCard = memo(
  ({
    member,
    locale,
    loadEager = false,
    noHover = false,
    isCoursePage = false,
  }: {
    member: CourseTeacherAsMember | TeamMember;
    index: number;
    loadEager?: boolean;
    noHover?: boolean;
    locale: Locale;
    isCoursePage?: boolean;
  }) => {
    const langKey: "az" | "en" = locale === "ru" ? "az" : locale;
    const imageUrl =
      "teacher" in member ? member.teacher.imageUrl : member.imageUrl;
    const bio = "teacher" in member ? member.teacher.bio : member.bio;
    const fullNameObj =
      "teacher" in member ? member.teacher.fullName : member.fullName;
    const fullName = typeof fullNameObj === "string" ? fullNameObj : (fullNameObj[langKey] || fullNameObj.az);

    const description =
      "teacher" in member
        ? (member.courseTeacher?.description?.[langKey] || member.courseTeacher?.description?.az || "")
        : (bio?.[langKey] || bio?.az || "");

    const imgSrc = resolveOptimizedImageUrl(imageUrl, "team");

    return (
      <div
        className={cn(
          "border border-jsyellow/40 [@media(min-width:2500px)]:h-full [@media(min-width:3500px)]:h-[400px] cursor-pointer rounded-[32px] min-h-[220px] p-5 bg-[#fef7eb] transition-all duration-300 w-full",
          noHover ? "" : "hover:border-jsyellow hover:shadow-lg hover:scale-[1.02]"
        )}
      >
        <div className="relative aspect-square rounded-[24px] overflow-hidden mb-4 shadow-sm">
          <Image
            fill
            src={imgSrc}
            alt={`Team member ${fullName}`}
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 640px) 55vw, (max-width: 1024px) 30vw, 280px"
            quality={68}
            priority={loadEager}
            {...(loadEager
              ? {}
              : { loading: "lazy" as const, placeholder: "blur" as const, blurDataURL: BLUR })}
          />
        </div>
        <h4 className="font-semibold [@media(min-width:2500px)]:!text-lg [@media(min-width:3500px)]:!text-3xl text-md text-jsblack text-center">{fullName}</h4>
        <p className="text-gray-600 [@media(min-width:2500px)]:!text-md [@media(min-width:3000px)]:text-2xl text-xs text-center mt-1 line-clamp-2 min-h-[2rem]">{description}</p>

        {isCoursePage && "position" in member && member.position && (
          <p className="text-xs text-jsyellow mt-1 [@media(min-width:3000px)]:text-xl text-center font-medium">{member.position}</p>
        )}
      </div>
    );
  }
);

TeamMemberCard.displayName = "TeamMemberCard";

export default TeamMemberCard;

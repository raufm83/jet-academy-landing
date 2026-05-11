"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MdPlayCircleFilled } from "react-icons/md";
import type { Graduate } from "@/types/graduate";
import type { Locale } from "@/i18n/request";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";

interface GraduateCardProps {
  graduate: Graduate;
  locale: Locale;
  loadEager?: boolean;
}

function extractYoutubeId(url: string): string | null {
  const m =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/) ||
    url.match(/^([a-zA-Z0-9_-]{11})$/);
  return m ? m[1] : null;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

export default function GraduateCard({
  graduate,
  locale,
  loadEager = false,
}: GraduateCardProps) {
  const lang: "az" | "en" = locale === "en" ? "en" : "az";
  const name = graduate.name[lang] || graduate.name.az;
  const story = graduate.story[lang] || graduate.story.az;
  const plainStory = stripHtml(story);
  const preview = plainStory.length > 200 ? `${plainStory.slice(0, 200)}...` : plainStory;

  const [showVideo, setShowVideo] = useState(false);
  const youtubeId =
    graduate.mediaType === "youtube" ? extractYoutubeId(graduate.mediaUrl) : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-jsyellow/20 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
      {/* Media */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {graduate.mediaType === "youtube" && youtubeId ? (
          showVideo ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              title={name}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 h-full w-full"
            >
              <Image
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt={name}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 360px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                quality={loadEager ? 62 : 60}
                priority={loadEager}
                {...(!loadEager ? { loading: "lazy" as const } : {})}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                <MdPlayCircleFilled className="text-white drop-shadow-lg" size={64} />
              </div>
            </button>
          )
        ) : (
          <Image
            src={resolveOptimizedImageUrl(graduate.mediaUrl, "graduate")}
            alt={name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            quality={loadEager ? 62 : 60}
            priority={loadEager}
            {...(!loadEager ? { loading: "lazy" as const } : {})}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-[#1F2937] sm:text-xl">{name}</h3>
        {graduate.courseName && (graduate.courseName[lang] || graduate.courseName.az) && (
          <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-jsyellow/10 px-3 py-0.5 text-xs font-medium text-jsyellow">
            {graduate.courseName[lang] || graduate.courseName.az}
          </span>
        )}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6b6b6b] line-clamp-4">
          {preview}
        </p>
      </div>

      {/* Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-jsyellow to-jsyellow/40" />
    </div>
  );
}

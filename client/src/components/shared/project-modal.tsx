"use client";
import { useEffect, useMemo, useState } from "react";
import { useProjectModal } from "@/hooks/useProjectModal";
import React from "react";
import { MdClose } from "react-icons/md";
import { MdPlayArrow } from "react-icons/md";
import Image from "next/image";

export default function ProjectModal() {
  const { isOpen, toggle, link } = useProjectModal();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(/(?:\/|v=)([a-zA-Z0-9_-]{11})(?:\?|&|$)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const videoId = useMemo(
    () => (link ? link.match(/(?:\/|v=)([a-zA-Z0-9_-]{11})(?:\?|&|$)/)?.[1] || null : null),
    [link]
  );

  const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

  // Səhifə skrolunu kilidlə (modal açıqkən)
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setShouldLoadVideo(false);
  }, [isOpen, link]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[999] p-4
        flex items-center justify-center
        h-[100dvh] bg-jsblack/60 backdrop-blur-[2px]
      "
      onClick={() => toggle()} // backdrop-a klik → bağla
      role="dialog"
      aria-modal="true"
      aria-label="Project video"
    >
      <div
        className="relative my-auto w-[92vw] max-w-[900px] bg-white rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // içəri klik → bağlanmasın
      >
        {/* Close */}
        <button
          onClick={() => toggle()}
          className="absolute top-2 right-2 md:top-3 md:right-3 z-10
                     rounded-full bg-white/95 text-jsblack w-8 h-8
                     grid place-items-center shadow-lg
                     mt-[env(safe-area-inset-top)]"
          aria-label="Close"
        >
          <MdClose className="text-xl" />
        </button>

        {/* Video 16:9 */}
        <div className="relative w-full aspect-video">
          {!shouldLoadVideo && thumbnailUrl && (
            <button
              type="button"
              onClick={() => setShouldLoadVideo(true)}
              className="absolute inset-0 z-[2] grid place-items-center bg-black/25"
              aria-label="Play project video"
            >
              <Image
                src={thumbnailUrl}
                alt="Video thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 92vw, 900px"
              />
              <span className="relative z-[3] grid h-16 w-16 place-items-center rounded-full bg-white/90 text-jsblack shadow-lg">
                <MdPlayArrow className="text-4xl translate-x-[1px]" />
              </span>
            </button>
          )}

          {link && (shouldLoadVideo || !thumbnailUrl) && (
            <iframe
              src={getEmbedUrl(link)}
              title="Project video player"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}

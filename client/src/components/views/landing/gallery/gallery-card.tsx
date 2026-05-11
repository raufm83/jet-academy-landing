"use client";

import { cn } from "@/utils/cn";
import {
  GALLERY_GRID_SIZES,
  OPTIMIZED_IMAGE_QUALITY_GRID,
  resolveOptimizedImageUrl,
} from "@/utils/optimized-image-url";
import Image from "next/image";
import { useState } from "react";
import { MdFullscreen } from "react-icons/md";

interface GalleryCardProps {
  imageUrl?: string;
  imageAlt?: string;
  title?: string | null;
  isLoading?: boolean;
  /** LCP: ilk sıra və ya ilk slayd üçün */
  loadEager?: boolean;
}

function GalleryImage({
  imageUrl,
  imageAlt,
  title,
  loadEager = false,
}: Pick<GalleryCardProps, "imageUrl" | "imageAlt" | "title" | "loadEager">) {
  const [src, setSrc] = useState(() =>
    resolveOptimizedImageUrl(imageUrl, "gallery")
  );
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full transition-transform duration-300 md:group-hover:scale-105">
      <Image
        src={hasError ? "/default-course-image.svg" : src}
        alt={imageAlt || title || "Gallery image"}
        fill
        className="object-cover rounded-3xl"
        sizes={GALLERY_GRID_SIZES}
        quality={OPTIMIZED_IMAGE_QUALITY_GRID}
        priority={loadEager}
        {...(!loadEager ? { loading: "lazy" as const } : {})}
        decoding="async"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setSrc("/default-course-image.svg");
          }
        }}
      />
    </div>
  );
}

export default function GalleryCard({
  imageUrl,
  imageAlt,
  title,
  isLoading = false,
  loadEager = false,
}: GalleryCardProps) {
  return (
    <div className="relative w-full h-[280px] sm:h-[320px] md:h-[350px] lg:h-[300px] xl:h-[350px] cursor-pointer overflow-hidden rounded-3xl group">
      {isLoading ? (
        <div className="w-full h-full bg-gray-300 ease-in-out duration-200 animate-pulse rounded-3xl"></div>
      ) : (
        <GalleryImage
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          title={title}
          loadEager={loadEager}
        />
      )}

      {!isLoading && title && (
        <div
          className={cn(
            "absolute inset-0 md:flex bg-gradient-to-t from-black/60 via-black/30 to-transparent hidden flex-col justify-center items-center px-6 backdrop-blur-sm transition-all duration-300 delay-[50ms]",
            "md:opacity-0 md:group-hover:opacity-100"
          )}
        >
          <div className="bg-jsyellow md:group-hover:opacity-100 opacity-0 transition-all duration-400 delay-75 ease-in-out px-6 py-6 sm:px-8 sm:py-8 justify-center w-fit text-2xl sm:text-3xl rounded-full flex items-center shadow-lg">
            <MdFullscreen />
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-medium text-sm sm:text-base md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-100 text-center">
              {title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

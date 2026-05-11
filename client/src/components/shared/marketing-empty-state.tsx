import Image from "next/image";
import type { ReactNode } from "react";

export interface MarketingEmptyStateProps {
  /** Default: kampaniya illüstrasiyası (offers səhifəsi üçün) */
  imageSrc?: string;
  imageAlt?: string;
  /** Mətn blokları üçün (məs. iki sətirdə kampaniya mesajı) */
  title?: ReactNode;
  line1?: string;
  line2?: string;
  /** Əsasən vakansiyalar səhifəsi üçün: böyük min-height olmadan kompakt blok */
  compact?: boolean;
}

const DEFAULT_IMAGE = "/no-campaigns.svg";

export default function MarketingEmptyState({
  imageSrc = DEFAULT_IMAGE,
  imageAlt,
  title,
  line1,
  line2,
  compact = false,
}: MarketingEmptyStateProps) {
  const imgAlt =
    imageAlt !== undefined
      ? imageAlt
      : typeof title === "string"
        ? title
        : "";

  return (
    <div
      className={
        compact
          ? "flex w-full flex-col items-center justify-center gap-5 px-4 py-8 md:gap-6 md:py-10"
          : "flex min-h-[min(70vh,640px)] w-full flex-col items-center justify-center gap-6 px-4 py-12 md:gap-8 md:py-16"
      }
    >
      <div
        className="
          relative flex shrink-0 items-center justify-center
          drop-shadow-[0_12px_32px_rgba(0,0,0,0.08)]
        "
      >
        <Image
          src={imageSrc}
          alt={imgAlt}
          width={320}
          height={240}
          className="h-auto w-[min(100%,320px)] select-none"
          priority
        />
      </div>
      <div className="flex max-w-xl flex-col items-center gap-2 text-center">
        {title ? (
          <h2 className="mb-4 max-w-lg text-balance font-semibold text-jsblack text-xl sm:text-2xl md:text-[1.65rem] leading-snug tracking-tight">
            {title}
          </h2>
        ) : null}
        {line1 ? (
          <p className="text-[15px] leading-relaxed text-[#5c5c5c] sm:text-base">
            {line1}
          </p>
        ) : null}
        {line2 ? (
          <p className="text-sm leading-relaxed text-[#6B7280] sm:text-[15px]">
            {line2}
          </p>
        ) : null}
      </div>
    </div>
  );
}

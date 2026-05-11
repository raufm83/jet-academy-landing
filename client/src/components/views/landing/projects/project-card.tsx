"use client";

import { useProjectModal } from "@/hooks/useProjectModal";
import { useLocale } from "next-intl";
import Image from "next/image";
import { MdPlayCircle, MdStar } from "react-icons/md";

interface ProjectCardProps {
  imageUrl: string;
  link: string;
  title: {
    az: string;
    en: string;
  };
  description: {
    az: string;
    en: string;
  };
  category: {
    id: string;
    name: string;
  };
  categoryMap?: Record<string, string>;
  /** Yalnız ilk slayd / birinci kart üçün şəbəkə prioriteti */
  loadEager?: boolean;
}

export default function ProjectCard({
  imageUrl,
  link,
  title,
  description,
  category,
  categoryMap = {},
  loadEager = false,
}: ProjectCardProps) {
  const { toggle } = useProjectModal();
  const handleClick = () => {
    toggle(link);
  };
  const locale = useLocale();

  const displayTitle = locale === "az" ? title.az : title.en;
  const categoryName =
    locale === "en"
      ? categoryMap[category.name] || category.name
      : category.name;

  return (
    <div
      className="relative w-full h-[327px] cursor-pointer overflow-hidden rounded-3xl group"
      onClick={handleClick}
    >
      <div className="relative w-full h-full transition-transform duration-300 md:group-hover:scale-105">
        <Image
          src={imageUrl}
          alt={locale === "az" ? title.az : title.en}
          fill
          className="object-cover rounded-3xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={loadEager ? 62 : 60}
          priority={loadEager}
          {...(!loadEager ? { loading: "lazy" as const } : {})}
        />
      </div>
      <div
        className="absolute top-2 right-2 z-[2] max-w-[min(calc(100%-5.5rem),15rem)] rounded-xl bg-black/55 px-2.5 py-1.5 text-right shadow-sm backdrop-blur-sm pointer-events-none"
        title={displayTitle}
      >
        <p className="text-xs font-semibold leading-snug text-white line-clamp-2 sm:text-sm">
          {displayTitle}
        </p>
      </div>

      <div
        className="absolute top-4 left-4 z-[2] flex items-center gap-0.5 pointer-events-none"
        aria-label={locale === "en" ? "5 out of 5 stars" : "5 ulduz"}
        role="img"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <MdStar
            key={i}
            className="h-4 w-4 shrink-0 text-[#FCAE1E] sm:h-[18px] sm:w-[18px]"
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/50 p-4 rounded-full transition-all duration-300 md:group-hover:scale-110 md:group-hover:bg-jsyellow/90">
          <MdPlayCircle className="w-8 h-8 text-white" />
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/90 to-black/70 
                    flex flex-col justify-center px-6 backdrop-blur-sm
                    transition-all duration-300 delay-[50ms]
                    md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
      >
        <p
          className="mb-1 text-xs font-medium uppercase tracking-wide text-white
                     transition-all duration-300 delay-75
                     md:translate-y-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {categoryName}
        </p>
        <h3
          className="text-white font-semibold text-lg mb-2 line-clamp-1
                     transition-all duration-300 delay-100
                     md:translate-y-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {displayTitle}
        </h3>
        <p
          className="text-gray-200 text-sm line-clamp-2
                    transition-all duration-300 delay-150
                    md:translate-y-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {locale === "az" ? description.az : description.en}
        </p>
      </div>
    </div>
  );
}

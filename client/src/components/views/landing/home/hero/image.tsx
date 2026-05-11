import Image from "next/image";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";

const FALLBACK_SRC = "/boy.webp";

type HeroImageProps = {
  imageSrc?: string | null;
  imageAlt?: string;
};

export default function HeroImage({
  imageSrc,
  imageAlt = "",
}: HeroImageProps) {
  const resolved =
    imageSrc && String(imageSrc).trim()
      ? resolveOptimizedImageUrl(imageSrc, "generic")
      : FALLBACK_SRC;

  return (
    <div className="relative flex w-full items-center justify-center">
      <div
        className="absolute inset-0 motion-reduce:opacity-100 opacity-100"
        aria-hidden
      >
        <div className="absolute top-4 right-8 h-16 w-16 rounded-full bg-jsyellow/20 blur-sm motion-reduce:animate-none" />
        <div className="absolute bottom-6 left-4 h-12 w-12 rounded-full bg-orange-300/30 blur-sm motion-reduce:animate-none" />
        <div className="absolute left-0 top-1/2 h-8 w-8 rounded-full bg-yellow-400/25 blur-sm motion-reduce:animate-none" />
      </div>

      <div
        className="
          relative
          h-[300px] w-full max-w-[300px]
          sm:h-[320px] sm:max-w-[320px]
          md:h-[360px] md:max-w-[360px]
          lg:h-[400px] lg:max-w-[400px]
          xl:h-[420px] xl:max-w-[420px]
          2xl:h-[460px] 2xl:max-w-[460px]
          [@media(min-width:3500px)]:h-[520px] [@media(min-width:3500px)]:max-w-[560px]
          cursor-pointer
          select-none
          shrink-0
          group
          transition-all duration-500 ease-out
          hover:scale-[1.03]
          hover:rotate-1
        "
      >
        <div
          className="
          pointer-events-none absolute inset-0 z-0
          bg-gradient-to-br from-jsyellow/40 via-jsyellow/70 to-jsyellow/90
          shadow-2xl shadow-jsyellow/25
          rounded-[40%_15%_50%_45%] 
          group-hover:rounded-[45%_20%_55%_40%]
          transition-all duration-700 ease-out
          group-hover:shadow-3xl group-hover:shadow-jsyellow/35
          before:absolute before:inset-0 
          before:bg-gradient-to-tl before:from-orange-300/20 before:to-transparent
          before:rounded-[40%_15%_50%_45%] 
          group-hover:before:rounded-[45%_20%_55%_40%]
          before:transition-all before:duration-700
        "
        />

        <div className="relative z-10 h-full w-full overflow-hidden rounded-[40%_15%_50%_45%] group-hover:rounded-[45%_20%_55%_40%] transition-all duration-700">
          <Image
            src={resolved}
            alt={imageAlt || "Hero"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 360px, (max-width: 1280px) 400px, 420px"
            priority
            fetchPriority="high"
            quality={75}
            className="
              object-cover object-center
              transition-all duration-500 ease-out
              group-hover:scale-110
              group-hover:brightness-110
              drop-shadow-lg
            "
          />

          <div
            className="
            absolute inset-0 
            bg-gradient-to-t from-jsyellow/10 via-transparent to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          "
          />
        </div>

        <div className="absolute -top-2 -right-2 w-6 h-6 bg-jsyellow rounded-full opacity-60 animate-bounce [animation-delay:0.5s]"></div>
        <div className="absolute -bottom-3 -left-1 w-4 h-4 bg-orange-400 rounded-full opacity-70 animate-bounce [animation-delay:1s]"></div>
        <div className="absolute top-1/4 -left-3 w-3 h-3 bg-yellow-300 rounded-full opacity-50 animate-bounce [animation-delay:1.5s]"></div>
        <div
          className="
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          before:absolute before:top-1/4 before:left-1/4 before:w-1 before:h-1 
          before:bg-white before:rounded-full before:animate-ping
          after:absolute after:top-3/4 after:right-1/4 after:w-1 after:h-1 
          after:bg-white after:rounded-full after:animate-ping after:[animation-delay:0.3s]
        "
        ></div>
      </div>
    </div>
  );
}

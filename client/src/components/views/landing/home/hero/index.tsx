// src/components/views/landing/home/hero.tsx
import Button from "@/components/ui/button";
import type { Locale } from "@/i18n/request";
import { type HomeHeroPublic, pickHeroLocale } from "@/lib/home-hero-public";
import { getTranslations } from "next-intl/server";
import { FaCompass } from "react-icons/fa6";
import { hasVisibleHtml } from "@/utils/multilingual-html";
import HeroConsult from "./hero-consult";
import HeroImage from "./image";

type HeroProps = {
  locale: Locale;
  cms: HomeHeroPublic | null;
};

function defaultHeroImageAlt(locale: Locale): string {
  if (locale === "en") {
    return "JET Academy student learning programming";
  }
  if (locale === "ru") {
    return "Студент JET Academy изучает программирование";
  }
  return "JET Academy tələbəsi proqramlaşdırma öyrənir";
}

export default async function Hero({ locale, cms }: HeroProps) {
  const t = await getTranslations({ locale, namespace: "hero" });

  const cmsBlockHtml = cms ? pickHeroLocale(cms.contentHtml, locale) : "";
  const useUnifiedCms = hasVisibleHtml(cmsBlockHtml);

  const cmsImageSrc = cms?.imageUrl?.trim() ? cms.imageUrl : null;
  const cmsImageAltRaw = cms ? pickHeroLocale(cms.imageAlt, locale) : "";
  const imageAlt =
    (cmsImageSrc && hasVisibleHtml(cmsImageAltRaw) && cmsImageAltRaw) ||
    defaultHeroImageAlt(locale);

  return (
    <div
      id="hero"
      className="
        container
    flex flex-col-reverse lg:flex-row
    items-center justify-center
    gap-6 md:gap-8 lg:gap-8 xl:gap-12 2xl:gap-20
    mt-6 md:mt-8
    mb-2 md:mb-4
    p-0
     lg:px-4
    [@media(min-width:3500px)]:!px-20
      "
    >
      <div
        id="left"
        className="
         w-full flex flex-col gap-4 md:gap-5 lg:gap-6
         text-center lg:text-left
         items-center lg:items-start
        "
      >
        {useUnifiedCms ? (
          <div
            className="
            w-full max-w-2xl mx-auto lg:mx-0
            text-jsblack
            [&_p]:text-[#5c5c5c] [&_p]:font-medium [&_p]:leading-[1.7] [&_p]:text-[clamp(15px,1.5vw,18px)] [&_p]:mb-5 last:[&_p]:mb-0
            [@media(min-width:3500px)]:[&_p]:text-2xl
            [&_a]:text-jsyellow [&_a]:underline
            [&_h1]:font-bold [&_h1]:text-jsblack [&_h1]:mb-5 [&_h1]:text-[clamp(28px,3vw,46px)] [&_h1]:leading-[1.25] [&_h1]:tracking-tight
            [@media(min-width:3500px)]:[&_h1]:text-6xl
          "
            dangerouslySetInnerHTML={{ __html: cmsBlockHtml }}
          />
        ) : (
          <>
            <Button
              variant="secondary"
              icon={
                <FaCompass
                  size={18}
                  color="#1560bd"
                  className="[@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-10"
                />
              }
              text="#yaratmağabaşla"
              className="
            shadow-jsshadow
            mx-auto lg:mx-0
            mb-4 md:mb-5
            text-xs md:text-sm lg:text-base
            py-1.5 md:py-2
            px-3 md:px-5
            [@media(min-width:3500px)]:!text-xl
          "
            />

            <h1
              className="
            font-bold text-jsblack
            mb-5
            text-[clamp(28px,3vw,46px)]
            leading-[1.25] tracking-tight
            [@media(min-width:3500px)]:!text-6xl
          "
            >
              {t("toJetAcademy")}{" "}
              <span className="text-jsyellow text-[clamp(28px,3vw,46px)] [@media(min-width:3500px)]:!text-6xl">
                {t("welcome")}!
              </span>
            </h1>

            <p
              className="
            font-medium text-[#5c5c5c]
            whitespace-pre-line leading-[1.7]
            text-[clamp(15px,1.5vw,18px)]
            max-w-2xl mx-auto lg:mx-0
            mb-8
            [@media(min-width:3500px)]:!text-2xl
          "
            >
              {t("description")}
            </p>
          </>
        )}

        <HeroConsult />
      </div>

      <div
        className="
          w-full flex justify-center
          
        "
      >
        <HeroImage imageSrc={cmsImageSrc} imageAlt={imageAlt} />
      </div>
    </div>
  );
}

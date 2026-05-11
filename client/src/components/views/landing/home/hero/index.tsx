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
            w-full max-w-xl mx-auto lg:mx-0
            text-jsblack
            [&_p]:mb-3 last:[&_p]:mb-0
            [&_a]:text-jsyellow [&_a]:underline
            text-sm md:text-base lg:text-lg xl:text-xl
            [@media(min-width:3500px)]:!text-xl
            [&_h1]:font-bold [&_h1]:text-jsblack [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:md:text-4xl [&_h1]:lg:text-[2.25rem] [&_h1]:leading-tight
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
            text-xs md:text-sm lg:text-base
            py-1.5 md:py-2
            px-3 md:px-5
            [@media(min-width:3500px)]:!text-xl
          "
            />

            <h1
              className="
            font-bold text-jsblack
           
            text-2xl sm:text-3xl md:text-4xl lg:text-[2.25rem] xl:text-[2.375rem] 2xl:text-[2.5rem]
            leading-tight
            [@media(min-width:3500px)]:!text-5xl
          "
            >
              {t("toJetAcademy")}{" "}
              <span className="text-jsyellow text-3xl sm:text-[1.875rem] md:text-[2.125rem] lg:text-[2.375rem] xl:text-[2.5rem] [@media(min-width:3500px)]:!text-5xl">
                {t("welcome")}!
              </span>
            </h1>

            <p
              className="
            font-medium text-[#5c5c5c]
            whitespace-pre-line leading-6 md:leading-7 lg:leading-relaxed
            text-sm md:text-lg lg:text-lg xl:text-xl
            max-w-xl mx-auto lg:mx-0
            [@media(min-width:3500px)]:!text-xl
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

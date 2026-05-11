import SectionTitle from "@/components/shared/section-title";
import Button from "@/components/ui/button";
import GraduateCard from "@/components/views/landing/graduates/graduate-card";
import type { Locale } from "@/i18n/request";
import { Link } from "@/i18n/routing";
import { getGraduatesPublic } from "@/utils/api/graduate";
import { getLocale, getTranslations } from "next-intl/server";
import { MdArrowRightAlt } from "react-icons/md";

/**
 * Əsas səhifədə yalnız məhdud sayda məzun göstərilir (karusel əvəzinə statik grid).
 * Bütün məzunlar üçün `/graduates` səhifəsinə keçid saxlanılır.
 */
const HOMEPAGE_LIMIT = 3;

export default async function HomeGraduates() {
  try {
    const [t, graduates, locale] = await Promise.all([
      getTranslations("graduates"),
      getGraduatesPublic(),
      getLocale(),
    ]);

    if (!graduates?.length || graduates.length < 3) return null;

    const visible = graduates.slice(0, HOMEPAGE_LIMIT);

    return (
      <div
        id="graduates-home"
        className="
          container mx-auto
          my-20 4xl:my-24
          p-0
          flex flex-col
          gap-8 4xl:gap-12
        "
      >
        <SectionTitle title={t("title")} description={t("description")} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 4xl:gap-8">
          {visible.map((graduate) => (
            <div
              key={graduate.id}
              className="min-h-[420px] rounded-3xl shadow-lg 4xl:rounded-[48px]"
            >
              <GraduateCard
                graduate={graduate}
                locale={locale as Locale}
                loadEager={false}
              />
            </div>
          ))}
        </div>

        <Link href="/graduates">
          <Button
            iconPosition="right"
            className="
              items-center mx-auto
              py-3 4xl:py-4 px-6 4xl:px-8
              [@media(min-width:3500px)]:!text-2xl
            "
            icon={
              <MdArrowRightAlt
                size={24}
                className="[@media(min-width:3500px)]:!w-12 [@media(min-width:3500px)]:!h-12"
              />
            }
            text={t("seeAll")}
          />
        </Link>
      </div>
    );
  } catch (error) {
    console.error("HomeGraduates component error:", error);
    return null;
  }
}

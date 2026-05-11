// src/components/views/landing/home/gallery.tsx
import Button from "@/components/ui/button";
import api from "@/utils/api/axios";
import { galleryListingPath } from "@/utils/gallery-paths";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import GalleryClient from "../../gallery/gallery-client";

/**
 * Əsas səhifə qalereyası: performans üçün slayder əvəzinə sadəcə bir neçə şəkil göstərilir.
 * Bütün şəkilləri görmək üçün dilə uyğun qalereya səhifəsinə keçid.
 */
const HOMEPAGE_LIMIT = 8;

const fetchGallery = async () => {
  try {
    const response = await api.get(`/gallery?limit=${HOMEPAGE_LIMIT}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return null;
  }
};

export default async function Gallery() {
  try {
    const [t, gallery, locale] = await Promise.all([
      getTranslations("gallery"),
      fetchGallery(),
      getLocale(),
    ]);
    if (!gallery) return null;

    const limitedGallery = {
      ...gallery,
      items: (gallery.items || []).slice(0, HOMEPAGE_LIMIT),
    };

    if (!limitedGallery.items.length) return null;

    return (
      <div
        id="gallery"
        className="
          container mx-auto
          px-4 sm:px-6 md:px-4 lg:px-12 xl:px-16
          2xl:px-0 3xl:px-24 4xl:px-32
          my-20 4xl:my-24
          flex flex-col
          gap-8 4xl:gap-12
        "
      >
        <GalleryClient initialGallery={limitedGallery} />

        <Link href={galleryListingPath(locale)}>
          <Button
            iconPosition="right"
            className="items-center mx-auto py-3 px-6 4xl:py-4 4xl:px-8 [@media(min-width:3500px)]:!text-2xl"
            icon={<MdArrowRightAlt size={24} className="[@media(min-width:3500px)]:!w-12 [@media(min-width:3500px)]:!h-12" />}
            text={t("seeAll")}
          />
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Gallery component error:", error);
    return null;
  }
}

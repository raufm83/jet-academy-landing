import GalleryClient from "@/components/views/landing/gallery/gallery-client";
import { GalleryResponse } from "@/types/gallery";
import api from "@/utils/api/axios";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { addTrailingSlash } from "@/utils/seo";
import { staticPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";
import { galleryListingPath } from "@/utils/gallery-paths";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az").replace(/\/$/, "");
  const alternates = {
    canonical: addTrailingSlash(`${baseUrl}/${locale}${galleryListingPath(locale)}`),
    languages: {
      az: addTrailingSlash(`${baseUrl}/az${galleryListingPath("az")}`),
      en: addTrailingSlash(`${baseUrl}/en${galleryListingPath("en")}`),
      ru: addTrailingSlash(`${baseUrl}/ru${galleryListingPath("ru")}`),
      "x-default": addTrailingSlash(`${baseUrl}/az${galleryListingPath("az")}`),
    },
  };

  const rawTitle = t("galleryPageTitle") || "Qalereya";
  const rawDescription =
    "2021-ci ildən etibarən JET Academy olaraq ölkənin texnologiya sahəsində aparıcı tədris mərkəzlərindən biri kimi özümüzü sübut etmişik və yüzlərlə yüksək ixtisaslı, uğurlu IT mütəxəssisi yetişdirmişik.";

  const { title, description } = await resolvePageMeta(
    "gallery",
    locale,
    rawTitle,
    rawDescription
  );

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      locale: locale === "az" ? "az_AZ" : "en_US",
      alternateLocale: locale === "az" ? "en_US" : "az_AZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}
async function fetchGalleryImages(): Promise<GalleryResponse> {
  try {
    const response = await api.get<GalleryResponse>("/gallery?limit=100");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return {
      items: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
      },
    };
  }
}

export default async function GalleryPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const initialGallery = await fetchGalleryImages();

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const galleryPath = galleryListingPath(locale);
  const schema = staticPageGraph({
    name: locale === "az" ? "Qalereya" : "Gallery",
    description: locale === "az"
      ? "JET Academy-nin qalereya şəkilləri"
      : "JET Academy gallery images",
    url: `${base}${galleryPath}`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Qalereya" : "Gallery", url: `${base}${galleryPath}` },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      <GalleryClient slider={false} initialGallery={initialGallery} />
      <FaqSection pageKey="gallery" locale={locale} />
    </>
  );
}

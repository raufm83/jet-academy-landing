import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import React from "react";
import { Metadata } from "next";
import { addTrailingSlash, truncateTitle, truncateDescription } from "@/utils/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  const baseUrl = addTrailingSlash(
    process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az"
  );

  const title = truncateTitle(t("title"));
  const description = truncateDescription(t("description"));
  const ogTitle = truncateTitle(t("ogTitle"));
  const ogDescription = truncateDescription(t("ogDescription"));

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: t("titleTemplate"),
    },
    description,
    keywords: t("keywords"),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: addTrailingSlash(`${baseUrl}${locale}`),
      siteName: "JET Academy",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
      locale: locale === "az" ? "az_AZ" : locale === "en" ? "en_US" : "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    },
    authors: [{ name: "JET Academy" }],
    category: "education",
  };
}

export default async function WebsiteLayout({
  params: { locale },
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

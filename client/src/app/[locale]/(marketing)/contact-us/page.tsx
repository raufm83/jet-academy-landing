import ContactHero from "@/components/views/landing/contact-us/contact-hero";
import ContactSection from "@/components/views/landing/contact-us/contact-section";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { contactPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const contactT = await getTranslations({ locale, namespace: "contact" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/contact-us", locale, baseUrl);

  const rawTitle = t("contactPageTitle") || "Əlaqə Məlumatları";
  const rawDescription =
    contactT("hero.description") ||
    "Suallarınız və ya təklifləriniz varsa, bizimlə əlaqə saxlamaqdan çəkinməyin.";

  const { title, description } = await resolvePageMeta(
    "contact-us",
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
        "max-snippet": -1,
      },
    },
  };
}

export default function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const schema = contactPageGraph({
    name: locale === "az" ? "Bizimlə əlaqə" : "Contact Us",
    description: locale === "az"
      ? "Suallarınız və ya təklifləriniz varsa, bizimlə əlaqə saxlayın."
      : "If you have questions or suggestions, feel free to contact us.",
    url: `${base}/contact-us`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Bizimlə əlaqə" : "Contact Us", url: `${base}/contact-us` },
    ],
  });

  return (
    <div className="flex flex-col gap-8 pt-10 md:gap-12 md:pt-10">
      <JsonLd data={schema} />
      <ContactHero />
      
      <ContactSection />
      <FaqSection pageKey="contact-us" locale={locale} />
    </div>
  );
}

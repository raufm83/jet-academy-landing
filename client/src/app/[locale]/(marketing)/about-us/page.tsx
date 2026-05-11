import IntroSection from "@/components/views/landing/about/intro-section";
import MissionVisionSection from "@/components/views/landing/about/mission-vision-section";
import StatsSection from "@/components/views/landing/about/stats-section";
import TeamSection from "@/components/views/landing/about/team-section";
import api from "@/utils/api/axios";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { aboutPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";
import {
  getPublicAboutPage,
  mergeAboutText,
  pickAboutLocale,
} from "@/lib/about-page-public";
import type { Locale } from "@/i18n/request";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const aboutT = await getTranslations({ locale, namespace: "aboutPage" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/about-us", locale, baseUrl);

  const rawTitle = t("aboutPageTitle") || "Haqqımızda";
  const rawDescription =
    aboutT("introduction.description1") ||
    "2021-ci ildən etibarən JET Academy olaraq ölkənin texnologiya sahəsində aparıcı tədris mərkəzlərindən biri kimi özümüzü sübut etmişik və yüzlərlə yüksək ixtisaslı, uğurlu IT mütəxəssisi yetişdirmişik.";

  const { title, description } = await resolvePageMeta(
    "about-us",
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
        "max-image-preview": "large",
      },
    },
  };
}

const getTeamMembers = async () => {
  try {
    return (await api.get("/team/active?limit=30")).data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations({
    locale: params.locale,
    namespace: "aboutPage",
  });
  const cms = await getPublicAboutPage();
  const loc = params.locale as Locale;

  const introTitle = mergeAboutText(
    pickAboutLocale(cms?.introTitle, loc),
    t("introduction.title")
  );
  const introD1 = mergeAboutText(
    pickAboutLocale(cms?.introDescription1, loc),
    t("introduction.description1")
  );
  const introD2 = mergeAboutText(
    pickAboutLocale(cms?.introDescription2, loc),
    t("introduction.description2")
  );
  const introD3 = mergeAboutText(
    pickAboutLocale(cms?.introDescription3, loc),
    t("introduction.description3")
  );
  const introCmsSrc = cms?.introImageUrl?.trim()
    ? resolveOptimizedImageUrl(cms.introImageUrl, "generic")
    : null;
  const introImgAlt =
    pickAboutLocale(cms?.introImageAlt, loc).trim() ||
    (loc === "az" ? "JET Academy tədris mühiti" : "JET Academy learning environment");

  const missionSectionTitle = mergeAboutText(
    pickAboutLocale(cms?.missionSectionTitle, loc),
    t("mission.sectionTitle")
  );
  const missionTitle = mergeAboutText(
    pickAboutLocale(cms?.missionTitle, loc),
    t("mission.title")
  );
  const missionDesc = mergeAboutText(
    pickAboutLocale(cms?.missionDescription, loc),
    t("mission.description")
  );
  const visionTitle = mergeAboutText(
    pickAboutLocale(cms?.visionTitle, loc),
    t("vision.title")
  );
  const visionDesc = mergeAboutText(
    pickAboutLocale(cms?.visionDescription, loc),
    t("vision.description")
  );
  const mvCmsSrc = cms?.missionVisionImageUrl?.trim()
    ? resolveOptimizedImageUrl(cms.missionVisionImageUrl, "generic")
    : null;
  const mvImgAlt =
    pickAboutLocale(cms?.missionVisionImageAlt, loc).trim() ||
    (loc === "az" ? "Missiya və vizyon" : "Mission and vision");

  const teamMembers = await getTeamMembers();

  const locale = params.locale;
  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const schema = aboutPageGraph({
    name: locale === "az" ? "Haqqımızda" : "About Us",
    description: SITE.description,
    url: `${base}/about-us`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Haqqımızda" : "About Us", url: `${base}/about-us` },
    ],
  });

  return (
    <div
      className="
      container flex flex-col p-0 gap-16 4xl:gap-24 py-5 4xl:py-28
      "
    >
      <JsonLd data={schema} />
      <IntroSection
        title={introTitle}
        description1={introD1}
        description2={introD2}
        description3={introD3}
        cmsImageSrc={introCmsSrc}
        imageAlt={introImgAlt}
      />

      <MissionVisionSection
        sectionTitle={missionSectionTitle}
        mission={{
          title: missionTitle,
          description: missionDesc,
        }}
        vision={{
          title: visionTitle,
          description: visionDesc,
        }}
        cmsImageSrc={mvCmsSrc}
        imageAlt={mvImgAlt}
      />

      <StatsSection
        stats={{
          graduatesLabel: t("stats.graduatesLabel"),
          groupsLabel: t("stats.groupsLabel"),
          studentsLabel: t("stats.studentsLabel"),
          teachingArea:t("stats.teachingArea")
        }}
      />

      <TeamSection
        teamMembers={teamMembers}
        title={t("team.title")}
        description={t("team.description")}
        isSlider={true}
      />
      <FaqSection pageKey="about-us" locale={params.locale} />
    </div>
  );
}

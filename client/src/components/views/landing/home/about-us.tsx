// src/components/views/landing/home/about-us.tsx
import SectionTitle from "@/components/shared/section-title";
import { getTranslations, getLocale } from "next-intl/server";
import React from "react";
import AboutUsSlider from "./about-us-slider";
import { fetchAdvantages } from "@/utils/api/advantage";

async function AboutUs() {
  const t = await getTranslations("about");
  const locale = await getLocale();
  const aboutPoints = await fetchAdvantages(locale);

  return (
    <div
      id="about"
      className="
        container mx-auto
        my-20 4xl:my-24
        flex flex-col
        gap-8 4xl:gap-12
        p-0
      "
    >
      <SectionTitle title={t("title")} description={t("description")} />

      <AboutUsSlider points={aboutPoints} />
    </div>
  );
}

export default AboutUs;

"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";

interface IntroSectionProps {
  title: string;
  description1: string;
  description2: string;
  description3: string;
  /** CMS şəkli (CDN URL) — veriləndə statik fayl əvəzinə */
  cmsImageSrc?: string | null;
  imageAlt?: string;
}

const SRC_WEBP = "/images/about/intro.webp";
const SRC_FALLBACK_PNG = "/rasim.png";
const SRC_FALLBACK_LEGACY = "/sayt5.webp";

export default function IntroSection({
  title,
  description1,
  description2,
  description3,
  cmsImageSrc,
  imageAlt = "JET Academy tədris mühiti",
}: IntroSectionProps) {
  const [src, setSrc] = useState(() => cmsImageSrc?.trim() || SRC_WEBP);

  const onError = useCallback(() => {
    setSrc((cur) => {
      if (cur === SRC_WEBP) return SRC_FALLBACK_PNG;
      if (cur === SRC_FALLBACK_PNG) return SRC_FALLBACK_LEGACY;
      return cur;
    });
  }, []);

  return (
    <section className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <motion.div
        className="flex flex-col gap-8"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold text-jsblack">{title}</h2>
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 text-xl [@media(min-width:2500px)]:!text-2xl [@media(min-width:3500px)]:!text-4xl">{description1}</p>
          <p className="text-gray-600 text-xl [@media(min-width:2500px)]:!text-2xl [@media(min-width:3500px)]:!text-4xl">{description2}</p>
          <p className="text-gray-600 text-xl [@media(min-width:2500px)]:!text-2xl [@media(min-width:3500px)]:!text-4xl">{description3}</p>
        </div>
      </motion.div>
      <motion.div
        className="relative [@media(min-width:3500px)]:h-[800px] h-[400px] rounded-[32px] overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <Image
          src={src}
          alt={imageAlt}
          fill
          quality={70}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full bg-top object-cover h-full rounded-[32px]"
          loading="lazy"
          onError={onError}
        />
      </motion.div>
    </section>
  );
}

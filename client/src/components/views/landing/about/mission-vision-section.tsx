"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";

interface MissionVisionProps {
  sectionTitle: string;
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  cmsImageSrc?: string | null;
  imageAlt?: string;
}

const SRC_WEBP = "/images/about/mission-vision.webp";
const SRC_FALLBACK_JPG = "/qiz1x1.jpg";
const SRC_FALLBACK_LEGACY = "/sayt2.webp";

export default function MissionVisionSection({
  sectionTitle,
  mission,
  vision,
  cmsImageSrc,
  imageAlt = "Missiya və vizyon",
}: MissionVisionProps) {
  const [src, setSrc] = useState(() => cmsImageSrc?.trim() || SRC_WEBP);

  const onError = useCallback(() => {
    setSrc((cur) => {
      if (cur === SRC_WEBP) return SRC_FALLBACK_JPG;
      if (cur === SRC_FALLBACK_JPG) return SRC_FALLBACK_LEGACY;
      return cur;
    });
  }, []);

  return (
    <section className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <motion.div
        className="relative [@media(min-width:3500px)]:h-[800px] h-[400px] rounded-[32px] overflow-hidden order-2 md:order-1"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <Image
          src={src}
          alt={imageAlt}
          fill
          quality={70}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover bg-top rounded-[32px]"
          loading="lazy"
          onError={onError}
        />
      </motion.div>

      <motion.div
        className="flex flex-col gap-8 order-1 md:order-2"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold text-jsblack">{sectionTitle}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="border border-jsyellow rounded-[32px] p-6 bg-[#fef7eb]">
            <h3 className="font-semibold text-xl [@media(min-width:3500px)]:!text-5xl text-jsblack mb-3">
              {mission.title}
            </h3>
            <p className="text-gray-600 [@media(min-width:3500px)]:!text-3xl">{mission.description}</p>
          </div>

          <div className="border border-jsyellow rounded-[32px] p-6 bg-[#fef7eb]">
            <h3 className="font-semibold text-xl text-jsblack [@media(min-width:3500px)]:!text-5xl mb-3">
              {vision.title}
            </h3>
            <p className="text-gray-600 [@media(min-width:3500px)]:!text-3xl">{vision.description}</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

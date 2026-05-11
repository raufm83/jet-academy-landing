"use client";

import { motion } from "framer-motion";

/** Sol yuxarıda göy gradient dairə — bütün marketing səhifələrdə fon dekoru */
export default function TopCircle() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 overflow-visible -top-36 sm:-top-44 md:-top-52 lg:-top-56"
      aria-hidden
    >
      <motion.div
        className="absolute -left-[18%] -top-[18%] h-[min(92vw,560px)] w-[min(92vw,560px)] sm:-left-[12%] sm:-top-[14%] sm:h-[min(88vw,620px)] sm:w-[min(88vw,620px)] xl:-left-[8%] xl:-top-[18%] xl:h-[720px] xl:w-[720px] rounded-full blur-[76px] sm:blur-[80px]"
        style={{
          background:
            "radial-gradient(ellipse 72% 72% at 42% 38%, rgb(96 165 250 / 0.52) 0%, rgb(37 99 235 / 0.38) 28%, rgb(21 96 189 / 0.22) 52%, rgb(21 96 189 / 0.06) 72%, transparent 82%)",
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.85, 0.65, 0.85],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

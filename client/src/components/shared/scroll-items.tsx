"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { FaArrowUp, FaWhatsapp } from "react-icons/fa";

function ScrollItems() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2], // Input range
    [0, 0, 1.1], // Output range
  );

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      ref={ref}
      className="fixed flex gap-3 bottom-6 right-6 z-50 items-center"
      style={{ opacity }}
    >
      {/* WhatsApp düyməsi: Ölçüsü böyüdüldü (h-14 w-14) və əsl WhatsApp yaşılına (#25D366) boyandı */}
      <Link
        href={`https://wa.me/+994509836699?text=${encodeURIComponent("")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ilə əlaqə saxlayın"
        className="flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] shadow-lg transition-all"
      >
        <FaWhatsapp className="h-7 w-7 text-white" aria-hidden="true" />
      </Link>

      <div className="relative flex items-center justify-center">
        {/* SVG dairə ölçüsü proporsional olaraq artırıldı */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
          width="52"
          height="52"
          viewBox="0 0 52 52"
        >
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            stroke="#FFE38B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            stroke="#121212"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{
              pathLength,
              opacity: 0.4,
            }}
            strokeDasharray="0 1"
          />
        </svg>

        {/* Scroll to top düyməsi: Ölçüsü böyüdüldü (h-14 w-14) */}
        <button
          onClick={scrollToTop}
          aria-label="Səhifənin başına qayıt"
          className="flex items-center relative z-40 justify-center h-14 w-14 rounded-full bg-[#1560bd] hover:bg-[#1580cd] shadow-lg transition-all"
        >
          <FaArrowUp className="h-6 w-6 text-white" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

export default ScrollItems;

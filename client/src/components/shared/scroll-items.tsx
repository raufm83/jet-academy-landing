"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowUp, FaWhatsapp } from "react-icons/fa";

function ScrollItems() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

      setProgress(nextProgress);
      setVisible(nextProgress > 0.1);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrollState);
      }
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="fixed flex gap-3 bottom-6 right-6 z-50 transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <Link
        href={`https://wa.me/+994509836699?text=${encodeURIComponent("")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ilə əlaqə saxlayın"
        title="WhatsApp ilə əlaqə saxlayın"
        className="flex items-center justify-center h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-[#25D366] hover:bg-[#20b858] shadow-lg transition-all"
      >
        <span className="sr-only">WhatsApp ilə əlaqə saxlayın</span>
        <FaWhatsapp
          className="h-9 w-9 lg:h-11 lg:w-11 text-white"
          aria-hidden="true"
        />
      </Link>

      <div className="relative">
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 w-[70px] h-[70px] lg:w-[86px] lg:h-[86px]"
          viewBox="0 0 70 70"
        >
          <circle
            cx="35"
            cy="35"
            r="33"
            stroke="#A8C5EC"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle
            cx="35"
            cy="35"
            r="33"
            stroke="#0B2D5B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{ opacity: 0.55 }}
            strokeDasharray={`${Math.max(progress, 0.0001)} 1`}
            pathLength={1}
          />
        </svg>

        <button
          onClick={scrollToTop}
          aria-label="Səhifənin başına qayıt"
          title="Səhifənin başına qayıt"
          className="flex items-center relative z-40 justify-center h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-[#1560bd] hover:bg-[#1a6fd4] shadow-lg transition-all"
        >
          <span className="sr-only">Səhifənin başına qayıt</span>
          <FaArrowUp
            className="h-7 w-7 lg:h-8 lg:w-8 text-white"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

export default ScrollItems;

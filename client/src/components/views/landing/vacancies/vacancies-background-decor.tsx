"use client";

import { useEffect, useState } from "react";
import {
  MdOutlineArticle,
  MdOutlineCalculate,
  MdOutlineComputer,
  MdOutlineDraw,
  MdOutlineEmojiEvents,
  MdOutlineGroups,
  MdOutlineHandyman,
  MdOutlineLightbulb,
  MdOutlineMenuBook,
  MdOutlinePsychology,
  MdOutlineRocketLaunch,
  MdOutlineSchool,
  MdOutlineWork,
} from "react-icons/md";

const ICONS = [
  MdOutlineSchool,
  MdOutlineWork,
  MdOutlineLightbulb,
  MdOutlineCalculate,
  MdOutlineComputer,
  MdOutlineMenuBook,
  MdOutlineGroups,
  MdOutlineEmojiEvents,
  MdOutlineRocketLaunch,
  MdOutlinePsychology,
  MdOutlineHandyman,
  MdOutlineDraw,
  MdOutlineArticle,
];

export default function VacanciesBackgroundDecor() {
  const cells = 56;
  const [scrollY, setScrollY] = useState(0);
  const parallaxBase = Math.min(scrollY, 900);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY || 0));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-2] overflow-hidden" aria-hidden>
      <div
        className="absolute -inset-x-[8%] -inset-y-[12%] bg-gradient-to-br from-[#fffefb] via-[#fff9f2] to-[#fdf6eb]"
        style={{ transform: `translateY(${parallaxBase * 0.04}px)` }}
      />
      <div
        className="absolute -inset-x-[8%] -inset-y-[12%] opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(rgb(28 28 28 / 0.06) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          transform: `translateY(${parallaxBase * 0.08}px)`,
        }}
      />
      <div
        className="absolute -inset-x-[8%] -inset-y-[12%] bg-gradient-to-br from-jsyellow/[0.16] via-transparent to-jsyellow/[0.08]"
        style={{ transform: `translateY(${parallaxBase * 0.12}px)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgb(255_255_255_/_0.95),transparent_55%)]" />
      <div className="absolute inset-0 flex justify-center px-5 pt-10 sm:px-8 sm:pt-14">
        <div
          className="grid h-full w-full max-w-[1500px] content-start justify-items-center gap-x-16 gap-y-14 sm:gap-x-20 sm:gap-y-16"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(5.5rem, 1fr))",
            transform: `translateY(${parallaxBase * 0.14}px)`,
          }}
        >
          {Array.from({ length: cells }).map((_, i) => {
            const Icon = ICONS[i % ICONS.length];
            const rotate = ((i * 7) % 11) - 5;
            const accent = i % 3 !== 0;
            return (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12"
                style={{ transform: `rotate(${rotate}deg)` }}
              >
                <Icon
                  className={
                    accent
                      ? "size-10 text-jsyellow sm:size-11"
                      : "size-9 text-jsblack sm:size-10"
                  }
                  style={{ opacity: accent ? 0.14 : 0.08 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

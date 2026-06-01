"use client";
import { cn } from "@/utils/cn";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

const LOCALE_META: Record<string, { emoji: string; label: string; ariaLabel: string }> = {
  az: { emoji: "🇦🇿", label: "AZ", ariaLabel: "Azərbaycan dilinə keç" },
  en: { emoji: "🇬🇧", label: "EN", ariaLabel: "Switch to English" },
  ru: { emoji: "🇷🇺", label: "RU", ariaLabel: "Переключить на русский" },
};

const locales = ["az", "en", "ru"];

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: Event) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setIsOpen(false);
    const href = pathname === "" ? "/" : pathname;
    router.replace(href, { locale: code });
  };

  const current = LOCALE_META[locale] ?? LOCALE_META.az;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={locale === "az" ? "Dil seçin" : "Choose language"}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "border flex w-full bg-white [@media(min-width:3500px)]:!text-2xl justify-between gap-2 text-sm h-11 transition-all cursor-pointer font-semibold text-jsblack items-center border-gray-300 px-4 py-2 rounded-[30px]",
          !isOpen ? "hover:bg-jsblack/10" : "bg-jsblack/10"
        )}
      >
        <span
          aria-hidden
          className="text-xl leading-none [@media(min-width:3500px)]:!text-3xl"
          style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" }}
        >
          {current.emoji}
        </span>
        <span className="sr-only">
          {locale === "az"
            ? "Cari dil: Azərbaycan"
            : locale === "en"
            ? "Current language: English"
            : "Текущий язык: Русский"}
        </span>
        <span aria-hidden>{current.label}</span>
        <HiChevronDown className="shrink-0" aria-hidden />
      </button>

      <div
        role="listbox"
        aria-label={locale === "az" ? "Dillər" : "Languages"}
        className={cn(
          "flex flex-col min-w-[110px] items-stretch top-full left-0 mt-2 absolute bg-white border border-gray-300 rounded-[16px] overflow-hidden transition-all duration-150 z-50 shadow-sm",
          isOpen
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible pointer-events-none"
        )}
      >
        {locales.map((code) => {
          const meta = LOCALE_META[code];
          return (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === locale}
              aria-label={meta.ariaLabel}
              onClick={() => handleSelect(code)}
              className={cn(
                "hover:bg-jsblack/10 py-2.5 w-full text-center flex items-center justify-center gap-2.5 transition-all cursor-pointer text-jsblack font-semibold text-sm border-0 bg-transparent [@media(min-width:3500px)]:!text-xl",
                code === locale && "bg-jsblack/5"
              )}
            >
              <span
                aria-hidden
                className="text-xl leading-none [@media(min-width:3500px)]:!text-3xl"
                style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" }}
              >
                {meta.emoji}
              </span>
              <span aria-hidden>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

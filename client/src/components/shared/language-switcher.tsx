"use client";
import { cn } from "@/utils/cn";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

const FLAG_SRC: Record<string, string> = {
  az: "/flags/az.png",
  en: "/flags/uk.webp",
};

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

  const locales = ["az", "en"];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={
          locale === "az" ? "Dil seçin" : "Choose language"
        }
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "border flex w-full bg-white [@media(min-width:3500px)]:!text-2xl justify-between gap-2 text-sm h-11 transition-all cursor-pointer font-semibold text-jsblack items-center border-gray-300 px-4 py-2 rounded-[30px]",
          !isOpen ? "hover:bg-jsblack/10" : "bg-jsblack/10"
        )}
      >
        <Image
          src={FLAG_SRC[locale] ?? FLAG_SRC.az}
          alt=""
          width={25}
          height={30}
          quality={75}
          className="object-contain [@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-8"
          aria-hidden
        />
        <span className="sr-only">
          {locale === "az" ? "Cari dil: Azərbaycan" : "Current language: English"}
        </span>
        <span aria-hidden>{locale.toUpperCase()}</span>
        <HiChevronDown className="shrink-0" aria-hidden />
      </button>

      <div
        role="listbox"
        aria-label={locale === "az" ? "Dillər" : "Languages"}
        className={cn(
          "flex flex-col max-w-[150px] items-stretch top-full left-0 right-0 mt-2 absolute bg-white border border-gray-300 rounded-[16px] overflow-hidden transition-all duration-150 z-50 shadow-sm",
          isOpen
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible pointer-events-none"
        )}
      >
        {locales.map((code) => (
          <button
            key={code}
            type="button"
            role="option"
            aria-selected={code === locale}
            aria-label={
              code === "az"
                ? "Azərbaycan dilinə keç"
                : "Switch to English"
            }
            onClick={() => handleSelect(code)}
            className="hover:bg-jsblack/10 py-2 w-full text-center flex items-center justify-center gap-3 transition-all cursor-pointer text-jsblack font-semibold text-sm border-0 bg-transparent"
          >
            <Image
              src={FLAG_SRC[code] ?? FLAG_SRC.az}
              alt=""
              width={25}
              height={30}
              quality={75}
              className="object-contain [@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-8"
              aria-hidden
            />
            <span aria-hidden>{code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

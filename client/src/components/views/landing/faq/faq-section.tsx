"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdRemove } from "react-icons/md";
import { FaqRow } from "@/types/faq";
import { Locale } from "@/i18n/request";
import { getFaqsByPageKey } from "@/utils/api/faq";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";

interface FaqSectionProps {
  items?: FaqRow[];
  pageKey?: string;
  /** Route `params.locale` is `string` at type level; runtime matches `Locale`. */
  locale: Locale | string;
  title?: string;
  description?: string;
  /** Overrides default section vertical padding (e.g. tighter before footer). */
  sectionClassName?: string;
  /** Başlıq/subtitle göstərilsin (default: true). */
  showHeader?: boolean;
}

export default function FaqSection({ 
  items: initialItems,
  pageKey,
  locale, 
  title, 
  description,
  sectionClassName,
  showHeader = true,
}: FaqSectionProps) {
  const t = useTranslations("faq");
  const [items, setItems] = useState<FaqRow[]>(initialItems || []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialItems && !!pageKey);
  const langKey: "az" | "en" =
    locale === "ru" ? "az" : locale === "en" ? "en" : "az";

  const resolvedTitle = title ?? (showHeader ? t("title") : undefined);
  const resolvedDescription =
    description ?? (showHeader ? t("description") : undefined);

  useEffect(() => {
    if (!initialItems && pageKey) {
      const fetchFaqs = async () => {
        setLoading(true);
        const data = await getFaqsByPageKey(pageKey);
        setItems(data);
        setLoading(false);
      };
      fetchFaqs();
    }
  }, [initialItems, pageKey]);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (loading) return <div className="py-8 text-center text-sm text-gray-600">Yüklənir...</div>;
  if (items.length === 0 && !loading) return null;

  return (
    <section className={cn("bg-white py-12 md:py-16", sectionClassName)}>
      <div className="container mx-auto max-w-2xl px-4">
        {(resolvedTitle || resolvedDescription) && (
          <div className="mb-8 text-center md:mb-10">
            {resolvedTitle && (
              <h2 className="mb-3 text-2xl font-bold text-[#1F2937] md:text-3xl">
                {resolvedTitle}
              </h2>
            )}
            {resolvedDescription && (
              <p className="mx-auto max-w-xl text-sm text-gray-600 md:text-base">
                {resolvedDescription}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;
            const question = item.question[langKey] || item.question.az;
            const answer = item.answer[langKey] || item.answer.az;

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border bg-white transition-all duration-300",
                  isOpen
                    ? "border-jsyellow shadow-[0_0_12px_rgba(21,96,189,0.12)]"
                    : "border-jsyellow/25 hover:shadow-[0_2px_12px_rgba(21,96,189,0.06)]",
                )}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left md:gap-4 md:p-5"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-semibold leading-snug text-[#1F2937] md:text-base">
                    {question}
                  </span>
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 md:h-8 md:w-8",
                      isOpen ? "bg-jsyellow text-white" : "bg-jsyellow/10 text-jsyellow",
                    )}
                  >
                    {isOpen ? <MdRemove size={18} /> : <MdAdd size={18} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 pt-0 text-sm leading-relaxed text-gray-600 md:px-5 md:text-[15px]">
                        <div className="mb-4 h-px w-full bg-jsyellow/15" />
                        <div className="whitespace-pre-line">{answer}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

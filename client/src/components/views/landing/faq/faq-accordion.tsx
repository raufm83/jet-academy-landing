"use client";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import type { FaqRow } from "@/types/faq";

interface FaqAccordionProps {
  items: FaqRow[];
  locale: string;
}

export default function FaqAccordion({ items, locale }: FaqAccordionProps) {
  return (
    <Accordion
      variant="splitted"
      selectionMode="multiple"
      className="max-w-2xl px-0"
      itemClasses={{
        base: "!shadow-sm rounded-2xl border border-jsyellow/20 !bg-white",
        title: "text-[15px] font-semibold text-jsblack md:text-base",
        trigger: "py-3.5 px-4 md:py-4 md:px-5",
        content: "px-4 pb-4 pt-0 text-sm leading-relaxed text-gray-600 md:px-5 md:pb-5 md:text-[15px]",
        indicator: "text-jsyellow",
      }}
    >
      {items.map((faq) => (
        <AccordionItem
          key={faq.id}
          aria-label={
            locale === "az"
              ? faq.question.az
              : faq.question.en || faq.question.az
          }
          title={
            locale === "az"
              ? faq.question.az
              : faq.question.en || faq.question.az
          }
        >
          <p className="whitespace-pre-line">
            {locale === "az"
              ? faq.answer.az
              : faq.answer.en || faq.answer.az}
          </p>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

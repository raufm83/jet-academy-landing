/** FAQ elementi — API `FaqItem` */
export interface FaqItem {
  id: string;
  question: { az: string; en: string };
  answer: { az: string; en: string };
  pages: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated FaqItem istifadə edin */
export type FaqRow = FaqItem;

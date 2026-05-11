"use client";
import { ReactNode } from "react";
import { BreadcrumbTitleContext } from "./BreadcrumbTitleContext";
import { PostType } from "@/types/enums";

type Props = {
  title: string;
  children: ReactNode;
  categoryName?: string;
  categorySlug?: string;
  postType?: PostType;
};
export default function BreadcrumbContextWrapper({ 
  title, 
  children, 
  categoryName, 
  categorySlug,
  postType
}: Props) {
  return (
    <BreadcrumbTitleContext.Provider value={{ 
      dynamicTitle: title,
      categoryName,
      categorySlug,
      postType
    }}>
      {children}
    </BreadcrumbTitleContext.Provider>
  );
}

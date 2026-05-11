"use client";
import { createContext, useContext } from "react";
import { PostType } from "@/types/enums";

type BreadcrumbTitleContextType = {
  dynamicTitle?: string;
  categoryName?: string;
  categorySlug?: string;
  postType?: PostType;
};
export const BreadcrumbTitleContext = createContext<BreadcrumbTitleContextType>({});
export const useBreadcrumbTitle = () => useContext(BreadcrumbTitleContext);

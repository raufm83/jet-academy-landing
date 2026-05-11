import { PaginatedResponse } from "./general";

interface MultilingualContent {
  az: string;
  en: string;
}
export interface CourseFormInputs {
  title: MultilingualContent;
  description: MultilingualContent;
  shortDescription?: MultilingualContent;
  slug: MultilingualContent;
  duration: number;
  level: MultilingualContent;
  lessonPerWeek?: number;
  imageUrl?: string;
  published: boolean;
  image?: FileList | File | null;
  tag?: string[];
  icon?: string;
  ageRange?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  order?: number;
  newTags?: {
    az: string[];
    en: string[];
  };
}
interface ModuleContent extends MultilingualContent {
  order: number;
  isActive?: boolean;
}

export interface Module {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  content: ModuleContent[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  moduleId: string;
  order: number;
  createdAt: string;
  module: Module;
}
export interface ContentInput {
  az: string;
  en: string;
  order: number;
  isActive?: boolean;
}
export interface ModuleFormInputs {
  title: {
    az: string;
    en: string;
  };
  description: {
    az: string;
    en: string;
  };
  content: ContentInput[];
}

export interface Eligibility {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  icon: string;
  /** Admin siyahısı: böyük dəyər yuxarıda. */
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityFormInputs {
  title: {
    az: string;
    en: string;
  };
  description: {
    az: string;
    en: string;
  };
  icon: string;
  /** Boş saxlanılarsa yaradılışda backend max+1 verir */
  order?: number;
}

export interface CourseEligibility {
  id: string;
  courseId: string;
  eligibilityId: string;
  order?: number;
  createdAt: string;
  eligibility: Eligibility;
}

export interface Course {
  [x: string]: any;
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  slug: MultilingualContent;
  level: MultilingualContent;
  duration: number;
  published: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  shortDescription: any;
  lessonPerWeek?: number;
  icon: string;
  ageRange?: string;
  order?: number;
  newTags?: {
    az: string[];
    en: string[];
  };
  imageUrl?: string;
  imageAlt?: MultilingualContent;
  tag?: string[];
  createdAt: string;
  updatedAt: string;
  modules?: any[];
  teachers?: any[];
  eligibility?: any[];
}
export type CourseResponse = PaginatedResponse<Course>;

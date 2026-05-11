import { EventStatus, PostType } from "./enums";

interface MultilingualText {
  az: string;
  en?: string;
  ru?: string;
}

export interface MultilingualTagsInput {
  az: string[];
  en?: string[];
  ru?: string[];
}

export type PostTagValue =
  | string
  | {
      az?: string | string[];
      en?: string | string[];
      ru?: string | string[];
    };

/** API həmişə imageUrl-i { az?, en? } obyekti kimi qaytarır */
export type PostImageUrl = { az?: string; en?: string; ru?: string } | string;

export interface Post {
  id: string;
  title: MultilingualText;
  content: MultilingualText;
  slug: MultilingualText;
  published: boolean;
  /** Dilə uyğun şəkil: obyekt (az/en) və ya köhnə formatda tək string */
  imageUrl?: PostImageUrl | null;
  imageAlt?: MultilingualText;
  tags: PostTagValue[];
  postType: PostType;
  eventDate?: Date | string;
  eventStatus?: EventStatus;
  authorId: string;
  author: {
    id: string;
    name: string;
    role?: string;
    firstName?: string | { az?: string; en?: string; ru?: string };
    lastName?: string | { az?: string; en?: string; ru?: string };
    profile?: {
      avatarUrl?: string | null;
      profession?: string | { az?: string; en?: string; ru?: string } | null;
      socialLinks?: {
        authorName?: { az?: string; en?: string; ru?: string };
        authorSurname?: { az?: string; en?: string; ru?: string };
        authorPosition?: { az?: string; en?: string; ru?: string };
      };
    };
  };
  createdAt: string;
  updatedAt: string;
  offerStartDate?: Date | string;
  offerEndDate?: Date | string;
}

export interface PostFormInputs {
  title: MultilingualText;
  content: MultilingualText;
  slug: MultilingualText;
  published: boolean;
  /** Köhnə: tək şəkil. Yeni: imageUrlAz / imageUrlEn ayrı-ayrı */
  imageUrl?: string;
  image?: FileList | File;
  imageAz?: FileList | File;
  imageEn?: FileList | File;
  imageRu?: FileList | File;
  imageAlt?: MultilingualText;
  tags: MultilingualTagsInput;
  postType: PostType;
  eventDate?: string;
  eventStatus?: EventStatus;
  offerStartDate?: string;
  offerEndDate?: string;
}

export interface PostsResponse {
  items: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

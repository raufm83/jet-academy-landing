export interface GalleryFormInputs {
  title?: {
    az: string;
    en: string;
  };
  image: FileList | string; // Allow string for existing image URL during edit
  imageAlt?: {
    az: string;
    en: string;
  };
}

export interface GalleryImage {
  id: string;
  title: {
    az: string;
    en: string;
  };
  imageUrl: string;
  imageAlt?: {
    az: string;
    en: string;
  };
  createdAt: string;
}

export interface GalleryResponse {
  items: GalleryImage[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

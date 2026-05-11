export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface ContactData {
  email: string;
  address: {
    az: string;
    en: string;
  };
  address2: {
    az: string;
    en: string;
  };
  whatsapp: string;
  phone: string;
  workingHours: {
    az: {
      weekdays: string;
      sunday: string;
    };
    en: {
      weekdays: string;
      sunday: string;
    };
  };
  socialLinks?: SocialLinks;
}

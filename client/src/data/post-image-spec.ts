/**
 * Üz şəkli: məqalə səhifəsində 16:9 sahə; kartda 4:3 cover (yalnız sayt görünüşü).
 * Server şəkli kəsmədən WebP-ə çevirir (içində sığdırma).
 */
export const POST_COVER_IMAGE_RECOMMENDED_PX = {
  width: 1920,
  height: 1080,
} as const;

export const POST_COVER_IMAGE_ASPECT = "16:9" as const;

export const POST_CARD_IMAGE_RECOMMENDED_PX = {
  width: 1600,
  height: 1200,
} as const;

export const POST_CARD_IMAGE_ASPECT = "4:3" as const;

/** API multer ilə eyni (api/src/multer/config.ts) */
export const POST_IMAGE_MAX_FILE_BYTES = 2 * 1024 * 1024;

export const POST_IMAGE_MAX_FILE_MB = 2;

export const POST_IMAGE_ALLOWED_EXTENSIONS = "JPG, JPEG, PNG, GIF, WebP";

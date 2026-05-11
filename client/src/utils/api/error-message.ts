import { AxiosError } from "axios";
import { POST_IMAGE_MAX_FILE_MB } from "@/data/post-image-spec";

function looksTechnical(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    /\b(4|5)\d{2}\b/.test(msg) ||
    m.includes("sharp") ||
    m.includes("multer") ||
    m.includes("enotent") ||
    m.includes("econnrefused") ||
    m.includes("html") ||
    m.includes("image processing failed") ||
    m.includes("internal server") ||
    m.includes("request entity")
  );
}

function sanitizeBackendMessage(raw: string): string {
  const s = raw
    .replace(/\b(4|5)\d{2}\b/g, "")
    .replace(/Bad Request/gi, "")
    .replace(/Internal Server Error/gi, "")
    .replace(/Request Entity Too Large/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s || looksTechnical(s)) return "";
  return s;
}

export function getAxiosErrorMessage(error: unknown): string {
  /** 413 çox vaxt bütün multipart gövdə limiti üçündür, tək üz şəklinin ölçüsü deyil. */
  const payloadTooLarge = `Sorğunun ölçüsü server limitini aşdı (məqalə mətni AZ/EN və üz şəkli birlikdə). Üz şəkli üçün ayrıca limit təxminən ${POST_IMAGE_MAX_FILE_MB} MB-dır.`;

  const fileTooLarge = `Şəkil faylı çox böyükdür. Ən çox ${POST_IMAGE_MAX_FILE_MB} megabayt ola bilər. Onlayn “şəkil sıxışdırma” alətindən istifadə edin və ya daha az pikselli şəkil seçin. Format: ${"JPG, PNG, GIF və ya WebP"}.`;

  const fieldValueTooLong = `Məqalə mətni (AZ və ya EN) çox böyükdür — mətnə yapışdırılmış şəkillər HTML-i şişirdir. Redaktorda lazımsız şəkilləri silin və ya toolbar ilə şəkil yükləyin (base64 əvəzinə link).`;

  const genericFail =
    "Əməliyyat uğurla bitmədi. İnternet bağlantısını yoxlayın və yenidən cəhd edin.";

  const serverBusy =
    "Server müvəqqəti cavab verə bilmədi. Bir neçə dəqiqə sonra yenidən cəhd edin.";

  if (!error || typeof error !== "object") {
    return "Əməliyyat tamamlanmadı. Yenidən cəhd edin.";
  }

  const ax = error as AxiosError<{ message?: string | string[]; error?: string }>;
  const status = ax.response?.status;
  /** Axios generik tipi bəzən yalnız obyekt göstərir; server HTML/string də qaytara bilər. */
  const data = ax.response?.data as unknown;

  if (status === 413) {
    return payloadTooLarge;
  }

  if (status === 502) {
    return serverBusy;
  }

  if (typeof data === "string") {
    const stripped = data.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const sl = stripped.toLowerCase();
    if (sl.includes("field value too long") || sl.includes("limit_field_value")) {
      return fieldValueTooLong;
    }
    if (sl.includes("file too large") || sl.includes("limit_file_size")) {
      return fileTooLarge;
    }
    if (
      stripped &&
      stripped.length < 500 &&
      !stripped.toLowerCase().includes("<!doctype")
    ) {
      const cleaned = sanitizeBackendMessage(stripped);
      if (cleaned) return cleaned;
    }
    if (status === 500) return genericFail;
    return genericFail;
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const m = obj.message;
    let text = "";
    if (Array.isArray(m)) {
      text = m.filter((x): x is string => typeof x === "string").join(" ");
    } else if (typeof m === "string") {
      text = m;
    } else if (typeof obj.error === "string") {
      text = obj.error;
    }

    const rawLower = text.trim().toLowerCase();
    if (
      rawLower.includes("field value too long") ||
      rawLower.includes("limit_field_value")
    ) {
      return fieldValueTooLong;
    }
    if (rawLower === "file too large" || rawLower.includes("limit_file_size")) {
      
      return fileTooLarge;
    }

    text = sanitizeBackendMessage(text.trim());
    if (text && !looksTechnical(text)) return text;
  }

  if (status === 500 || status === 400) {
    return genericFail;
  }

  if (ax.message === "Network Error") {
    return "Şəbəkə bağlantısı yoxdur və ya kəsilib. İnternetinizi yoxlayıb yenidən cəhd edin.";
  }

  return "Əməliyyat tamamlanmadı. Yenidən cəhd edin.";
}

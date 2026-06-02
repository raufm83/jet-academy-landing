import { MdInfoOutline } from "react-icons/md";

interface ImageHintProps {
  /** Tövsiyə ölçüsü, məs. "1200 × 800 px" */
  size: string;
  /** Nisbət, məs. "3:2" — yoxdursa göstərilmir */
  aspect?: string;
  /** Maksimum fayl ölçüsü MB ilə (standart: 2) */
  maxMb?: number;
  /** Server tərəfindən tətbiq olunan xüsusi qeyd */
  note?: string;
}

/** Dashboard şəkil inputlarının altında göstərilən kiçik məlumat paneli. */
export default function ImageHint({
  size,
  aspect,
  maxMb = 2,
  note,
}: ImageHintProps) {
  return (
    <div className="flex items-start gap-1.5 rounded-lg bg-default-50 border border-default-200 px-3 py-2 text-xs text-default-500 leading-relaxed">
      <MdInfoOutline className="mt-0.5 shrink-0 text-default-400" size={14} />
      <span>
        <span className="font-medium text-default-600">Tövsiyə:</span>{" "}
        {size}
        {aspect ? ` (${aspect} nisbət)` : ""} ·{" "}
        <span className="font-medium text-default-600">Maks.:</span> {maxMb} MB ·{" "}
        <span className="font-medium text-default-600">Format:</span> JPG, PNG, GIF, WebP.{" "}
        {note && <span>{note}</span>}
        <span className="text-default-400"> Server avtomatik WebP-ə çevirir.</span>
      </span>
    </div>
  );
}

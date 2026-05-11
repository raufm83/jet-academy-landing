"use client";

import { Button, Chip, Input } from "@nextui-org/react";
import { useState } from "react";
import { MdLocalOffer } from "react-icons/md";

export interface TagPair {
  az: string;
  en: string;
}

interface BilingualTagInputProps {
  tags: TagPair[];
  onChange: (tags: TagPair[]) => void;
  isDisabled?: boolean;
}

const inputClassNames = {
  input: "bg-transparent",
  inputWrapper: [
    "bg-white border-2 hover:border-primary focus:border-primary",
  ],
};

export default function BilingualTagInput({
  tags,
  onChange,
  isDisabled = false,
}: BilingualTagInputProps) {
  const [inputAz, setInputAz] = useState("");
  const [inputEn, setInputEn] = useState("");

  const canAdd = inputAz.trim().length > 0 && inputEn.trim().length > 0;

  const isDuplicate = (az: string, en: string) =>
    tags.some(
      (t) =>
        t.az.toLowerCase() === az.toLowerCase() ||
        t.en.toLowerCase() === en.toLowerCase(),
    );

  const handleAdd = () => {
    const az = inputAz.trim();
    const en = inputEn.trim();
    if (!az || !en || isDuplicate(az, en)) return;

    onChange([...tags, { az, en }]);
    setInputAz("");
    setInputEn("");
  };

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAdd) handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <Input
          type="text"
          label="Teq (AZ)"
          placeholder="Teq əlavə et"
          variant="bordered"
          value={inputAz}
          onChange={(e) => setInputAz(e.target.value)}
          onKeyDown={handleKeyDown}
          startContent={<MdLocalOffer className="text-gray-400" />}
          isDisabled={isDisabled}
          classNames={inputClassNames}
        />
        <Input
          type="text"
          label="Tag (EN)"
          placeholder="Add tag"
          variant="bordered"
          value={inputEn}
          onChange={(e) => setInputEn(e.target.value)}
          onKeyDown={handleKeyDown}
          startContent={<MdLocalOffer className="text-gray-400" />}
          isDisabled={isDisabled}
          classNames={inputClassNames}
        />
        <Button
          type="button"
          onClick={handleAdd}
          isDisabled={!canAdd || isDisabled}
          className="bg-jsyellow text-white md:mb-[2px]"
        >
          Əlavə et
        </Button>
      </div>

      {!canAdd && (inputAz.trim() || inputEn.trim()) && (
        <p className="text-xs text-warning-500">
          Hər iki dildə (AZ / EN) teq daxil edilməlidir
        </p>
      )}

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {tags.length === 0 && (
          <span className="text-gray-400 text-sm py-1">
            Teqlər əlavə edin (AZ / EN cüt şəklində)
          </span>
        )}
        {tags.map((tag, index) => (
          <Chip
            key={`${tag.az}-${tag.en}-${index}`}
            onClose={() => handleRemove(index)}
            variant="flat"
            color="warning"
            classNames={{ content: "font-medium" }}
          >
            {tag.az} / {tag.en}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/** Convert `{ az: string[], en: string[] }` to paired `TagPair[]` */
export function toPairs(localized: {
  az: string[];
  en: string[];
}): TagPair[] {
  const len = Math.max(localized.az.length, localized.en.length);
  const pairs: TagPair[] = [];
  for (let i = 0; i < len; i++) {
    pairs.push({
      az: localized.az[i] ?? "",
      en: localized.en[i] ?? "",
    });
  }
  return pairs;
}

/** Convert paired `TagPair[]` back to `{ az: string[], en: string[] }` */
export function fromPairs(pairs: TagPair[]): {
  az: string[];
  en: string[];
} {
  return {
    az: pairs.map((p) => p.az),
    en: pairs.map((p) => p.en),
  };
}

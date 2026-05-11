"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface GlossaryAlphabetNavProps {
  language: string;
  allText: string;
}

export default function GlossaryAlphabetNav({
  language,
  allText,
}: GlossaryAlphabetNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawLetter = searchParams.get("letter") || "";
  const currentLetter = rawLetter.replace(/\/+$/, "");

  useEffect(() => {
    if (rawLetter === currentLetter) return;

    const params = new URLSearchParams(searchParams);
    if (currentLetter) {
      params.set("letter", currentLetter);
    } else {
      params.delete("letter");
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [currentLetter, pathname, rawLetter, router, searchParams]);

  const getAlphabet = () => {
    if (language === "az") {
      return [
        "A",
        "B",
        "C",
        "Ç",
        "D",
        "E",
        "Ə",
        "F",
        "G",
        "Ğ",
        "H",
        "X",
        "I",
        "İ",
        "J",
        "K",
        "Q",
        "L",
        "M",
        "N",
        "O",
        "Ö",
        "P",
        "R",
        "S",
        "Ş",
        "T",
        "U",
        "Ü",
        "V",
        "Y",
        "Z",
      ];
    } else if (language === "en") {
      return [
       "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      ];
    }
    return [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];
  };

  const alphabet = getAlphabet();

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2 p-4 bg-[#9999993e] rounded-[16px]">
        <Link
          href="/glossary/terms"
          className={`px-3 py-2 rounded-full text-sm font-medium ${
            !currentLetter
              ? "bg-jsyellow text-white"
              : "bg-white text-jsblack hover:bg-jsyellow/10"
          } transition-colors duration-300`}
        >
          {allText}
        </Link>

        {alphabet.map((letter) => (
          <Link
            key={letter}
            href={`/glossary/terms?letter=${encodeURIComponent(letter)}`}
            className={`px-3 py-2 rounded-full text-sm font-medium ${
              currentLetter === letter
                ? "bg-jsyellow text-white"
                : "bg-white text-jsblack hover:bg-jsyellow/10"
            } transition-colors duration-300`}
          >
            {letter}
          </Link>
        ))}
      </div>
    </div>
  );
}

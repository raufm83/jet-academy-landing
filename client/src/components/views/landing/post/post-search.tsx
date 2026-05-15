"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "@/i18n/routing";

interface PostSearchProps {
  placeholderText: string;
  initialQuery?: string;
  basePath?: string;
}

export default function PostSearch({
  placeholderText,
  initialQuery = "",
  basePath = "/blog",
}: PostSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const trimmed = searchQuery.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholderText}
          className="w-full px-6 py-4 pr-12 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-jsyellow/50 transition-all"
          aria-label={placeholderText}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-jsblack"
          aria-label={placeholderText}
        >
          <FiSearch size={20} />
        </button>
      </form>
    </div>
  );
}

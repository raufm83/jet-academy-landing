"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { debounce } from "lodash";

interface Category {
  id: string;
  name: {
    az: string;
    en: string;
  };
}

interface GlossaryTermFilterProps {
  categories: Category[];
  initialSearch?: string;
  initialCategoryId?: string;
  searchPlaceholder: string;
  allCategoriesText: string;
  language: string;
}

export default function GlossaryTermFilter({
  categories,
  initialSearch = "",
  initialCategoryId = "all",
  searchPlaceholder,
  allCategoriesText,
  language,
}: GlossaryTermFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);

  // Update URL parameters
  const updateQueryParams = useCallback(
    (search: string, catId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset page when filter changes
      params.delete("page");
      
      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      if (catId && catId !== "all") {
        params.set("categoryId", catId);
      } else {
        params.delete("categoryId");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const debouncedUpdate = useCallback(
    debounce((search: string, catId: string) => {
      updateQueryParams(search, catId);
    }, 500),
    [updateQueryParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedUpdate(value, selectedCategory);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    updateQueryParams(searchQuery, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateQueryParams(searchQuery, selectedCategory);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
      <form onSubmit={handleSubmit} className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="w-full px-6 py-4 pr-12 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-jsyellow/50 transition-all"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-jsblack"
        >
          <FiSearch size={20} />
        </button>
      </form>

      <div className="w-full md:w-64">
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-jsyellow/50 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1em'
          }}
        >
          <option value="all">{allCategoriesText}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name[language as keyof typeof category.name] || category.name.az}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

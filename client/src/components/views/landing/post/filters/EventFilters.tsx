"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MdCalendarToday, MdHistory, MdEventAvailable } from "react-icons/md";
import { useTranslations } from "next-intl";

export default function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("postsPage");
  const currentStatus = searchParams.get("eventStatus") || "UPCOMING";

  const filters = [
    {
      id: "UPCOMING",
      label: t("upcoming"),
      icon: <MdCalendarToday className="text-xl" />,
    },
    {
      id: "PAST",
      label: t("past"),
      icon: <MdHistory className="text-xl" />,
    },
    {
      id: "ALL",
      label: t("all"),
      icon: <MdEventAvailable className="text-xl" />,
    },
  ];

  const handleFilterClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("eventStatus", status);
    // Reset to page 1 when filter changes
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full px-4 mb-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-start gap-4">
          {filters.map((filter) => {
            const isActive = currentStatus === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-sm ${
                  isActive
                    ? "bg-jsyellow text-white shadow-jsyellow/20 -translate-y-1"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

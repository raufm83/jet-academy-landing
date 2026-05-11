"use client";
import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/utils/cn";

interface INavLink {
  title: string;
  href: string;
  items?: INavLink[];
  noHover?: boolean;
  isActive?: boolean;
  className?: string;
  handleClick?: () => void;
}

export default function NavLink({
  title,
  href,
  className,
  items,
  isActive,
  handleClick,
  noHover = false,
}: INavLink) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!items || items.length === 0) {
    return (
      <Link
        href={href}
        className={cn(
          "transition-all duration-300 relative group hover:text-jsyellow",
          isActive ? "text-jsyellow" : "text-jsblack",
          className
        )}
        onClick={handleClick}
      >
        {title}
        {!noHover && (
          <span className="absolute left-0 right-0 -bottom-1 h-[1px] bg-jsyellow transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
        )}
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 transition-all duration-300 hover:text-jsyellow focus:outline-none",
          className
        )}
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("ml-1 transition-transform duration-300", isOpen && "rotate-180")}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div
        className={cn(
          "z-10 overflow-hidden transition-all duration-200",
          "xl:absolute xl:left-0 xl:top-10 xl:mt-2 xl:w-56 xl:rounded-md xl:shadow-lg xl:bg-white",
          // Mobil/tabletdə bağlı olanda yer tutmasın (invisible hələ də layout boşluğu yaradırdı)
          isOpen
            ? "block opacity-100 xl:visible xl:pointer-events-auto"
            : "hidden opacity-0 xl:block xl:invisible xl:pointer-events-none xl:opacity-0"
        )}
      >
        <div className="py-1 xl:border xl:border-gray-100 rounded-md">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-jsyellow transition-colors",
                item.className
              )}
              onClick={() => {
                setIsOpen(false);
                if (handleClick) handleClick();
                if (item.handleClick) item.handleClick();
              }}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

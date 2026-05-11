"use client";
import { cn } from "@/utils/cn";
import React from "react";
import type { IconType } from "react-icons";

interface IButton {
  text?: string;
  /** Quill HTML — verilərsə, `text` əvəzinə göstərilir */
  labelHtml?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  onClick?: () => void;
  icon?: IconType | React.ReactElement;
  iconSize?: number;
  iconPosition?: "left" | "right";
  className?: string;
  fontWeight?: "normal" | "bold" | "semibold" | "extrabold";
}

export default function Button({
  text,
  variant = "primary",
  type = "button",
  icon: Icon,
  className,
  iconPosition = "left",
  iconSize = 16,
  fontWeight = "semibold",
  onClick,
  labelHtml,
}: IButton) {
  const renderIcon = () => {
    if (!Icon) return null;

    if (React.isValidElement(Icon)) {
      return Icon;
    }

    if (typeof Icon === "function") {
      return <Icon size={iconSize} />;
    }

    return null;
  };

  return (
    <button
      className={cn(
        "group/btn",
        variant === "primary" &&
          "bg-jsyellow hover:bg-white border hover:border-jsyellow hover:text-jsyellow text-white hover:opacity-70",
        variant === "secondary" && "bg-white text-jsyellow hover:bg-gray-50",
        "py-3 px-8 rounded-[30px]",
        "flex items-center transition-all duration-300 justify-center gap-2",
        iconPosition === "right" && "flex-row-reverse",
        fontWeight === "normal" && "font-normal",
        fontWeight === "bold" && "font-bold",
        fontWeight === "semibold" && "font-semibold",
        fontWeight === "extrabold" && "font-extrabold",
        className,
        "w-fit"
      )}
      onClick={onClick}
      type={type}
    >
      <span className="inline-flex transition-transform duration-300 group-hover/btn:rotate-[10deg]">
        {renderIcon()}
      </span>
      {labelHtml ? (
        <span
          className="transition-transform duration-300 group-hover/btn:-translate-y-px [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: labelHtml }}
        />
      ) : (
        text && (
          <span className="transition-transform duration-300 group-hover/btn:-translate-y-px">
            {text}
          </span>
        )
      )}
    </button>
  );
}

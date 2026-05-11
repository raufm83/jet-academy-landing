"use client";

import React from "react";

interface LazyHtmlContentProps {
  html: string;
  className?: string;
  /** Skip DOMPurify sanitisation (content already trusted) */
  skipClean?: boolean;
}

export default function LazyHtmlContent({
  html,
  className,
}: LazyHtmlContentProps) {
  if (!html) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className={className}
    />
  );
}

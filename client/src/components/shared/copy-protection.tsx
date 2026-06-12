"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CopyProtection() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) return;

    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventSelect = (e: Event) => e.preventDefault();
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("selectstart", preventSelect);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("selectstart", preventSelect);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [isDashboard]);

  return null;
}

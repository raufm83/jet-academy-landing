"use client";

import { useEffect } from "react";

export default function CopyProtection() {
  useEffect(() => {
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
  }, []);

  return null;
}

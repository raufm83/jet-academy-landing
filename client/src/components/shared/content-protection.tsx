"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DASHBOARD_PATH_PREFIX = "/dashboard";

export default function ContentProtection() {
  const pathname = usePathname();

  useEffect(() => {
    const isDashboard = pathname?.startsWith(DASHBOARD_PATH_PREFIX);
    if (isDashboard) {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      // @ts-expect-error: msUserSelect is a vendor specific property not in standard types
      document.body.style.msUserSelect = "";
      return;
    }

    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    const handleCopyCutPaste = (e: ClipboardEvent): void => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "F12") {
        e.preventDefault();
      }
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")
      ) {
        e.preventDefault();
      }

      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);
    document.addEventListener("keydown", handleKeyDown);

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    // @ts-expect-error: msUserSelect is a vendor specific property not in standard types
    document.body.style.msUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      // @ts-expect-error: msUserSelect is a vendor specific property not in standard types
      document.body.style.msUserSelect = "";
    };
  }, [pathname]);

  return null;
}

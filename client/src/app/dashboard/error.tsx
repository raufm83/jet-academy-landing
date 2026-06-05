"use client";

import { Button } from "@nextui-org/react";
import { useEffect } from "react";
import { MdErrorOutline } from "react-icons/md";

/**
 * Dashboard route-u üçün error boundary.
 * Hər hansı client komponentindəki istisna bütün səhifəni "Application error"
 * ağ ekranına çevirməsin deyə — bərpa edilə bilən UI göstərir və xətanı loglayır.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-50 p-3">
            <MdErrorOutline className="text-red-500" size={40} />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-bold text-black">
          Xəta baş verdi
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Səhifə yüklənərkən gözlənilməz xəta yarandı. Zəhmət olmasa yenidən
          cəhd edin.
        </p>

        {error?.digest && (
          <p className="mb-6 break-all rounded-md bg-gray-50 p-2 font-mono text-tiny text-gray-400">
            {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            className="w-full bg-jsyellow text-white hover:bg-jsyellow/90"
            onPress={() => reset()}
          >
            Yenidən cəhd et
          </Button>
          <Button
            variant="bordered"
            className="w-full"
            onPress={() => {
              window.location.assign("/dashboard/login/");
            }}
          >
            Girişə qayıt
          </Button>
        </div>
      </div>
    </div>
  );
}

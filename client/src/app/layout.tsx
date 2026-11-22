import type { Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const CopyProtection = dynamic(
  () => import("@/components/shared/copy-protection"),
  { ssr: false }
);

import Preloader from "@/components/ui/preloader";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const manrope = Manrope({
  display: "swap",
  preload: true,
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const htmlLang = localeCookie === "en" ? "en" : "az";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.jetacademy.az" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.jetacademy.az" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>
      
      <GoogleTagManager gtmId="GTM-NCM3LML8" />
      <body
        className={`${manrope.className} scroll-smooth antialiased overflow-x-clip`}
      >
        <Preloader />
        {children}
        <CopyProtection />
        <Toaster />
      </body>
    </html>
  );
}
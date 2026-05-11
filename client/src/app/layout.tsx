import type { Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";

const ContentProtection = dynamic(
  () => import("@/components/shared/content-protection"),
  { ssr: false }
);

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
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '776740991610419');
fbq('track', 'PageView');

            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            height="1"
            width="1"
            alt=""
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=24501015369551397&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      
      <body
        className={`${manrope.className} scroll-smooth antialiased overflow-x-clip`}
      >
        <ContentProtection />
        {children}
        <Toaster />
        <GoogleAnalytics gaId="G-Z9R55K1YB9" />
      </body>
    </html>
  );
}
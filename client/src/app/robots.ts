import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/dashboard",
        "/registration",
        "/*/registration",
        "/*/glossary/terms/?letter=",
        "/glossary/terms/?letter=",
        "/*/glossary/search*",
        "/glossary/search*",
      ],
    },
    sitemap: "https://jetacademy.az/sitemap.xml",
  };
}


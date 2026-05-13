import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/dashboard",
        "/en/registration",
        "/az/registration",
        "/az/glossary/terms/?letter=",
        "/en/glossary/terms/?letter=",
        "/az/glossary/search*",
        "/en/glossary/search*",
      ],
    },
    sitemap: "https://jetacademy.az/sitemap.xml",
  };
}


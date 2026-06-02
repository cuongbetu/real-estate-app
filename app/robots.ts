import type { MetadataRoute } from "next";

const BASE = "https://nhadatgiatot24h.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}

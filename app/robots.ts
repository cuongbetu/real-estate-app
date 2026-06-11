import type { MetadataRoute } from "next";

const BASE = "https://nhadatgiatot247.com";

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

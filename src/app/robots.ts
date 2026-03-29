import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lagoana.ro";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cont/", "/admin/", "/api/", "/publica"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

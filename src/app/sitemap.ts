import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

// Every indexable page, the same list the navigation and footer link to.
// The practice desk (/app) and the swap screen (/swap) are app views and stay out.
export const ROUTES = [
  "",
  "/why-deploier",
  "/settlement",
  "/network",
  "/connect",
  "/build",
  "/run",
  "/developers",
  "/use-cases/crypto-derivatives",
  "/use-cases/onchain-financing",
  "/use-cases/stablecoin-payments",
  "/use-cases/rwa-tokenization",
  "/faq",
  "/litepaper",
  "/token",
  "/brand",
  "/contact",
  "/terms",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${BRAND.url}${r}`,
    lastModified: now,
    changeFrequency: r === "" || r === "/network" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.6,
  }));
}

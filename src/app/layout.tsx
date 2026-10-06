import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Lexend_Exa } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ChainProvider } from "@/components/providers/ChainProvider";
import { WalletModalProvider } from "@/components/wallet/WalletButton";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { HOME_DESCRIPTION, HOME_TITLE, siteLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
// Wide geometric display face for headings.
const lexend = Lexend_Exa({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-lexend", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: HOME_TITLE, template: `%s | ${BRAND.name}` },
  description: HOME_DESCRIPTION,
  applicationName: BRAND.name,
  openGraph: { type: "website", url: BRAND.url, siteName: BRAND.name, title: HOME_TITLE, description: HOME_DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", site: BRAND.xHandle, creator: BRAND.xHandle, title: HOME_TITLE, description: HOME_DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#1b1b1b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable} ${geistMono.variable}`}>
      <head>
        <JsonLd data={siteLd} />
      </head>
      <body className="min-h-dvh overflow-x-hidden">
        <a href="#main" className="fixed -top-20 left-5 z-[100] rounded-full bg-accent px-5 py-3 text-black focus:top-2.5">
          Skip to content
        </a>
        <WalletProvider>
          <WalletModalProvider>
            <ChainProvider>
              <SiteHeader />
              <main id="main" className="min-h-[70vh]">
                {children}
              </main>
              <SiteFooter />
            </ChainProvider>
          </WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

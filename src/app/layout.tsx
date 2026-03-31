import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegistration } from "@/components/layout/PwaRegistration";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { CompareBar } from "@/components/ads/CompareBar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Lagoana - Piata ta de echipament de vanatoare",
    template: "%s | Lagoana",
  },
  description:
    "Cumpara si vinde echipament de vanatoare - arme, munitie, optica, accesorii si multe altele. Publicare gratuita.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon_16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon_192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lagoana",
  },
};

export const viewport: Viewport = {
  themeColor: "#C9A646",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <Toaster />
          <PwaRegistration />
          <PwaInstallPrompt />
          <CompareBar />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}

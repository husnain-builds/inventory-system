import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://inventory-system-nu-mocha.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StockFlow — Inventory Management",
    template: "%s | StockFlow",
  },
  description:
    "StockFlow is a modern inventory management dashboard for teams. Admins monitor organization-wide stock, users, and alerts. Warehouse staff manage their own inventory with real-time low-stock warnings.",
  keywords: [
    "inventory management",
    "stock tracking",
    "warehouse dashboard",
    "inventory system",
    "stock alerts",
    "StockFlow",
  ],
  applicationName: "StockFlow",
  authors: [{ name: "StockFlow" }],
  creator: "StockFlow",
  publisher: "StockFlow",
  category: "business",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/stockflow-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "512x512", type: "image/png" }],
    shortcut: ["/stockflow-icon.png"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "StockFlow",
    title: "StockFlow — Inventory Management",
    description:
      "Track inventory, stock alerts, and warehouse operations with role-based admin and user dashboards.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StockFlow — Inventory Management Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StockFlow — Inventory Management",
    description:
      "Track inventory, stock alerts, and warehouse operations with role-based admin and user dashboards.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-surface font-sans text-text-primary"
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

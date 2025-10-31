import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "700"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "CS2 Community Server - Skins Control Panel",
  description: "CS2 Community Server - Manage your weapon skins and configurations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable}`}>
        <LanguageProvider>
          <Toaster position="bottom-center" richColors closeButton />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

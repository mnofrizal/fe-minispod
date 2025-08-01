import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "MinisPod - Simple Service Deployment Platform",
  description:
    "Deploy and manage your applications with ease. Simple, powerful, and reliable service deployment platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <ConditionalNavbar />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

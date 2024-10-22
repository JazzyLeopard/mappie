import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";

import "./globals.css";

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Projeqtly",
  description: "Projeqtly helps you analyse epics and stories with AI-powered insights in real-time.",
  keywords: "Projeqtly, Epics, Stories, Project Management, AI-powered Insights",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/Projeqtly.svg",
        href: "/Projeqtly.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/Projeqtly.svg",
        href: "/Projeqtly.svg",
      },
    ],
  },
  openGraph: {
    title: "projeqtly",
    description: "Projeqtly helps you analyse epics and stories with AI-powered insights in real-time.",
    url: "https://projeqtly.vercel.app/",
    images: [
      {
        url: "https://projeqtly.vercel.app/thumbnail.png",
        alt: "Projeqtly logo",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
        <Toaster />
      </html>
    </ConvexClientProvider>
  );
}

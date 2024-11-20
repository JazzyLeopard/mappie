import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";

import "./globals.css";

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Projeqtly",
  description: "Analyse Epics & Stories on the fly",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ConvexClientProvider>
  );
}

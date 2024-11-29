import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";

import "@/app/globals.css";

import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mappie - AI-Powered Product Management",
  description: "From requirements to stories, superfast.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/Mappie.svg",
        href: "/Mappie.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/Mappie.svg",
        href: "/Mappie.svg",
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
        </body>
      </html>
    </ConvexClientProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";

import "./globals.css";

import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/clerk-react";

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
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
          <ConvexClientProvider>
            <Toaster />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

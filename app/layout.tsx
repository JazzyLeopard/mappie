import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";
import { OpenPanelComponent } from '@openpanel/nextjs';

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
          <OpenPanelComponent
            clientId="388813f4-70f3-47cf-901d-1db7c4825cf3"
            trackScreenViews={true}
            // Uncomment and set these options as needed
            // trackAttributes={true}
            // trackOutgoingLinks={true}
            // profileId={'123'} // If you have a user id
          />
          {children}
        </body>
      </html>
    </ConvexClientProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";
import { OpenPanelComponent } from '@openpanel/nextjs';

import "@/app/globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mappie - AI-Powered Product Management",
  description: "From requirements to stories, superfast.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon.png",
        href: "/favicon.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon.png",
        href: "/favicon.png",
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
        <ConvexClientProvider>
          <OpenPanelComponent
            clientId="388813f4-70f3-47cf-901d-1db7c4825cf3"
            trackScreenViews={true}
          // Uncomment and set these options as needed
          // trackAttributes={true}
          // trackOutgoingLinks={true}
          // profileId={'123'} // If you have a user id
          />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";
import { OpenPanelComponent } from '@openpanel/nextjs';
import { Toaster } from 'sonner';
import { PostHogProvider } from './context/posthog.provider';

import "@/app/globals.css";
import { CannySso } from '@/components/CannySso'
import Script from 'next/script';


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
      <body className={inter.className} style={{ backgroundColor: '#f8fafc' }}>
        <Script 
          src="https://analytics.ahrefs.com/analytics.js" 
          data-key="pvIEoJvCQ4UcZCKAfeUXEQ"
        />
        <ConvexClientProvider>
          <PostHogProvider>
            <CannySso />
            <OpenPanelComponent
              clientId="388813f4-70f3-47cf-901d-1db7c4825cf3"
              trackScreenViews={true}
            // Uncomment and set these options as needed
            // trackAttributes={true}
            // trackOutgoingLinks={true}
            // profileId={'123'} // If you have a user id
            />
            {children}
            <Toaster />
          </PostHogProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

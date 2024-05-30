import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Listoriq",
  description: "Anlyse Epics & Stories on the fly",
  icons: {
    icon: [ 
        {
          media: "(prefers-color-scheme: light)",
          url: "/logolis.svg",
          href: "/logolis.svg",
        },
        {
          media: "(prefers-color-scheme: dark)",
          url: "/logolis.svg",
          href: "/logolis.svg",
        },
      ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          {children}
          <Toaster position="bottom-center" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}

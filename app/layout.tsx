import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ConvexClientProvider from "./ConvexClientProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Listoriq",
	description: "Analyse Epics & Stories on the fly",
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
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConvexClientProvider>
			<html lang="en">
				<body className={inter.className}>{children}</body>
			</html>
		</ConvexClientProvider>
	);
}

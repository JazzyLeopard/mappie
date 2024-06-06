import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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

const publishableKey =
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider publishableKey={publishableKey}>
			<html lang="en">
				<body className={inter.className}>{children}</body>
			</html>
		</ClerkProvider>
	);
}

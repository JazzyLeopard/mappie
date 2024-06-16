"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(
	process.env.NEXT_PUBLIC_CONVEX_URL!
);

export default function ConvexClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<ClerkProvider
			publishableKey={
				process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
			}>
			<Toaster position="bottom-right" />
			<ConvexProviderWithClerk
				client={convex}
				useAuth={useAuth}>
				{children}
			</ConvexProviderWithClerk>
		</ClerkProvider>
	);
}

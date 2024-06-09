"use client";

import Spinner from "@/components/ui/spinner";
import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import React from "react";
import { Navigation } from "./_components/navigation";

const MainLayout = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { isLoading } = useConvexAuth();
	const { user, isSignedIn } = useUser();

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center ">
				<Spinner size={"lg"} />
			</div>
		);
	}

	if (!isSignedIn) {
		return redirect("/");
	}

	return (
		<div className="h-full flex">
			<Navigation />
			<main className="flex flex-1 overflow-y-auto">
				{children}
			</main>
		</div>
	);
};

export default MainLayout;

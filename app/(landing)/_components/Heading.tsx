"use client";
// import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
// import { Spinner } from "@/components/spinner";

import Link from "next/link";

export const Heading = () => {
	return (
		<div className="max-w-3xl space-y-4">
			<h1 className="text-3xl sm:text-5xl md:text-4xl font-semi-bold">
				Your Epics & Stories analysed. Superfast. <br />
				Welcome to{" "}
				<span className="underline font-bold">
					Listoriq
				</span>
				.
			</h1>
			<h3 className="text-base sm:text-xl md:text-2xl font-medium">
				Listoriq is the go-to tool for analysing Epics &
				Stories, with AI.
			</h3>
			{/* <Button asChild> */}
			<Link href="/projects">
				Enter Listoriq
				<ArrowRight className="h-4 w-4 ml-2" />
			</Link>
			{/* </Button> */}
		</div>
	);
};

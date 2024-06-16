"use client";

import Image from "next/image";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/clerk-react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";
import Empty from "@/public/empty.png";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { createProject } from "@/convex/projects";

const ProjectsPage = () => {
	const { user, isSignedIn } = useUser();

	// const createProject = useMutation(
	// 	api.projects.createProject
	// );

	// const onCreate = () => {
	// 	const promise = createProject({
	// 		title: "Untitled",
	// 		userId: user?.id,
	// 		isPublished: false,
	// 		description: "",
	// 	});

	// 	toast.promise(promise, {
	// 		loading: "Creating project...",
	// 		success: "New project created",
	// 		error: "Failed to create project",
	// 	});
	// };

	return (
		<div className="h-full w-full flex flex-col items-center justify-center space-y-6">
			<Image
				src={Empty}
				alt="documents"
				width={100}
				height={100}
			/>

			<h2 className="text-xl font-semibold">
				Welcome to {user?.fullName}&apos;s Listoriq
			</h2>

			<SignedIn>
				<UserButton afterSignOutUrl="/" />
			</SignedIn>

			<Button onClick={() => {}}>
				<PlusCircle className="h-4 w-4 mr-2 " />
				<p>Create a new project</p>
			</Button>
		</div>
	);
};

export default ProjectsPage;

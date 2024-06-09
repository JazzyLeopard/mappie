"use client";

import Image from "next/image";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/clerk-react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";

// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { toast } from "sonner";

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
		<div className="h-full flex flex-col items-center justify-center space-y-6">
			{/* <Image
				src="/empty.svg"
				alt="documents"
				width={200}
				height={200}
			/> */}

			<h2 className="text-xl font-semibold">
				Welcome to {user?.firstName}&apos;s DictaDoc
			</h2>

			<SignedIn>
				<UserButton afterSignOutUrl="/" />
			</SignedIn>

			<Button
			// onClick={onCreate}
			>
				<PlusCircle className="h-4 w-4 mr-2 " />
				<p>Create a new project</p>
			</Button>
		</div>
	);
};

export default ProjectsPage;

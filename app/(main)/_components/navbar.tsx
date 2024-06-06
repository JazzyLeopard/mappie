"use client";

import { MenuIcon, Menu } from "lucide-react";
import { useParams } from "next/navigation";

// import { useQuery } from "convex/react";
// import { useParams } from "next/navigation";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { MenuIcon } from "lucide-react";
// import { Title } from "./title";
// import { Banner } from "./banner";
// import { Menu } from "./menu";

interface NavbarProps {
	isCollapsed: boolean;
	onResetWidth: () => void;
}

export const Navbar = ({
	isCollapsed,
	onResetWidth,
}: NavbarProps) => {
	// const params = useParams();
	// const project = useQuery(api.projects.getById, {
	// 	projectId: params.projectId as Id<"projects">,
	// });

	// if (project === undefined) {
	// 	return <div>Not found</div>;
	// }

	// if (project === null) {
	// 	return <div>Not found</div>;
	// }

	return (
		<>
			{/* <nav className="bg-background px-3 py-2 w-full flex items-center gap-x-4">
				{isCollapsed && (
					<MenuIcon
						role="button"
						onClick={onResetWidth}
						className="h-6 w-6 text-muted-foreground   "
					/>
				)}
				<div className="flex items-center justify-between w-full">
					<Title initialData={project} />
					<div className="flex items-center gap-x-2">
						<Menu projectId={project._id} />
					</div>
				</div>
			</nav>
			{project.isArchived && (
				<Banner projectId={project._id} />
			)} */}
		</>
	);
};

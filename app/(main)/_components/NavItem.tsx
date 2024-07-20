import { ChevronDown, ChevronRight, LucideIcon, MoreHorizontal, PlusIcon } from "lucide-react";
import React, { useState } from "react";

import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface NavItemProps {
	id?: Id<"projects">;
	active?: boolean;
	expanded?: boolean;
	level?: number;
	onExpand?: () => void;
	label?: string;
	icon: LucideIcon | null;
	onClick?: () => void;
}

const NavItem = ({
	id,
	active,
	expanded,
	level = 0,
	onExpand,
	label,
	onClick,
	icon: Icon,
}: NavItemProps) => {
	const router = useRouter()
	const createProject = useMutation(api.projects.createProject);
	const createEpic = useMutation(api.epics.createEpics);
	const archiveProject = useMutation(api.projects.archiveProject)
	const [openDialog, setOpenDialog] = useState(false)

	const onArchiveClick = async (id: Id<"projects">, isArchived: boolean) => {
		console.log(`Archiving project with ID: ${id}, isArchived: ${isArchived}`)
		await archiveProject({ _id: id, isArchived: !isArchived });
		setOpenDialog(false)
		router.push(`/projects/${id}`);
	}

	const handleExpand = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();
		onExpand?.();
	};

	const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();

		// create an EPIC if click + on Project Name
		if (level == 0 && id) {
			const promise = createEpic({ title: "Untitled Epic", projectId: id }).then(() => {
				if (!expanded) {
					onExpand?.();
				}
			}).catch((error) => {
				console.error("Error creating epic:", error);
			});

			toast.promise(promise, {
				loading: "Creating new epic...",
				success: "New Epic created",
				error: "Failed to create Epic",
			});
		}
	};
	const ChevronIcon = expanded ? ChevronDown : ChevronRight;

	return (
		<div
			className={cn(
				"group min-h-[35px] w-full mt-2 rounded flex items-center text-gray-700 font-medium text-base py-1 pr-3 hover:bg-white/60",
				active && "bg-primary/5 text-primary"
			)}
			style={{ paddingLeft: level ? `${(level * 12) + 12}px` : "12px" }}
			onClick={onClick}
			role="button"
		>
			{!!id && (
				<div
					role="button"
					className="h-full rounded-sm hover:bg-neutral-300 dark:bg-neutral-600 mr-1"
					onClick={handleExpand}
				>
					<ChevronIcon className="h-4 w-4 shrink-0 " />
				</div>
			)}

			{Icon && (<Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground" />)}


			<span className="truncate">{label}</span>

			{!!id && (
				<div className="ml-auto flex items-center gap-x-2">
					<div
						role="button"
						onClick={onCreate} // pass onCreate function to enable creating nested childs
						className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
					>
						<PlusIcon className="h-4 w-4 text-gray-500" />
					</div>

					<div className="relative flex items-center">
						<DropdownMenu>
							<DropdownMenuTrigger>
								<div
									role="button"
									className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
								>
									<MoreHorizontal className="h-4 w-4 text-gray-500" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center">
								<DropdownMenuItem onClick={() => setOpenDialog(!openDialog)}>Archive</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

					</div>
				</div>
			)}
			<Dialog open={openDialog} onOpenChange={() => setOpenDialog(!openDialog)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Archive Project?</DialogTitle>
						<DialogDescription>
							Are you sure, you want to Archive this Project: <b>Project Title</b>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => onArchiveClick(id!, false)}>Yes, Archive</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default NavItem;

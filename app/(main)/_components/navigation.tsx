"use client";

import { cn } from "@/lib/utils";
import {
	ChevronsLeft,
	MenuIcon,
	PlusCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
	ElementRef,
	useEffect,
	useRef,
	useState,
} from "react";
import { useMediaQuery } from "usehooks-ts";
import UserItems from "./UserItems";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Item from "./item";
import { Toaster, toast } from "sonner";
import DropdownIcon from "@/icons/DropdownIcon";
import ThreeDotMenuIcon from "@/icons/ThreeDotMenuIcon";
import Link from "next/link";

export const Navigation = () => {
	const pathname = usePathname();

	const createProject = useMutation(
		api.projects.createProject
	);

	const onCreate = () => {
		const mypromise = createProject({
			title: "Untitled Project",
			description: "dummey description",
			objectives: "dummy Objective",
		});

		toast.promise(mypromise, {
			loading: "Creating new project...",
			success: "New project created",
			error: "Failed to create project",
		});


	};


	// const onCreate = async () => {
	// 	try {
	// 		toast('Creating new project...', {
	// 			duration: 4000, // Duration for the loading message
	// 		});
	
	// 		// delay of 4 seconds
	// 		await new Promise(resolve => setTimeout(resolve, 4000));
	
	// 		const mypromise = createProject({
	// 			title: "Cool Project",
	// 		});
	
	// 		await mypromise;
	
	// 		toast.success('New project created');
	// 	} catch (error) {
	// 		toast.error('Failed to create project');
	// 	}
	// };
	

	const projects = useQuery(api.projects.getProjects);
	console.log(projects?.map(it => it._id));
	

	// true if the query matches, false otherwise
	const isMobile = useMediaQuery("(max-width: 768px)");

	const isResizingRef = useRef(false);
	const sidebarRef = useRef<ElementRef<"div">>(null);
	const navbarRef = useRef<ElementRef<"div">>(null);

	const [isResetting, setIsResetting] = useState(false);

	// If mobile view it will auto matically collapse "true"
	const [isCollapsed, setIsCollapsed] = useState(isMobile);

	useEffect(() => {
		if (isMobile) {
			collapse();
		} else {
			resetWidth();
		}
	}, [isMobile]);

	useEffect(() => {
		if (isMobile) {
			collapse();
		} else {
			resetWidth();
		}
	}, [pathname, isMobile]);

	// WHEN NAVBAR IS MOVED
	const handleMouseMove = (event: MouseEvent) => {
		if (!isResizingRef.current) return;

		let newWidth = event.clientX;

		if (newWidth < 240) {
			newWidth = 240;
		}

		if (newWidth > 480) {
			newWidth = 480;
		}

		if (sidebarRef.current && navbarRef.current) {
			sidebarRef.current.style.width = `${newWidth}px`;
			navbarRef.current.style.setProperty(
				"left",
				`${newWidth}`
			);

			navbarRef.current.style.setProperty(
				"width",
				`calc(100% - ${newWidth}px)`
			);
		}
	};

	// WHEN NAVBAR IS LEFT LOOSE
	const handleMouseUp = () => {
		isResizingRef.current = false;

		document.removeEventListener(
			"mousemove",
			handleMouseMove
		);

		document.removeEventListener("mouseup", handleMouseUp);
	};

	// WHEN NAVBAR IS SELECTED
	const handleMouseDown = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		event.preventDefault();
		event.stopPropagation();

		isResizingRef.current = true;

		document.addEventListener("mousemove", handleMouseMove);

		document.addEventListener("mouseup", handleMouseUp);
	};

	const resetWidth = () => {
		if (sidebarRef.current && navbarRef.current) {
			setIsCollapsed(false);
			setIsResetting(true);
		}

		sidebarRef.current!.style.width = isMobile
			? "100%"
			: "240px";

		navbarRef.current!.style.setProperty(
			"width",
			isMobile ? "0" : "calc(100%-240px)"
		);

		navbarRef.current!.style.setProperty(
			"left",
			isMobile ? "100%" : "240px"
		);

		setTimeout(() => setIsResetting(false), 300);
	};

	const collapse = () => {
		if (sidebarRef.current && navbarRef.current) {
			setIsCollapsed(true);
			setIsResetting(true);
		}

		sidebarRef.current!.style.width = "0";

		navbarRef.current!.style.setProperty("width", "100%");

		navbarRef.current!.style.setProperty("left", "0");

		setTimeout(() => setIsResetting(false), 300);
	};

	return (
		<>
			<div
				ref={sidebarRef}
				className={cn(
					"group/sidebar h-full w-60 bg-secondary overflow-y-auto relative z-[100000] flex flex-col",
					isResetting &&
						"transition-all ease-in-out duration-300",
					isMobile && "w-0"
				)}>
				<div
					title="Collapsible sidebar"
					role="button"
					onClick={collapse}
					className={cn(
						"h-6 w-6 text-muted-foreground hover:bg-neutral-300 rounded-sm absolute top-3 right-1 opacity-0 group-hover/sidebar:opacity-100",
						isMobile && "opacity-100"
					)}>
					<ChevronsLeft className="h-6 w-6" />
				</div>

				<div>
					<UserItems />
				</div>

				<div className="mt-4 h-[30rem] overflow-y-auto">
					{projects?.map((proj) => (
						<Link href={`/projects/${proj._id}`} key={proj._id} className="group flex cursor-pointer justify-between mx-2 py-1 select-none rounded-md hover:bg-stone-400/10">
							<div className="flex">
							<DropdownIcon/>
							{proj.title}
							</div>
							<div className="hidden group-hover:block px-2">
								<ThreeDotMenuIcon/>
							</div>
							</Link>
					))}
				</div>

				<div>
					<Item
						label="New Project"
						onClick={onCreate}
						icon={PlusCircle}
					/>
				</div>

				<div
					onClick={resetWidth}
					onMouseDown={handleMouseDown}
					className="opacity-0 group-hover/sidebar:opacity-100 transition
                                cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
				/>
			</div>

			<div
				ref={navbarRef}
				className={cn(
					"z-[100000] absolute top-0 left-60 w-[calc(100%-60px)]",
					isResetting &&
						"transition-all ease-in-out duration-300",
					isMobile && "left-0 w-full"
				)}>
				<nav className="bg-transparent w-full px-3 py-2">
					{isCollapsed && (
						<MenuIcon
							onClick={resetWidth}
							role="button"
							className="h-6 w-6 text-muted-foreground"
						/>
					)}
				</nav>
			</div>
			<Toaster />
		</>
	);
};

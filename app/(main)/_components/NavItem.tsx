import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemProps {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
	active?: boolean;
	badge?: string;
	collapsed?: boolean;
	customElement?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({
	label,
	icon: Icon,
	onClick,
	active,
	badge,
	collapsed,
	customElement
}) => {
	if (customElement) {
		return customElement;
	}

	const button = (
		<div
			onClick={onClick}
			className={cn(
				"flex items-center w-full px-4 py-3 text-sm cursor-pointer",
				"w-full py-3 hover:relative hover:before:absolute hover:before:left-1 hover:before:top-1/2 hover:before:-translate-y-1/2 hover:before:h-6 hover:before:w-1 hover:before:rounded-full hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:to-pink-400 hover:text-primary",
				active && "font-semibold relative before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-full before:bg-gradient-to-b from-blue-400 to-pink-400 text-primary",
				collapsed && "justify-center px-0"
			)}
			role="button"
		>
			<Icon 
				className={cn(
					"h-5 w-5",
					!collapsed && "mr-2",
					"hover:[&>path]:stroke-[url(#blue-pink-gradient)]",
					active && "[&>path]:stroke-[url(#blue-pink-gradient)]"
				)} 
			/>
			<svg width="0" height="0">
				<linearGradient id="blue-pink-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor="#60A5FA" />
					<stop offset="100%" stopColor="#EC4899" />
				</linearGradient>
			</svg>
			{!collapsed && (
				<>
					<span className="flex-grow text-left">{label}</span>
					{badge && (
						<Badge variant="outline" className="ml-auto">
							{badge}
						</Badge>
					)}
				</>
			)}
		</div>
	);

	if (collapsed) {
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						{button}
					</TooltipTrigger>
					<TooltipContent 
						side="right" 
						align="center" 
						sideOffset={10}
					>
						<p>{label}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return button;
};

NavItem.displayName = 'NavItem';

export default NavItem;

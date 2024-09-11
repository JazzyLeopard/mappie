import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItemProps {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
	active?: boolean;
	isDisabled?: boolean;
	badge?: string;
	isHidden?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
	label,
	icon: Icon,
	onClick,
	active,
	isDisabled,
	badge,
	isHidden
}) => {
	if (isHidden) return null;

	return (
		<button
			onClick={onClick}
			disabled={isDisabled}
			className={cn(
				"flex items-center w-full px-4 py-3 text-sm cursor-pointer",
				"w-full py-2",
				active && "bg-primary/5 font-semibold text-primary' : 'text-gray-700 hover:bg-white",
				isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-500"
			)}
		>
			<Icon className={cn("h-4 w-4 mr-2", active && "text-primary")} />
			<span className="flex-grow text-left">{label}</span>
			{badge && (
				<Badge variant="outline" className="ml-auto">
					{badge}
				</Badge>
			)}
		</button>
	);
};

NavItem.displayName = 'NavItem';

export default NavItem;

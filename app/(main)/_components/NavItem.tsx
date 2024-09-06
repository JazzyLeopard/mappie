import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItemProps {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
	active?: boolean;
	badge?: string;
}

const NavItem: React.FC<NavItemProps> = React.memo(({ label, icon: Icon, onClick, active, badge }) => {
	return (
		<div
			onClick={onClick}
			role="button"
			className={cn(`flex items-center w-full px-4 py-3 text-sm cursor-pointer ${
				active ? 'bg-primary/5 font-semibold text-primary' : 'text-gray-700 hover:bg-white'
			}`)}
		>
			<Icon className={`h-4 w-4 mr-2 ${active ? 'text-primary' : ''}`} />
			{label}
			{badge && (
				<Badge variant="outline" className="ml-auto">
					{badge}
				</Badge>
			)}
		</div>
	);
});

NavItem.displayName = 'NavItem';

export default NavItem;

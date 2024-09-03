import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
	active: boolean;
}

const NavItem: React.FC<NavItemProps> = React.memo(({ label, icon: Icon, onClick, active }) => {
	return (
		<button
			onClick={onClick}
			className={`flex items-center w-full px-4 py-3 text-sm ${
				active ? 'bg-primary/5 font-semibold text-primary' : 'text-gray-700 hover:bg-slate-100'
			}`}
		>
			<Icon className={`h-4 w-4 mr-2 ${active ? 'text-primary' : ''}`} />
			{label}
		</button>
	);
});

NavItem.displayName = 'NavItem';

export default NavItem;

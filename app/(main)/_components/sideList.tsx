// SideList.tsx
import { MenuItemType } from "@/lib/types";
import { toTitleCase } from "@/utils/helper"
import Link from "next/link"
import { useState } from "react"

interface SideListProps {
    components: MenuItemType[];
}

const NavLink = ({ section, activeSection, handleSectionClick }: { section: string, activeSection: string, handleSectionClick: (sectionId: string) => void }) => (
    <Link
        href="#"
        className={`block p-2 rounded-md ${activeSection === section ? "font-semibold bg-white text-black-500" : "hover:bg-gray-200"
            }`}
        onClick={() => handleSectionClick(section)}
        prefetch={false}
    >
        {toTitleCase(section)}
    </Link>
);

const SideList = ({ components }: SideListProps) => {

    const [activeSection, setActiveSection] = useState<string>("description");

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    return (
        <div className="w-60 bg-secondary p-4 rounded-md sticky top-[106px] self-start h-auto overflow-y-auto">
            <nav className="space-y-2">
                {components.map(component => (
                    component.active && (
                        <NavLink
                            key={component.key}
                            section={component.key}
                            activeSection={activeSection}
                            handleSectionClick={handleSectionClick}
                        />
                    )
                ))}
            </nav>
        </div>
    )
}

export default SideList
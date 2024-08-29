// FieldList.tsx
import { MenuItemType } from "@/lib/types";
import { toTitleCase } from "@/utils/helper"
import Link from "next/link"

interface FieldListProps {
    components: MenuItemType[];
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const FieldList = ({ components, activeSection, setActiveSection }: FieldListProps) => {
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
        <div className="w-60 bg-secondary p-4 rounded-md self-start h-auto overflow-y-auto">
            <nav className="space-y-2">
                {components.map(component => (
                    <Link
                        key={component.key}
                        href="#"
                        className={`block p-2 rounded-md ${activeSection === component.key ? "font-semibold bg-white text-black-500" : "hover:bg-gray-200"}`}
                        onClick={() => handleSectionClick(component.key)}
                        prefetch={false}
                    >
                        {toTitleCase(component.key)}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default FieldList
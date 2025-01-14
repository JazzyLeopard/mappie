import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionPopupProps, GroupedMentionItems, groupTypeMap } from "./types";

export const MentionPopup = ({ items, searchText, onSelect, position, selectedItems, activeIndex, selectedType }: MentionPopupProps) => {
    const displayOrder = ['Overview', 'Functional Requirements', 'Use Cases', 'Features', 'User Stories'];

    // Group items by their type
    const groupedItems = items.reduce((acc: GroupedMentionItems, item) => {
        switch (item.type) {
            case 'Overview':
                // Ensure Overview is stored as a single item
                if (!acc.Overview) {
                    acc.Overview = [item];
                }
                break;
            case 'FunctionalRequirement':
                acc['Functional Requirements'] = [...(acc['Functional Requirements'] || []), item];
                break;
            case 'UseCase':
                acc['Use Cases'] = [...(acc['Use Cases'] || []), item];
                break;
            case 'Feature':
                acc.Features = [...(acc.Features || []), item];
                break;
            case 'UserStory':
                acc['User Stories'] = [...(acc['User Stories'] || []), item];
                break;
        }
        return acc;
    }, {} as GroupedMentionItems);


    // Helper to get items for second level
    const getSecondLevelItems = (type: string) => {
        switch (type) {
            case 'FunctionalRequirement': return groupedItems['Functional Requirements'];
            case 'UseCase': return groupedItems['Use Cases'];
            case 'Feature': return groupedItems.Features;
            case 'UserStory': return groupedItems['User Stories'];
            default: return [];
        }
    };

    // Add debug logging
    console.log('Rendering MentionPopup with:', { selectedType, items });

    return (
        <div className="relative">
            {/* First level popup */}
            {!selectedType && (
                <div className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 w-[300px]"
                    style={{ top: `${position.top}px`, left: `${position.left}px` }}>
                    <div className="max-h-[300px] overflow-y-auto">
                        {displayOrder.map((groupTitle, index) => (
                            <div key={groupTitle}
                                className={cn(
                                    "px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between",
                                    activeIndex === index && "bg-gray-100"
                                )}
                                onClick={() => {
                                    if (groupTitle === 'Overview' && groupedItems.Overview?.[0]) {
                                        // Directly select the Overview item
                                        onSelect({
                                            type: 'Overview',
                                            items: groupedItems.Overview,
                                            action: 'toggle'
                                        });
                                    } else {
                                        // For other categories, show second level
                                        onSelect({
                                            type: groupTypeMap[groupTitle as keyof typeof groupTypeMap],
                                            items: groupedItems[groupTitle as keyof GroupedMentionItems] || [],
                                            action: 'select-type'
                                        });
                                    }
                                }}
                            >
                                <span className="text-sm font-medium">{groupTitle}</span>
                                {groupTitle !== 'Overview' && <ChevronRight className="h-4 w-4 text-gray-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Second level popup - Only shown for non-Overview types */}
            {selectedType && selectedType !== 'Overview' && (
                <div
                    className="absolute z-50 bg-white rounded-md top-0 left-10 shadow-lg border border-gray-200 w-[300px] max-h-[300px]"
                >
                    <div className="h-full overflow-y-auto">
                        {getSecondLevelItems(selectedType)?.length === 0 ? (
                            // Show placeholder when no items
                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                No items available
                            </div>
                        ) : (
                            // Show items
                            getSecondLevelItems(selectedType)?.map((item, index) => (
                                <div key={item.id}
                                    className={cn(
                                        "px-3 py-2 hover:bg-gray-100 cursor-pointer",
                                        activeIndex === index && "bg-gray-100"
                                    )}
                                    onClick={() => onSelect({
                                        type: selectedType,
                                        items: [item],
                                        action: 'toggle'
                                    })}
                                >
                                    <span className="text-sm">{item.title}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
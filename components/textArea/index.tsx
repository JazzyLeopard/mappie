import { api } from '@/convex/_generated/api';
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from 'convex/react';
import { Paperclip, Plus, Send } from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { MentionPopup } from "./MentionPopup";
import { MentionItem, TextareaProps } from "./types";
import { useMentions } from "./useMentions";

const getPillPrefix = (type: string) => {
    switch (type) {
        case 'UseCase':
            return 'UC';
        case 'FunctionalRequirement':
            return 'FR';
        case 'Feature':
            return 'FEAT';
        case 'UserStory':
            return 'US';
        case 'Overview':
            return 'Epic';
        default:
            return '';
    }
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, contextLabels = [], streamState, variant = 'default', projectId, onChange, ...props }, ref) => {
        const storageKey = `mentionState-${projectId}`;
        const {
            mentionState,
            typedText,
            textareaRef,
            handleMentionSelect,
            handleChange,
            handleKeyDown
        } = useMentions(onChange, storageKey);

        // Add this query to get items
        const items = useQuery(api.projects.getProjectFullDetails,
            projectId ? { projectId: projectId as Id<"projects"> } : "skip"
        );

        useEffect(() => {
            if (mentionState.selectedItems.length > 0) {
                console.log('Selected Pills:', mentionState.selectedItems.map(item => ({
                    type: item.type,
                    title: item.title,
                    id: item.id,
                })));
            }
        }, [mentionState.selectedItems]);

        const filteredItems = useMemo(() => {
            if (!items) return [];

            // Convert object items into a flat array of MentionItem
            const allItems: MentionItem[] = [
                // Overview
                { id: items.project._id, type: 'Overview', title: items.project.title },

                // Functional Requirements
                ...items.functionalRequirements.map(fr => ({
                    id: fr._id,
                    type: 'FunctionalRequirement' as const,
                    title: fr.title
                })),

                // Use Cases
                ...items.useCases.map(useCase => ({
                    id: useCase._id,
                    type: 'UseCase' as const,
                    title: useCase.title
                })),

                // Features (Epics)
                ...items.epics.map(epic => ({
                    id: epic._id,
                    type: 'Feature' as const,
                    title: epic.name
                })),

                // User Stories (nested within epics)
                ...items.epics.flatMap(epic =>
                    epic.userStories?.map(story => ({
                        id: story._id,
                        type: 'UserStory' as const,
                        title: story.title
                    })) || []
                )
            ];


            if (!mentionState.searchText) return allItems;
            return allItems.filter(item =>
                item.title.toLowerCase().includes(mentionState.searchText.toLowerCase())
            );
        }, [items, mentionState.searchText]);

        // Combine refs
        const combinedRef = React.useCallback(
            (element: HTMLTextAreaElement) => {
                textareaRef.current = element;
                if (typeof ref === 'function') {
                    ref(element);
                } else if (ref) {
                    ref.current = element;
                }
            },
            [ref]
        );

        // Add ref for pills container
        const pillsContainerRef = useRef<HTMLDivElement>(null);

        // Add effect to adjust textarea padding
        useEffect(() => {
            if (pillsContainerRef.current && textareaRef.current) {
                const pillsHeight = pillsContainerRef.current.offsetHeight;
                textareaRef.current.style.paddingTop = `${Math.max(pillsHeight + 8, 40)}px`;
            }
        }, [mentionState.selectedItems, contextLabels]); // Update when pills change

        return (
            <>
                <div className="space-y-1 relative">
                    {mentionState.isOpen && (
                        <MentionPopup
                            items={filteredItems || []}
                            searchText={mentionState.searchText}
                            onSelect={handleMentionSelect}
                            position={mentionState.position}
                            selectedItems={mentionState.selectedItems} // Pass selected items
                            activeIndex={mentionState.activeIndex} // Pass active index
                            selectedType={mentionState.selectedType}
                        />
                    )}
                    <div className="relative">
                        {variant === 'chat' && (
                            <div
                                ref={pillsContainerRef}
                                className="absolute top-[1px] left-0 right-0 m-[1px] bg-background/95 backdrop-blur-sm"
                            >
                                <div className="max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                    <div className="flex flex-wrap items-center gap-1.5 p-1.5">
                                        {/* Context Labels */}
                                        {contextLabels.map((label, index) => (
                                            <div key={`context-${index}`}
                                                className="inline-flex shrink-0 items-center gap-1.5 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200"
                                            >
                                                <span className="font-medium text-slate-500">{label.type}:</span>
                                                <span className="text-slate-700">{label.name}</span>
                                            </div>
                                        ))}

                                        {/* Selected Mention Pills */}
                                        {mentionState.selectedItems.map((item, index) => (
                                            <div key={`mention-${item.id}-${index}`}
                                                className="inline-flex shrink-0 items-center gap-1 text-[11px] bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200"
                                            >
                                                <span className="text-blue-700">
                                                    <span className="font-medium">{getPillPrefix(item.type)}: </span>
                                                    {item.title}
                                                </span>
                                                <button
                                                    onClick={() => handleMentionSelect({
                                                        type: item.type,
                                                        items: [item],
                                                        action: 'remove'
                                                    })}
                                                    className="text-blue-400 hover:text-blue-600 ml-0.5"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <textarea
                            ref={combinedRef}
                            className={cn(
                                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                variant === 'chat' ? "pb-14" : "pb-3",
                                className
                            )}
                            value={typedText}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            {...props}
                        />
                        {variant === 'chat' && (
                            <div className="absolute bottom-[1px] left-2 right-2 flex items-center justify-between bg-background/95 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                                                        <Plus className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Coming soon...</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                                                        <Paperclip className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Coming soon...</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={streamState?.isGenerating || streamState?.isWaitingForTool || !props.value}
                                        className="h-8 w-8 mb-2"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
);

Textarea.displayName = "Textarea";

export { Textarea };

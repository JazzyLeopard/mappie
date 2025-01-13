import * as React from "react"
import { useState, useMemo, useRef } from "react"
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from "@/lib/utils"
import { Send, Paperclip, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Button } from "./button";
import { Id } from "@/convex/_generated/dataModel";

interface MentionItem {
  id: string;
  type: 'Overview' | 'FunctionalRequirement' | 'UseCase' | 'Feature' | 'UserStory';
  title: string;
}

interface MentionPopupProps {
  items: MentionItem[];
  searchText: string;
  onSelect: (item: MentionItem) => void;
  position: { top: number; left: number };
}

interface GroupedMentionItems {
  Overview: MentionItem[];
  'Functional Requirements': MentionItem[];
  'Use Cases': MentionItem[];
  Features: MentionItem[];
  'User Stories': MentionItem[];
}

const MentionPopup = ({ items, searchText, onSelect, position }: MentionPopupProps) => {
  // Define the display order
  const displayOrder = ['Overview', 'Functional Requirements', 'Use Cases', 'Features', 'User Stories'];

  // Group items by their type
  const groupedItems = items.reduce((acc: GroupedMentionItems, item) => {
    switch (item.type) {
      case 'Overview':
        acc.Overview = [...(acc.Overview || []), item];
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

  return (
    <div className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto w-[300px]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}>
      {displayOrder.map(groupTitle =>
        groupedItems[groupTitle as keyof GroupedMentionItems]?.length > 0 && (
          <div key={groupTitle}>
            <div className="px-3 py-2 bg-slate-50 font-medium text-sm text-slate-600 border-b">
              {groupTitle}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  contextLabels?: Array<{
    type: string;
    name: string;
  }>;
  onSubmit?: () => void;
  streamState?: {
    isGenerating: boolean;
    isWaitingForTool: boolean;
  };
  variant?: 'default' | 'chat';
  projectId?: Id<"projects">;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, contextLabels = [], streamState, variant = 'default', projectId, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const [mentionState, setMentionState] = useState({
      isOpen: false,
      searchText: '',
      triggerIdx: -1,
      position: { top: 0, left: 0 }
    });

    // Query to fetch all referenceable items for the project
    const items = useQuery(api.projects.getProjectFullDetails,
      projectId ? { projectId: projectId as Id<"projects"> } : "skip"
    );
    console.log("Query results:", items);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === '@') {
        const textarea = e.currentTarget;
        const rect = textarea.getBoundingClientRect();

        // Calculate position above the textarea
        setMentionState({
          isOpen: true,
          searchText: '',
          triggerIdx: textarea.selectionStart,
          position: {
            top: -200, // Position above textarea
            left: 10   // Slight indent from left
          }
        });
      } else if (e.key === 'Escape') {
        // Close popup on escape
        setMentionState(prev => ({ ...prev, isOpen: false }));
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const caretPos = textarea.selectionStart;
      const text = textarea.value;

      // Check if @ was just typed
      if (text[caretPos - 1] === '@') {
        const textBeforeCaret = text.substring(0, caretPos);

        setMentionState({
          isOpen: true,
          searchText: '',
          triggerIdx: caretPos - 1,
          position: {
            top: -20, // Position above the current line
            left: 50
          }
        });
      }
      // Check if @ was deleted
      else if (text[mentionState.triggerIdx] !== '@') {
        setMentionState(prev => ({
          ...prev,
          isOpen: false,
          searchText: ''
        }));
      }
      // Check if we're still in mention context
      else if (mentionState.isOpen) {
        const textFromTrigger = text.slice(mentionState.triggerIdx + 1, caretPos);
        if (textFromTrigger.includes(' ') || textFromTrigger.includes('\n')) {
          setMentionState(prev => ({ ...prev, isOpen: false }));
        } else {
          setMentionState(prev => ({
            ...prev,
            searchText: textFromTrigger
          }));
        }
      }

      // Call the original onChange handler
      onChange?.(e);
    };

    const handleMentionSelect = (item: MentionItem) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const beforeMention = textarea.value.slice(0, mentionState.triggerIdx);
      const afterMention = textarea.value.slice(textarea.selectionStart);
      const mention = `@[${item.title}](${item.type}:${item.id})`;

      textarea.value = beforeMention + mention + afterMention;
      // Close popup after selection
      setMentionState(prev => ({ ...prev, isOpen: false }));
    };

    const filteredItems = useMemo(() => {
      console.log("Filtering items:", items);
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

      console.log("All items:", allItems);

      if (!mentionState.searchText) return allItems;
      return allItems.filter(item =>
        item.title.toLowerCase().includes(mentionState.searchText.toLowerCase())
      );
    }, [items, mentionState.searchText]);
    return (
      <div className="space-y-1 relative">
        {mentionState.isOpen && (
          <MentionPopup
            items={filteredItems || []}
            searchText={mentionState.searchText}
            onSelect={handleMentionSelect}
            position={mentionState.position}
          />
        )}
        <div className="relative">
          {variant === 'chat' && (
            <div className="absolute top-[1px] left-0 right-0 m-[1px] h-10 bg-background/95 backdrop-blur-sm">
              {contextLabels.map((label, index) => (
                <div key={index} className="absolute top-2 left-2 flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  <span className="font-medium text-slate-500">{label.type}:</span>
                  <span className="text-slate-700">{label.name}</span>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={combinedRef}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              contextLabels?.length > 0 ? "pt-10" : "pt-3",
              variant === 'chat' ? "pb-14" : "pb-3",
              className
            )}
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
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 ">
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
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

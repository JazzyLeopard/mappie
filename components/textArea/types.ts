import { TextareaHTMLAttributes } from "react"
import { Id } from "@/convex/_generated/dataModel"

export interface MentionItem {
    id: string;
    type: 'Overview' | 'FunctionalRequirement' | 'UseCase' | 'Feature' | 'UserStory';
    title: string;
}

export interface MentionState {
    isOpen: boolean;
    searchText: string;
    triggerIdx: number;
    position: { top: number; left: number };
    selectedType: string | null;
    activeIndex: number;
    selectedItems: MentionItem[];
}

export interface MentionPopupProps {
    items: MentionItem[];
    searchText: string;
    onSelect: (selection: {
        type: string;
        items: MentionItem[];
        action: 'toggle' | 'remove' | 'select-type'
    }) => void;
    position: { top: number; left: number };
    selectedItems: MentionItem[];
    activeIndex: number;
    selectedType: string | null;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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

export interface GroupedMentionItems {
    Overview: MentionItem[];
    'Functional Requirements': MentionItem[];
    'Use Cases': MentionItem[];
    Features: MentionItem[];
    'User Stories': MentionItem[];
}

export const groupTypeMap = {
    'Overview': 'Overview',
    'Functional Requirements': 'FunctionalRequirement',
    'Use Cases': 'UseCase',
    'Features': 'Feature',
    'User Stories': 'UserStory'
} as const;
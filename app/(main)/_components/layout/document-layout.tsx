"use client"

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';
import LabelToInput from "../LabelToInput";
import LexicalEditor from "../Lexical/LexicalEditor";

interface DocumentLayoutProps {
    data: {
        _id: Id<"knowledgeBase">,
        title: string,
        content: string,
    };
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (attribute: string, value: any) => Promise<void>;
}

export function DocumentLayout({
    data,
    onEditorBlur,
    handleEditorChange,
}: DocumentLayoutProps) {
    const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const toggleAIChat = () => {
        setIsAIChatCollapsed(!isAIChatCollapsed);
    };

    return (
        <div className="flex gap-2 pb-4">
            <div className="flex flex-1 gap-2">
                <div className="flex-1 px-2 bg-white flex flex-col min-w-[50%] relative">
                    <div className="overflow-x-auto pb-3 px-2 sm:mr-2">
                        <div className="pl-10 mt-2 mr-2 flex flex-row gap-4">
                            <LabelToInput
                                value={data.title || "Untitled"}
                                setValue={(newTitle) => handleEditorChange('title', newTitle)}
                                onBlur={onEditorBlur}
                            />
                            <div className="flex gap-2">
                                <Button>
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 min-h-0 relative" withShadow={true}>
                        <div className="px-12 relative">
                            <LexicalEditor
                                key={`content-${data._id}`}
                                itemId={data._id}
                                onBlur={async () => { }}
                                attribute="content"
                                documentDetails={data}
                                setDocumentDetails={(value: any) => handleEditorChange('content', value)}
                                context="document"
                                isRichText={true}
                                showTableOfContents={true}
                            />
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
} 
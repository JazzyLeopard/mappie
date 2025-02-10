"use client"

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area-1";
import { Id } from '@/convex/_generated/dataModel';
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
    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 flex items-center justify-between px-4 py-1 bg-slate-100 border-y border-slate-200 mb-2 mx-3 mt-3 rounded-lg">
                <LabelToInput
                    value={data.title || "Untitled"}
                    setValue={(newTitle) => handleEditorChange('title', newTitle)}
                    onBlur={onEditorBlur}
                    variant="document"
                />
                <Button size="sm" variant="ghost" className="text-xs hover:bg-slate-200"><span className="text-xs">Share</span></Button>
            </div>
            
            <ScrollArea className="flex-1">
                <div className="px-12 py-2">
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
    );
} 
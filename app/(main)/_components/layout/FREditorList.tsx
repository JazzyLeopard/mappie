import React, { useCallback } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import BlockEditor from "../BlockEditor";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { propertyPrompts } from '../constants';
import { debounce } from 'lodash';

interface FREditorListProps {
    projectId: Id<"projects">;
    frId: Id<"functionalRequirements"> | null;
    content: string;
    onEditorChange: (value: string) => void;
    onOpenBrainstormChat: () => void;
    propertyPrompts: typeof propertyPrompts;
    onEditorBlur: () => Promise<void>;
}

const FREditorList: React.FC<FREditorListProps> = ({
    projectId,
    frId,
    content,
    onEditorChange,
    onOpenBrainstormChat,
    onEditorBlur,
    propertyPrompts,
}) => {
    const updateFunctionalRequirements = useMutation(api.functionalRequirements.updateFunctionalRequirement);

    const debouncedHandleEditorChange = useCallback(
        debounce((value: string) => {
            onEditorChange(value);
            if (frId) {
                updateFunctionalRequirements({ id: frId, content: value }).catch(error => {
                    console.error("Error updating functional requirement:", error);
                });
            }
        }, 1000),
        [frId, onEditorChange, updateFunctionalRequirements]
    );

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
                <BlockEditor
                    key={frId || 'new'}
                    projectDetails={{ _id: frId || 'new', content: content }}
                    setProjectDetails={debouncedHandleEditorChange}
                    onOpenBrainstormChat={onOpenBrainstormChat}
                    attribute="content"
                    onBlur={onEditorBlur}
                    context="functionalRequirement"
                />
            </div>
        </div>
    );
};

export default FREditorList;
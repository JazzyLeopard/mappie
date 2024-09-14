import React, { useCallback, useEffect, useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import BlockEditor from "../BlockEditor";
import { debounce } from 'lodash';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { propertyPrompts } from '../constants';

interface FREditorListProps {
    projectId: Id<"projects">;
    frId: Id<"functionalRequirements"> | null;
    content: string;
    onEditorChange: (value: string) => void;
    onOpenBrainstormChat: () => void;
    propertyPrompts: typeof propertyPrompts;
}

interface ProjectDetails {
    _id: Id<"projects"> | Id<"functionalRequirements">;
    content?: string;
    description?: string;
}

const FREditorList: React.FC<FREditorListProps> = ({
    projectId,
    frId,
    content,
    onEditorChange,
    onOpenBrainstormChat,
}) => {
    const [localContent, setLocalContent] = useState(content);

    // Fetch functional requirements from Convex
    const functionalRequirement = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, { projectId });
    const updateFunctionalRequirements = useMutation(api.functionalRequirements.updateFunctionalRequirement);

    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    useEffect(() => {
        if (functionalRequirement && frId && functionalRequirement._id === frId) {
            if (functionalRequirement.content !== localContent) {
                setLocalContent(functionalRequirement.content);
            }
        }
    }, [functionalRequirement, frId, localContent]);

    const handleEditorChange = (value: string) => {
        setLocalContent(value);
        onEditorChange(value);
    };

    const debouncedHandleEditorChange = useCallback(
        debounce(async (value: string) => {
            if (value !== content) {
                console.log("Debounced change in FREditorList:", value);
                onEditorChange(value);
                if (frId) {
                    try {
                        const result = await updateFunctionalRequirements({ id: frId, content: value });
                        console.log("Update result:", result);
                        if (result === null) {
                            console.log("Update completed, but returned null");
                        } else {
                            console.log("Update successful with result:", result);
                        }
                    } catch (error) {
                        console.error("Error updating functional requirement:", error);
                    }
                }
            }
        }, 300),
        [onEditorChange, content, frId, updateFunctionalRequirements]
    );

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <BlockEditor
                key={`${frId || 'new'}-${localContent.length}`}
                projectDetails={{ _id: frId || 'new', description: localContent }}
                setProjectDetails={(value) => {
                    console.log("setProjectDetails called in FREditorList:", value);
                    setLocalContent(value);
                    debouncedHandleEditorChange(value);
                }}
                onOpenBrainstormChat={onOpenBrainstormChat}
                attribute="description"
                onBlur={async () => { }} // Changed to async function
            />
        </div>
    );
};

export default FREditorList;
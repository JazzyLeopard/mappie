import { Button } from '@/components/ui/button';
import { Id } from "@/convex/_generated/dataModel";
import { debounce } from "lodash";
import { PresentationIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import BlockEditor from "../BlockEditor";
import LabelToInput from "../LabelToInput";

interface UCEditorListProps {
    useCases: any[];
    activeUseCase: string | null;
    handleEditorChange: (id: Id<"useCases">, field: string, value: any) => void;
}

const UCEditorList = ({ useCases, activeUseCase, handleEditorChange }: UCEditorListProps) => {
    const [activeUC, setActiveUC] = useState<any>(null);

    useEffect(() => {
        const currentActiveUC = useCases.find(uc => uc._id === activeUseCase);
        setActiveUC(currentActiveUC || null);
    }, [activeUseCase, useCases]);

    const debouncedHandleEditorChange = useCallback(
        debounce((id: Id<"useCases">, field: string, value: any) => {
            handleEditorChange(id, field, value);
        }, 1000),
        [handleEditorChange]
    );

    if (useCases.length === 0) return null; // Add this line to handle empty use cases

    if (!activeUC) return null;

    const handleTitleChange = (newTitle: string) => {
        handleEditorChange(activeUC._id, "title", newTitle);
    };

    const handleEditorBlur = async () => {
        // Implement if needed
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 pb-2 pt-6 bg-white z-10 flex flex-row items-end">
                <LabelToInput
                    value={activeUC.title}
                    setValue={handleTitleChange}
                    onBlur={() => { }}
                />
                <div className="">
                    <Button className="w-full gap-2 h-10" variant="ghost" onClick={() => { }}>
                        <PresentationIcon className="w-4 h-4" />
                        Presentation Mode
                    </Button>
                </div>
            </div>
            <BlockEditor
                key={activeUC._id}
                attribute="description"
                projectDetails={activeUC}
                setProjectDetails={(value) => debouncedHandleEditorChange(activeUC._id, "description", value)}
                onBlur={() => handleEditorBlur()}
                onOpenBrainstormChat={() => { }}
                context="useCase" // Add this line
            />
        </div>
    );
};

export default UCEditorList;
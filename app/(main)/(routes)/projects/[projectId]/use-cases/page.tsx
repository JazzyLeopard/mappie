"use client"
import { propertyPrompts } from "@/app/(main)/_components/constants"
import UseCasesLayout from "@/app/(main)/_components/layout/UseCasesLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface UseCasesProps {
    params: {
        projectId: Id<"projects">;
        propertyPrompts: typeof propertyPrompts;
    };
}

const UseCases = ({ params }: UseCasesProps) => {
    const projectId = params.projectId
    const [content, setContent] = useState<any[]>([])
    const useCases = useQuery(api.useCases.getUseCasesByProjectId, { projectId });
    const createUseCase = useMutation(api.useCases.createUseCase);
    const updateUseCase = useMutation(api.useCases.updateUseCase);
    const deleteUseCase = useMutation(api.useCases.deleteUseCase);

    useEffect(() => {
        if (useCases && useCases?.length > 0) {
            setContent(useCases);
        }
    }, [useCases]);

    const project = useQuery(api.projects.getProjectById, {
        projectId: projectId
    })

    const handleCreateUseCase = useCallback(async () => {
        let newUc = {
            projectId,
            title: `Use Case ${useCases?.length ?? 0 + 1}`,
            description: ''
        }
        const newUseCaseId = await createUseCase(newUc);
    }, [createUseCase, useCases, projectId]);

    const handleUpdateUseCase = useCallback(async (id: Id<"useCases">, field: 'title' | 'description', value: any) => {
        await updateUseCase({ id, [field]: value });
    }, [updateUseCase]);

    const handleEditorChange = useCallback(async (id: Id<"useCases">, field: string, value: any) => {
        await handleUpdateUseCase(id, field as 'title' | 'description', value);
    }, [handleUpdateUseCase]);


    const handleDelete = useCallback(async (id: Id<"useCases">) => {
        try {
            await deleteUseCase({ id });
            setContent(prevContent => prevContent.filter(useCase => useCase._id !== id));
            toast.success("Use case deleted successfully");
        } catch (error) {
            console.error("Error deleting use case:", error);
            toast.error("Failed to delete use case");
        }
    }, [deleteUseCase]);

    const handleOpenBrainstormChat = useCallback(() => {
        // Implement the logic for opening brainstorm chat
    }, []);

    const handleUseCaseNameChange = useCallback(async (useCaseId: Id<"useCases">, newName: string) => {
        await updateUseCase({ id: useCaseId, title: newName })
    }, [updateUseCase])

    if (useCases === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <UseCasesLayout
            projectId={projectId}
            handleEditorChange={handleEditorChange}
            onAddUseCase={handleCreateUseCase}
            onDeleteUseCase={handleDelete}
            useCases={content || []}
            isOnboardingComplete={project?.onboarding == 0}
            onEditorBlur={async () => { }}
            onUseCaseNameChange={handleUseCaseNameChange}
        />
    );
};

export default UseCases;
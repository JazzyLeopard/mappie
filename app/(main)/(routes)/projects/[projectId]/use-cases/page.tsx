"use client"
import { propertyPrompts } from "@/app/(main)/_components/constants"
import UseCasesLayout from "@/app/(main)/_components/layout/UseCasesLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

interface UseCasesProps {
    params: {
        projectId: Id<"projects">;
        propertyPrompts: typeof propertyPrompts;
    };
}

const UseCases = ({ params }: UseCasesProps) => {
    const projectId = params.projectId
    const [title, setTitle] = useState("Use Cases");

    const useCases = useQuery(api.useCases.getUseCasesByProjectId, { projectId });
    const createUseCase = useMutation(api.useCases.createUseCase);
    const updateUseCase = useMutation(api.useCases.updateUseCase);
    const deleteUseCase = useMutation(api.useCases.deleteUseCase);

    const project = useQuery(api.projects.getProjectById, {
        projectId: projectId
    })

    const handleCreateUseCase = useCallback(async () => {
        await createUseCase({
            projectId,
            title: `Use Case ${useCases?.length ?? 0 + 1}`,
            description: '',
        });
    }, [createUseCase, useCases, projectId]);

    const handleUpdateUseCase = useCallback(async (id: Id<"useCases">, field: 'title' | 'description', value: any) => {
        await updateUseCase({ id, [field]: value });
    }, [updateUseCase]);

    const handleEditorChange = useCallback((id: Id<"useCases">, field: string, value: any) => {
        handleUpdateUseCase(id, field as 'title' | 'description', value);
    }, [handleUpdateUseCase]);

    const handleEditorBlur = useCallback(async () => {
        // Implement if needed
    }, []);

    const handleDelete = useCallback(async (id: Id<"useCases">) => {
        try {
            await deleteUseCase({ id });
            toast.success("Use case deleted successfully");
        } catch (error) {
            console.error("Error deleting use case:", error);
            toast.error("Failed to delete use case");
        }
    }, [deleteUseCase]);

    const updateLabel = useCallback((value: string) => {
        setTitle(value);
        // Implement updating the title in your database if needed
    }, []);

    const handleOpenBrainstormChat = useCallback(() => {
        // Implement the logic for opening brainstorm chat
    }, []);

    if (useCases === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <UseCasesLayout
            projectId={projectId}
            title={title}
            onEditorBlur={handleEditorBlur}
            handleEditorChange={handleEditorChange}
            onAddUseCase={handleCreateUseCase}
            propertyPrompts={propertyPrompts}
            onOpenBrainstormChat={handleOpenBrainstormChat}
            useCases={useCases || []}
            isOnboardingComplete={project?.onboarding == 0}
        />
    );
};

export default UseCases;
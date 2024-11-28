"use client"
import { ErrorBoundary } from 'react-error-boundary';
import { propertyPrompts } from "@/app/(main)/_components/constants"
import UseCasesLayout from "@/app/(main)/_components/layout/UseCasesLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs";

interface UseCasesProps {
  params: {
    projectId: string;
    propertyPrompts: typeof propertyPrompts;
  };
}

function UseCasesErrorFallback({ error, resetErrorBoundary }: {
  error: Error,
  resetErrorBoundary: () => void
}) {
  return <div>Error loading use cases: {error.message}</div>;
}

const UseCasesContent = ({ params }: UseCasesProps) => {
  const projectId = params.projectId as Id<"projects">;
  const [error, setError] = useState<Error | null>(null);
  const [content, setContent] = useState<any>([])
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
      setContent((prevContent: any[]) => prevContent.filter((useCase: any) => useCase._id !== id));
      toast.success("Use case deleted successfully");
    } catch (error) {
      console.error("Error deleting use case:", error);
      toast.error("Failed to delete use case");
    }
  }, [deleteUseCase]);


  if (error) {
    return <div>Error loading use cases: {error.message}</div>;
  }

  if (useCases === undefined || project === undefined) {
    return <Spinner size={"lg"} />;
  }

  return (
    <UseCasesLayout
      handleEditorChange={handleEditorChange}
      onAddUseCase={handleCreateUseCase}
      onDeleteUseCase={handleDelete}
      useCases={content || []}
      isOnboardingComplete={project?.onboarding === 0}
      projectId={projectId}
      onEditorBlur={async () => { }}
      onUseCaseNameChange={async (useCaseId, name) => {
        await handleUpdateUseCase(useCaseId, 'title', name);
      }}
    />
  );
};

const UseCases = (props: UseCasesProps) => {
  return (
    <ErrorBoundary
      FallbackComponent={UseCasesErrorFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.reload();
      }}
    >
      <UseCasesContent {...props} />
    </ErrorBoundary>
  );
};

export default UseCases;
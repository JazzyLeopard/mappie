"use client"
import { ErrorBoundary } from 'react-error-boundary';
import { propertyPrompts } from "@/app/(main)/_components/constants"
import UseCasesLayout from "@/app/(main)/_components/layout/UseCasesLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { toast } from "sonner"

interface UseCasesProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({ params, searchParams }: UseCasesProps) {
  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);
  const [content, setContent] = useState<any>([])
  const useCases = useQuery(api.useCases.getUseCasesByProjectId, { projectId });
  const createUseCase = useMutation(api.useCases.createUseCase);
  const updateUseCase = useMutation(api.useCases.updateUseCase);
  const deleteUseCase = useMutation(api.useCases.deleteUseCase);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.projectId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (useCases && useCases?.length > 0) {
      setContent(useCases);
    }
  }, [useCases]);

  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId as Id<"projects">
  })

  const handleCreateUseCase = useCallback(async () => {
    await createUseCase({
      projectId,
      title: `New Use case ${useCases?.length ?? 0 + 1}`,
      description: ''
    })
  }, [projectId, useCases, createUseCase]);

  const handleEditorChange = useCallback(async (id: Id<"useCases">, field: string, value: any) => {
    console.log('Editor change:', { id, field, value });
    try {
      await updateUseCase({
        id,
        [field]: value
      })
    } catch (error) {
      console.error("Error updating use case:", error);
    }
  }, [updateUseCase]);

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

  const isOnboardingComplete = useMemo(() => {
    if (!project) return false;
    return project.overview?.trim() !== '';
  }, [project]);


  if (useCases === undefined || project === undefined) {
    return <Spinner size={"lg"} />;
  }

  return (
    <UseCasesLayout
      projectId={projectId as any}
      handleEditorChange={handleEditorChange}
      onAddUseCase={handleCreateUseCase}
      onDeleteUseCase={handleDelete}
      useCases={content || []}
      isOnboardingComplete={isOnboardingComplete}
    />
  );
}
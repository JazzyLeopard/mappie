"use client"

import { CreateNewDoc } from "@/components/onboarding/create-new-doc";
import { PageTransition } from "@/components/transitions/page-transition";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

interface NewDocumentPageProps {
  params: Promise<{
    workspaceId: Id<"workspaces">
  }>
}

export default function NewDocumentPage({ params }: NewDocumentPageProps) {
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;

      setWorkspaceId(resolvedParams.workspaceId);
    };
    resolveParams();
  }, [params]);


  console.log(workspaceId);

  return (
    <PageTransition>
      <CreateNewDoc
        workspaceId={workspaceId as Id<"workspaces">}
      />
    </PageTransition>
  );
} 
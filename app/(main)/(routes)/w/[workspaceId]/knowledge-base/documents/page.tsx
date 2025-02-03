"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { DocumentList } from "@/components/knowledge-base/document-list";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { PageTransition } from "@/components/transitions/page-transition";
import { useEffect, useState } from "react";

interface DocumentsPageProps {
  params: Promise<{
    workspaceId: Id<"workspaces">
  }>
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      console.log(params);

      setWorkspaceId(resolvedParams.workspaceId);
    };
    resolveParams();
  }, [params]);

  const documents = useQuery(api.documents.getDocuments, {
    workspaceId: workspaceId as Id<"workspaces">
  });

  if (!isLoaded || !isSignedIn) return null;

  return (
    <PageTransition>
      <div className="h-full flex-1 flex flex-col items-start gap-5 p-6 px-12">
        <DocumentList
          documents={documents || []}
          onSelect={(id) => router.push(`/w/${workspaceId}/knowledge-base/documents/${id}`)}
          showHeader={true}
          title="Documents"
          variant="documents"
          onNewDocument={() => router.push(`/w/${workspaceId}/knowledge-base/new`)}
        />
      </div>
    </PageTransition>
  );
} 
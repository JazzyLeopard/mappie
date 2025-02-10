"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { DocumentList } from "@/components/knowledge-base/document-list";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { PageTransition } from "@/components/transitions/page-transition";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area-1";

interface DocumentsPageProps {
  params: Promise<{
    workspaceId: Id<"workspaces">
  }>
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setWorkspaceId(resolvedParams.workspaceId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const documents = useQuery(
    api.documents.getDocuments,
    workspaceId ? {
      workspaceId: workspaceId
    } : "skip"
  );

  // Don't render anything until we're mounted and have a workspaceId
  if (!isMounted || !workspaceId) {
    return (
      <ScrollArea className="h-full flex-1 flex flex-col items-start gap-5 p-6 px-12">
        <DocumentList
          documents={[]}
          onSelect={() => {}}
          showHeader={true}
          title="Documents"
          variant="documents"
          onNewDocument={() => {}}
        />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full flex-1 flex flex-col items-start gap-5 p-6 px-12">
      <DocumentList
        documents={documents || []}
        onSelect={(id) => router.push(`/w/${workspaceId}/knowledge-base/documents/${id}`)}
        showHeader={true}
        title="Documents"
        variant="documents"
        onNewDocument={() => router.push(`/w/${workspaceId}/knowledge-base/new`)}
      />
    </ScrollArea>
  );
} 

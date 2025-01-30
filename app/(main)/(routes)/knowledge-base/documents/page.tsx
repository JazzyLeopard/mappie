"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { DocumentList } from "@/components/knowledge-base/document-list";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { PageTransition } from "@/components/transitions/page-transition";

export default function DocumentsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const documents = useQuery(api.documents.getDocuments, {
    workspaceId: workspaces?.[0]._id as Id<"workspaces">
  });

  if (!isLoaded || !isSignedIn) return null;

  return (
    <PageTransition>
      <div className="h-full flex-1 flex flex-col items-start gap-5 p-6 px-12">
        <DocumentList 
          documents={documents || []}
          onSelect={(id) => router.push(`/knowledge-base/documents/${id}?workspace=${workspaces?.[0]?._id}`)}
          showHeader={true}
          title="Documents"
          variant="documents"
          onNewDocument={() => router.push("/knowledge-base/new")}
        />
      </div>
    </PageTransition>
  );
} 
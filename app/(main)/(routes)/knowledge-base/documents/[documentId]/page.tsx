"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentLayout } from "@/app/(main)/_components/layout/document-layout";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";

export default function DocumentPage({ params }: { params: Promise<{ documentId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const workspaceId = searchParams?.get('workspace') as Id<"workspaces">;
  
  // Add validation for Convex ID format
  const rawDocumentId = resolvedParams.documentId;
  const isValidDocumentId = typeof rawDocumentId === 'string' && rawDocumentId.startsWith('k');
  const documentId = isValidDocumentId ? (rawDocumentId as Id<"knowledgeBase">) : null;
  
  const document = useQuery(
    api.documents.getDocumentById, 
    isValidDocumentId && documentId ? { documentId } : "skip"
  );
  const updateDocument = useMutation(api.documents.updateDocument);

  if (!documentId || !document) return null;

  return (
    <DocumentLayout
      data={{
        _id: documentId,
        title: document.title || "Untitled",
        content: document.content || "",
      }}
      onEditorBlur={async () => {}}
      handleEditorChange={async (attribute, value) => {
        if (!documentId) return;
        
        await updateDocument({
          documentId,
          [attribute]: value
        });
      }}
    />
  );
}
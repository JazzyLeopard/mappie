"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { PageTransition } from "@/components/transitions/page-transition";
import { DocumentList } from "@/components/knowledge-base/document-list";
import { ScrollArea } from "@/components/ui/default-scroll-area";

export default function UploadsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const uploads = useQuery(api.knowledgeBase.getByType, {
    workspaceId: workspaces?.[0]._id as Id<"workspaces">,
    types: ["pdf", "docx", "csv", "ppt", "image"]
  });

  if (!isLoaded || !isSignedIn) return null;

  return (
    <ScrollArea className="h-full flex-1 flex flex-col items-start gap-5 p-6 px-12">
      <DocumentList 
            documents={uploads || []}
            onSelect={(id) => router.push(`/w/${workspaces?.[0]?._id}/knowledge-base/uploads/${id}`)}
            showFilter={true}
            showHeader={true}
            title="Uploads"
            onUpload={() => router.push(`/w/${workspaces?.[0]?._id}/knowledge-base/uploads/new`)}
      />
    </ScrollArea>
  );
} 
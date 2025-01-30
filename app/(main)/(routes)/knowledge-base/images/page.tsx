"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { PageTransition } from "@/components/transitions/page-transition";

export default function ImagesPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const images = useQuery(api.knowledgeBase.getByType, {
    workspaceId: workspaces?.[0]._id as Id<"workspaces">,
    types: ["image"]
  });

  if (!isLoaded || !isSignedIn) return null;

  return (
    <PageTransition>
      <div className="h-full flex-1 flex flex-col items-start gap-5 p-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold">Images</h1>
          <Button onClick={() => router.push("/knowledge-base/images/new")}>
            <Image className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
        {/* Add images grid component here */}
        <p className="text-sm text-muted-foreground">Images grid coming soon...</p>
      </div>
    </PageTransition>
  );
} 
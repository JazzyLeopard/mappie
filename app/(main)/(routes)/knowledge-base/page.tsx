"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, FileText, Image } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { PageTransition } from "@/components/transitions/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  return (
    <PageTransition>
      <div className="h-full flex-1 flex flex-col items-start gap-5 p-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/knowledge-base/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Document
            </Button>
            <Button onClick={() => router.push("/knowledge-base/uploads/new")}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button onClick={() => router.push("/knowledge-base/images/new")}>
              <Image className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => router.push("/knowledge-base/documents")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and manage your documents
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/knowledge-base/uploads")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload and manage your files
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/knowledge-base/images")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Store and organize your images
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
} 
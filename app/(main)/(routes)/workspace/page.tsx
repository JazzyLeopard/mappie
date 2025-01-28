"use client";

import LabelToInput from "@/app/(main)/_components/LabelToInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { FileText, FolderKanban, Plus, Wand2, Command, BookOpen } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload } from "lucide-react";

export default function WorkspacePage() {
  const updateWorkspace = useMutation(api.workspaces.updateWorkspace);
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const workspace = workspaces?.[0]; // Get first workspace
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Update state when workspace data loads
  useEffect(() => {
    if (workspace?.name) {
      setWorkspaceTitle(workspace.name);
    }
  }, [workspace?.name]);

  const handleTitleUpdate = async (newTitle?: string) => {
    const titleToUpdate = newTitle || workspaceTitle;
    if (!titleToUpdate.trim() || !workspace?._id) return;

    try {
      await updateWorkspace({
        id: workspace._id,
        name: titleToUpdate.trim()
      });
      // Update local state to match server
      setWorkspaceTitle(titleToUpdate.trim());
    } catch (error) {
      console.error("Failed to update workspace:", error);
      // Revert to original title on error
      setWorkspaceTitle(workspace.name);
    }
  };

  // Fetch recent documents and work items
  const recentDocs = useQuery(api.knowledgeBase.getRecent, { limit: 3 });
  const recentWorkItems = useQuery(api.workItems.getRecent, { limit: 3 });

  return (
    <div className="bg-white rounded-lg w-full h-full flex flex-col px-12">
      {isGenerating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={generationProgress} className="h-1" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 pt-10">
        {/* Workspace Title */}
        <div className="mb-10 flex items-center gap-2">
          <Command className="h-6 w-6 text-muted-foreground" />
          <LabelToInput
            value={workspaceTitle}
            setValue={setWorkspaceTitle}
            onBlur={() => handleTitleUpdate()}
            onEnter={(value: string) => handleTitleUpdate(value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Knowledge Base Section */}
          <section className="bg-slate-100 p-6 rounded-lg pb-12">
            <div className="flex items-center justify-between pb-10">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Knowledge Base</h2>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="bg-black text-white hover:bg-black/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    New Document
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File/Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {!recentDocs?.length ? (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon>
                  <FileText className="h-8 w-8" />
                </EmptyPlaceholder.Icon>
                <EmptyPlaceholder.Title>No documents yet</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Create your first document or generate one with AI.
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            ) : (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentDocs?.map((doc) => (
                    <Card key={doc._id} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <h3 className="font-medium truncate">{doc.title}</h3>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                        Last edited {new Date(Number(doc.updatedAt)).toLocaleDateString()}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Work Items Section */}
          <section className="bg-slate-100 p-6 rounded-lg pb-12">
            <div className="flex items-center justify-between pb-10">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Work Items</h2>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="bg-black text-white hover:bg-black/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    New Work Item
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Work Items
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {!recentWorkItems?.length ? (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon>
                  <FolderKanban className="h-8 w-8" />
                </EmptyPlaceholder.Icon>
                <EmptyPlaceholder.Title>No work items yet</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Create your first work item or generate one with AI.
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            ) : (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent work items</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentWorkItems?.map((item) => (
                    <Card key={item._id} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="h-4 w-4" />
                          <h3 className="font-medium truncate">{item.title}</h3>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Type: {item.type}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                        Last edited {new Date(Number(item.updatedAt)).toLocaleDateString()}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { Button } from "@/components/ui/button";
import LexicalEditor from "@/app/(main)/_components/Lexical/LexicalEditor";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, EditIcon, Save, Sparkles, FileText } from "lucide-react";
import LabelToInput from "@/app/(main)/_components/LabelToInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "@/components/ui/toast";
import { toast } from "sonner";

export default function NewTemplatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState<'ai' | 'description'>('description');
  const [description, setDescription] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const createTemplate = useMutation(api.templates.createTemplate);
  const updateTemplate = useMutation(api.templates.updateTemplate);
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const workspaceId = workspaces?.[0]?._id;

  const handleSave = async () => {
    if (!workspaceId || isLoading) return;
    
    setIsLoading(true);
    try {
      const newTemplate = await createTemplate({
        workspaceId,
        title,
        type: "custom",
        content,
        aiPrompt: "",
        metadata: {
          description: "",
          tags: [],
          version: "1.0.0",
          useCount: 0,
          category: "custom",
          status: "draft",
        }
      });
      
      setSavedTemplateId(newTemplate);
      setShowDialog(true);
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!savedTemplateId) return;

    try {
      await updateTemplate({
        templateId: savedTemplateId as Id<"templates">,
        metadata: {
          description,
          tags: [],
          version: "1.0.0",
          useCount: 0,
          category: "custom",
          status: "draft",
        }
      });
      setDialogStep('ai');
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };

  const handleAiPromptSave = async () => {
    if (!savedTemplateId) return;

    try {
      await updateTemplate({
        templateId: savedTemplateId as Id<"templates">,
        aiPrompt,
      });
      
      toast.success("Template created successfully");
      
      router.push('/knowledge-base/templates?tab=personal');
    } catch (error) {
      console.error("Error updating template with AI prompt:", error);
      toast.error("Error saving template");
    }
  };

  const handleSkip = () => {
    if (dialogStep === 'description') {
      setDialogStep('ai');
    } else {
      toast.success("Template created successfully");
      router.push('/knowledge-base/templates?tab=personal');
    }
  };

  if (!workspaces) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/knowledge-base/templates')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <LabelToInput
              value={title}
              setValue={setTitle}
              onBlur={() => {}}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={!title.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border-t border-gray-200 p-6">
          <div className="h-full">
            <LexicalEditor
              onBlur={async () => {}}
              attribute="content"
              documentDetails={{ content }}
              setDocumentDetails={(value) => setContent(value)}
              isRichText={true}
              context="document"
              itemId="new"
              showTableOfContents={false}
            />
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          {dialogStep === 'description' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Add Template Description
                </DialogTitle>
                <DialogDescription>
                  Add a brief description to help users understand the purpose of this template.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Enter a description for your template..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={handleNext} disabled={!description.trim()}>
                  Next
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Add AI Guidelines
                </DialogTitle>
                <DialogDescription>
                  Add guidelines for the AI assistant to help users work with this template.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  className="min-h-[200px]"
                  placeholder="Example: This template is for writing user stories..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={handleAiPromptSave} disabled={!aiPrompt.trim()}>
                  Save Guidelines
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 
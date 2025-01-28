'use client';

import { Button } from "@/components/ui/button";
import LexicalEditor from "@/app/(main)/_components/Lexical/LexicalEditor";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import LabelToInput from "@/app/(main)/_components/LabelToInput";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const template = useQuery(api.templates.getTemplate, { 
    templateId: params?.templateId as Id<"templates">
  });
  const updateTemplate = useMutation(api.templates.updateTemplate);

  // Load template data
  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setContent(template.content);
    }
  }, [template]);

  const handleSave = async () => {
    if (!template || isLoading) return;
    
    setIsLoading(true);
    try {
      await updateTemplate({
        templateId: template._id,
        title,
        content,
        metadata: template.metadata,
      });
      
      toast.success("Template updated successfully");
      router.push('/knowledge-base/templates?tab=personal');
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Error updating template");
    } finally {
      setIsLoading(false);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/knowledge-base/templates?tab=personal')}
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
            itemId={params?.templateId as string}
            showTableOfContents={false}
          />
        </div>
      </div>
    </div>
  );
} 
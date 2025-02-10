'use client'

import { PatternCard, PatternCardBody } from '@/components/ui/templates/PatternCard'
import { Button } from '@/components/ui/button'
import { PlusCircle, Eye, Plus, Trash2, MoreVertical, Edit } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TemplateGridProps {
  workspaceId: Id<"workspaces">;
  templateSource: 'system' | 'personal';
  type?: "epic" | "feature" | "prd" | "funcReq" | "useCase" | "userStory" | "custom" | "srs" | "techSpec" | "testPlan" | "releaseNotes";
  layout?: 'grid' | 'list';
  columns?: number;
}

export function TemplateGrid({ 
  workspaceId, 
  type, 
  templateSource, 
  layout = 'grid',
  columns = 4 
}: TemplateGridProps) {
  // 1. All useContext hooks
  const router = useRouter();

  // 2. All useState hooks
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);

  // 3. All useQuery/useMutation hooks
  const systemTemplates = useQuery(api.templates.getSystemTemplates,
    templateSource === 'system' ? {} : { type }
  );
  const workspaceTemplates = workspaceId ? useQuery(api.templates.getWorkspaceTemplates, {
    workspaceId,
    type: type as any
  }) : null;
  const createDocument = useMutation(api.documents.createDocument);
  const createBlankTemplate = useMutation(api.templates.createBlankTemplate);
  const deleteTemplate = useMutation(api.templates.deleteTemplate);

  // 4. All useMemo/useCallback hooks
  const handleCreateTemplate = useCallback(() => {
    router.push(`/w/${workspaceId}/knowledge-base/templates/new-template`);
  }, [router]);

  const handleDeleteTemplate = useCallback(async (templateId: Id<"templates">) => {
    try {
      await deleteTemplate({
        templateId,
        workspaceId,
      });
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  }, [deleteTemplate, workspaceId]);

  const handleUseTemplate = async (template: any) => {
    try {
      const newDoc = await createDocument({
        workspaceId,
        title: `New ${template.type}: ${new Date().toLocaleDateString()}`,
        content: template.content,
        type: template.type as any,
        metadata: {
          description: template.description,
          tags: ["template-generated"],
        }
      });

      router.push(`/w/${workspaceId}/knowledge-base/documents/${newDoc}`);
    } catch (error) {
      console.error("Error creating document from template:", error);
    }
  };

  const handleCreateBlankTemplate = async () => {
    try {
      const newTemplate = await createBlankTemplate({
        workspaceId,
      });
      router.push(`/w/${workspaceId}/knowledge-base/templates/${newTemplate}`);
    } catch (error) {
      console.error("Error creating blank template:", error);
    }
  };

  const getGridColumns = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  const TemplateCard = ({ template }: { template: any }) => (
    <PatternCard key={template._id} className="h-[220px]">
      <PatternCardBody className="flex flex-col justify-between h-full p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium truncate flex-1 pr-2">{template.title}</h3>
            {!template.isSystemTemplate && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2" align="end">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => router.push(`/w/${workspaceId}/knowledge-base/templates/${template._id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setTemplateToDelete(template)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {template.metadata?.description || "No description"}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => setPreviewTemplate(template)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => handleUseTemplate(template)}
          >
            Use
          </Button>
        </div>
      </PatternCardBody>
    </PatternCard>
  );

  if (templateSource === 'system' && !systemTemplates) {
    return <div>Loading system templates...</div>;
  }

  if (templateSource === 'personal' && !workspaceTemplates) {
    return <div>Loading personal templates...</div>;
  }

  return (
    <>
      <div className={`${layout === 'grid'
        ? `grid ${getGridColumns()} gap-4`
        : 'space-y-4'
        }`}>
        {templateSource === 'system' ? (
          systemTemplates?.length ? (
            systemTemplates.map((template) => (
              <TemplateCard key={template._id} template={template} />
            ))
          ) : (
            <div>No system templates found</div>
          )
        ) : (
          <>
            {!workspaceId ? (
              <div>Loading workspace...</div>
            ) : !workspaceTemplates ? (
              <div>Loading personal templates...</div>
            ) : (
              <>
                {workspaceTemplates.map((template) => (
                  <TemplateCard key={template._id} template={template} />
                ))}
                <PatternCard className="h-full border-dashed">
                  <PatternCardBody className="flex flex-col items-center justify-center h-full">
                    <PlusCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <Button
                      variant="outline"
                      onClick={handleCreateTemplate}
                    >
                      Create New Template
                    </Button>
                  </PatternCardBody>
                </PatternCard>
              </>
            )}
          </>
        )}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ReactMarkdown
              className="text-sm leading-relaxed break-words overflow-hidden max-w-full"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mb-6 border-b pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold mb-4 mt-6" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mb-3 mt-4" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-lg font-medium mb-2 mt-4" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-gray-600 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-gray-100 text-pink-500 px-1 py-0.5 rounded text-sm" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-4" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="overflow-x-auto max-w-full p-4 bg-gray-100 rounded-lg mb-4" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto max-w-full my-4">
                    <table className="min-w-full divide-y divide-gray-200 border" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-50" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="bg-white divide-y divide-gray-200" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-gray-50 transition-colors" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" {...props} />
                ),
              }}
            >
              {previewTemplate?.content || ''}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteTemplate(templateToDelete._id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


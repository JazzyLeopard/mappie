"use client"

import { Suspense, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileIcon, Undo2 } from "lucide-react";

function TrashContent() {
  const params = useParams();
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const trashedItems = useQuery(
    api.documents.getTrashItems,
    workspaceId ? { workspaceId } : "skip"
  );
  const restoreDocument = useMutation(api.documents.restoreFromTrash);

  useEffect(() => {
    // Get workspaceId from route params instead of search params
    const rawWorkspaceId = params?.workspaceId;
    if (rawWorkspaceId && typeof rawWorkspaceId === 'string') {
      setWorkspaceId(rawWorkspaceId as Id<"workspaces">);
    }
  }, [params]);

  if (!workspaceId) {
    return (
      <div className="p-6">
        <span className="text-muted-foreground">
          No workspace ID provided
        </span>
      </div>
    );
  }

  const handleRestore = async (documentId: Id<"knowledgeBase">) => {
    try {
      await restoreDocument({ documentId });
      console.log("Document restored successfully:", documentId);
    } catch (error) {
      console.error("Failed to restore document:", error);
    }
  };

  if (trashedItems === undefined) {
    return (
      <div className="p-6">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trash</h1>
        <p className="text-sm text-muted-foreground">
          Items in trash will be permanently deleted after 30 days
        </p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deleted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trashedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <span className="text-muted-foreground">
                    No items in trash
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              trashedItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    {item.title}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.type}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(Number(item.deletedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(item._id)}
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function TrashPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    }>
      <TrashContent />
    </Suspense>
  );
} 
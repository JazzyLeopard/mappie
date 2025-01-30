"use client"

import { formatDistanceToNow } from "date-fns"
import { FileIcon, MoreVertical, Trash } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Id } from "@/convex/_generated/dataModel"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface Document {
  _id: Id<"knowledgeBase">
  title: string
  createdAt: number | bigint
  updatedAt: number | bigint
  type: string
}

interface DocumentListProps {
  documents: Document[]
  onSelect: (id: Id<"knowledgeBase">) => void
  showFilter?: boolean
  showHeader?: boolean
  title?: string
  variant?: 'documents' | 'uploads'
  onUpload?: () => void
  onNewDocument?: () => void
}

export function DocumentList({ 
  documents, 
  onSelect, 
  showFilter = false,
  showHeader = false,
  title = "Documents",
  variant = 'uploads',
  onUpload,
  onNewDocument
}: DocumentListProps) {
  const [fileType, setFileType] = useState<string>("all");
  const router = useRouter();
  const deleteDocument = useMutation(api.documents.deleteDocument);
  const moveToTrash = useMutation(api.documents.moveToTrash);

  const filteredDocuments = documents?.filter(doc => 
    fileType === "all" ? true : doc.type === fileType
  );

  const handleDelete = async (documentId: Id<"knowledgeBase">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await moveToTrash({ documentId });
      console.log("Document moved to trash:", documentId);
    } catch (error) {
      console.error("Failed to move document to trash:", error);
    }
  };

  const renderActionButton = () => {
    if (variant === 'documents') {
      return (
        <Button onClick={onNewDocument}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Document
        </Button>
      );
    }
    return (
      <Button onClick={onUpload}>
        <Upload className="h-4 w-4 mr-2" />
        Upload File
      </Button>
    );
  };

  if (!documents) {
    return (
      <div className="w-full border rounded-md p-8 text-center">
        <span className="text-muted-foreground">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            {showFilter && variant === 'uploads' && (
              <Select
                value={fileType}
                onValueChange={setFileType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                </SelectContent>
              </Select>
            )}
            {renderActionButton()}
          </div>
        </div>
      )}

      <div className="w-full border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last modified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-muted-foreground">
                    No documents found.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => (
                <TableRow 
                  key={document._id}
                  className="cursor-pointer items-center  hover:bg-muted/50"
                  onClick={() => onSelect(document._id)}
                >
                  <TableCell className="flex items-center gap-2 p-6">
                    <FileIcon className="h-4 w-4" />
                    {document.title}
                  </TableCell>
                  <TableCell className="capitalize">
                    {document.type}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(Number(document.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(Number(document.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => handleDelete(document._id, e)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area-1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Image } from "lucide-react";
import { DocumentList } from "../knowledge-base/document-list";
import { useRouter, usePathname } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface CircleTabsNavProps {
  documents: any[];
  workspaces: any[];
  uploads?: any[];
  images?: any[];
}

function CircleTabsNav({ documents, workspaces, uploads = [], images = [] }: CircleTabsNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get the current tab from the pathname
  const currentTab = pathname?.includes('/uploads') 
    ? 'uploads' 
    : pathname?.includes('/images') 
      ? 'images' 
      : 'documents';

  const handleTabChange = (value: string) => {
    router.push(`/knowledge-base/${value}`);
  };
  
  return (
    <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
      <ScrollArea>
        <TabsList className="mb-3 gap-1 bg-transparent">
          <TabsTrigger value="documents">
            <FileText className="-ms-0.5 me-1.5 opacity-60" size={16} />
            Documents
          </TabsTrigger>
          <TabsTrigger value="uploads">
            <Upload className="-ms-0.5 me-1.5 opacity-60" size={16} />
            Uploads
          </TabsTrigger>
          <TabsTrigger value="images">
            <Image className="-ms-0.5 me-1.5 opacity-60" size={16} />
            Images
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="documents">
        <DocumentList 
          documents={documents || []}
          onSelect={(id) => router.push(`/knowledge-base/documents/${id}?workspace=${workspaces?.[0]?._id}`)}
        />
      </TabsContent>
      <TabsContent value="uploads">
        <p className="text-sm text-muted-foreground">Uploads content coming soon...</p>
      </TabsContent>
      <TabsContent value="images">
        <p className="text-sm text-muted-foreground">Images content coming soon...</p>
      </TabsContent>
    </Tabs>
  );
}

export { CircleTabsNav };
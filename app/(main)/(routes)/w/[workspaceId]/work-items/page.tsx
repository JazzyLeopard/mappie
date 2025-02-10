"use client";

import LexicalEditor from "@/app/(main)/_components/Lexical/LexicalEditor";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area-1";
import { AddWorkItemButton, WorkItemNavigator } from "@/components/work-item-tree/WorkItemNavigator";
import { EmptyWorkItems } from "@/components/work-items/EmptyWorkItems";
import { WorkItemCreationDialog } from "@/components/work-items/WorkItemCreationDialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, PanelLeftOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import LabelToInput from "../../../../_components/LabelToInput";

type WorkItemType = "epic" | "feature" | "story" | "task";

type WorkItem = {
  id: Id<"workItems">;
  name: string;
  type: WorkItemType;
  items: WorkItem[];
  order: number;
  parentId?: Id<"workItems">;
};

interface WorkItemsPageProps {
  params: Promise<{
    workspaceId: Id<"workspaces">
  }>
}

export default function WorkItemsPage({ params }: WorkItemsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null)
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreatingWorkItem, setIsCreatingWorkItem] = useState(false)
  const [creationParentItem, setCreationParentItem] = useState<WorkItem | null>(null)

  const createWorkItem = useMutation(api.workItems.createWorkItem);
  const updateWorkItem = useMutation(api.workItems.updateWorkItem);
  const deleteWorkItem = useMutation(api.workItems.deleteWorkItem);
  const updateWorkItemContent = useMutation(api.workItems.update);

  const workItemId = searchParams?.get('id');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;

      setWorkspaceId(resolvedParams.workspaceId);
    };
    resolveParams();
  }, [params]);

  const workItems = useQuery(api.workItems.getWorkItems, {
    workspaceId: workspaceId as Id<"workspaces">
  });

  const workItemDetails = useQuery(
    api.workItems.get,
    selectedItem ? { id: selectedItem.id as Id<"workItems"> } : "skip"
  );

  // Add loading states
  const [isLoading, setIsLoading] = useState(true);

  // Reset content when switching items and update when details load
  useEffect(() => {
    if (workItemDetails?.description) {
      setContent(workItemDetails.description);
    } else {
      setContent("");
    }
  }, [workItemDetails]);

  // Update selected item from URL
  useEffect(() => {
    if (workItemId && workItems) {
      const item = workItems.find(item => item._id === workItemId);
      if (item) {
        setSelectedItem({
          id: item._id,
          name: item.title,
          type: item.type,
          items: [],
          order: item.order,
          parentId: item.parentId
        });
      }
    }
  }, [workItemId, workItems]);

  // Handle initial loading
  useEffect(() => {
    if (workspaces !== undefined && workItems !== undefined) {
      setIsLoading(false);
    }
  }, [workspaces, workItems]);

  // Update the effect that handles deletion detection
  useEffect(() => {
    if (selectedItem && workItemDetails === null) {
      setSelectedItem(null);
      
      // If we have the workspace ID, use it in the navigation
      if (workspaceId) {
        router.push(`/w/${workspaceId}/work-items`);
      }
    }
  }, [workItemDetails, selectedItem, router, workspaceId]);

  const handleStartCreation = async (workItem?: any) => {
    if (!workspaceId) {
      toast.error("No workspace selected")
      return
    }

    try {
      const newItem = await createWorkItem({
        workspaceId: workspaceId,
        type: workItem.type,
        title: workItem.title,
        description: workItem.description || "",
        status: "todo",
      })

      // Select the newly created item to open the editor view
      setSelectedItem({
        id: newItem,
        name: workItem.title,
        type: workItem.type,
        items: [],
        order: 0,
        parentId: workItem.parentId
      })

      toast.success("Work item created")
    } catch (error) {
      toast.error("Failed to create work item")
    }
  }

  const handleAddWorkItem = useCallback((parentItem?: WorkItem) => {
    setCreationParentItem(parentItem || null)
    setIsCreatingWorkItem(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsCreatingWorkItem(false)
    setCreationParentItem(null)
  }, [])

  const handleRenameWorkItem = useCallback(async (item: WorkItem, newName: string) => {
    try {
      await updateWorkItem({
        id: item.id as Id<"workItems">,
        title: newName,
      });
      toast.success("Renamed work item");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to rename work item");
      }
      console.error(error);
    }
  }, [updateWorkItem]);

  const handleUpdateParent = useCallback(async (itemId: Id<"workItems">, newParentId: Id<"workItems"> | undefined) => {
    try {
      await updateWorkItem({
        id: itemId,
        parentId: newParentId
      });
      toast.success("Parent updated successfully");
    } catch (error) {
      console.error("Error updating parent:", error);
      toast.error("Failed to update parent");
    }
  }, [updateWorkItem]);

  const handleMoveToTrash = useCallback(async (item: WorkItem) => {
    try {
      // Check if item has children
      if (item.items && item.items.length > 0) {
        toast.error(
          "This item has child items. Please unlink or delete the child items first.",
          {
            duration: 4000,
            icon: '⚠️'
          }
        );
        return;
      }

      await deleteWorkItem({
        id: item.id as Id<"workItems">,
      });

      // If the deleted item was selected, clear selection and navigate properly
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
        
        // If item has a parent, navigate to parent
        if (item.parentId) {
          router.push(`/w/${workspaceId}/work-items?id=${item.parentId}`);
        } else {
          // Otherwise, go to workspace root
          router.push(`/w/${workspaceId}/work-items`);
        }
      }

      toast.success("Moved work item to trash");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete work item");
      }
      console.error(error);
    }
  }, [deleteWorkItem, selectedItem, router, workspaceId]);

  const buildWorkItemTree = useCallback((items: any[]) => {
    if (!items || !Array.isArray(items)) return [];
    
    console.log('Raw items:', items); // Debug log

    // Create a map of parent IDs to their children
    const childrenMap = new Map<string, any[]>();
    const rootItems: WorkItem[] = [];

    // First, group all items by their parentId
    items.forEach(item => {
      if (!item?._id) {
        console.warn('Item without _id found:', item);
        return;
      }
      
      // Validate required fields
      if (!item.title || !item.type) {
        console.warn('Item missing required fields:', item);
        return;
      }
      
      const parentId = item.parentId?.toString();
      if (parentId) {
        // Validate that parent exists
        const parentExists = items.some(i => i._id === parentId);
        if (!parentExists) {
          console.warn('Item references non-existent parent:', item);
          return;
        }

        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)?.push(item);
      }
    });

    // Function to create a WorkItem with its children
    const createWorkItem = (item: any): WorkItem => {
      const children = childrenMap.get(item._id) || [];
      
      // Deduplicate children array
      const uniqueChildren = children.filter((child, index, self) =>
        index === self.findIndex((t) => t._id === child._id)
      );
      
      const workItem: WorkItem = {
        id: item._id,
        name: item.title || 'Untitled',
        type: item.type,
        items: uniqueChildren
          .sort((a, b) => a.order - b.order)
          .map(child => createWorkItem(child))
          .filter(Boolean), // Remove any null/undefined items
        order: typeof item.order === 'number' ? item.order : 0,
        parentId: item.parentId,
      };

      console.log('Created work item:', {
        id: workItem.id,
        name: workItem.name,
        childCount: workItem.items.length,
        childIds: workItem.items.map(i => i.id)
      });

      return workItem;
    };

    // Create root items (items without parents)
    const rootItemsTemp = items
      .filter(item => !item.parentId)
      .sort((a, b) => a.order - b.order)
      .map(item => createWorkItem(item))
      .filter(Boolean); // Remove any null/undefined items

    rootItems.push(...rootItemsTemp);

    console.log('Built work item tree:', {
      rootItems,
      itemCount: items.length,
      rootCount: rootItems.length,
      childrenMapSize: childrenMap.size,
      childrenMapContents: Array.from(childrenMap.entries())
    });

    return rootItems;
  }, []);

  const workItemTree = useMemo(() => {
    return buildWorkItemTree(workItems || []);
  }, [workItems, buildWorkItemTree]);

  // Reset selected item when there are no items
  useEffect(() => {
    if (workItemTree.length === 0) {
      setSelectedItem(null);
    }
  }, [workItemTree]);

  const handleToggleExpand = useCallback(() => {
    setSelectedItem(null);
    setIsExpanded(!isExpanded);
    // Clear the URL when collapsing/expanding
    if (workspaceId) {
      router.push(`/w/${workspaceId}/work-items`);
    }
  }, [isExpanded, workspaceId, router]);

  const handleCreateWorkItem = async (workItem: any) => {
    if (!workspaceId) {
      toast.error("No workspace selected");
      return;
    }

    try {
      console.log('Creating work item:', workItem); // Debug log

      const newItemId = await createWorkItem({
        workspaceId: workspaceId,
        parentId: workItem.parentId ? (workItem.parentId as Id<"workItems">) : undefined,
        type: workItem.type,
        title: workItem.title || 'Untitled',
        description: workItem.description || "",
        status: "todo",
      });

      setIsCreatingWorkItem(false);

      const newItem: WorkItem = {
        id: newItemId,
        name: workItem.title || 'Untitled',
        type: workItem.type,
        items: [], // Initialize with empty array
        order: 0,
        parentId: workItem.parentId
      };

      console.log('Created new item:', newItem); // Debug log

      setSelectedItem(newItem);
      router.push(`/w/${workspaceId}/work-items?id=${newItemId}`);
      toast.success("Work item created");
    } catch (error) {
      console.error("Error creating work item:", error);
      toast.error("Failed to create work item");
    }
  };

  // Add handler for editor changes
  const handleEditorChange = useCallback(async (value: string) => {
    if (!selectedItem?.id) return;

    try {
      setContent(value); // Update local state first
      await updateWorkItemContent({
        id: selectedItem.id as Id<"workItems">,
        description: value
      });
    } catch (error) {
      console.error("Failed to update work item content:", error);
      toast.error("Failed to save changes");
    }
  }, [selectedItem?.id, updateWorkItemContent]);

  // Update URL when selected item changes
  const handleSelectItem = useCallback(async (item: WorkItem | null) => {
    setContent("");
    setSelectedItem(item);
    
    if (item) {
      router.push(`/w/${workspaceId}/work-items?id=${item.id}`);
    } else {
      // If no item is selected, remove the id from the URL
      router.push(`/w/${workspaceId}/work-items`);
    }
  }, [router, workspaceId]);

  // Separate effect for content updates to avoid race conditions
  useEffect(() => {
    if (!selectedItem) {
      setContent("");
      return;
    }

    if (workItemDetails?.description) {
      // Only update if content is different to avoid unnecessary rerenders
      if (content !== workItemDetails.description) {
        setContent(workItemDetails.description);
      }
    } else {
      setContent("");
    }
  }, [selectedItem, workItemDetails?.description]);

  // Clear URL when deselecting
  const handleDeselectItem = useCallback(() => {
    setSelectedItem(null);
    router.push('/work-items');
  }, [router]);

  const handleReorder = useCallback(async (
    draggedItemId: Id<"workItems">, 
    targetParentId: Id<"workItems"> | undefined, 
    newOrder: number
  ) => {
    try {
      await updateWorkItem({
        id: draggedItemId,
        parentId: targetParentId,
        order: newOrder
      });
    } catch (error) {
      console.error("Error moving work item:", error);
      toast.error("Failed to move work item");
    }
  }, [updateWorkItem]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination || !workItems) return;

    try {
      const draggedItem = workItems.find(item => item._id === draggableId);
      if (!draggedItem) return;

      const newParentId = destination.droppableId === "root" ? undefined : destination.droppableId;

      const BASE_ORDER = 1000;
      const MIN_GAP = 100;

      // Get all items at the destination level, sorted by order
      const itemsInDestination = workItems
        .filter(item =>
          (newParentId ? item.parentId === newParentId : !item.parentId) &&
          item._id !== draggableId
        )
        .sort((a, b) => a.order - b.order);

      // Normalize orders if they're too close together or if there are duplicates
      const needsNormalization = itemsInDestination.some((item, index) =>
        index > 0 && (
          item.order === itemsInDestination[index - 1].order ||
          item.order - itemsInDestination[index - 1].order < MIN_GAP
        )
      );

      if (needsNormalization) {
        // Normalize all orders first
        await Promise.all(itemsInDestination.map((item, index) =>
          updateWorkItem({
            id: item._id as Id<"workItems">,
            order: (index + 1) * BASE_ORDER
          })
        ));

        // Refresh itemsInDestination with new orders
        itemsInDestination.forEach((item, index) => {
          item.order = (index + 1) * BASE_ORDER;
        });
      }

      // Calculate new order
      let newOrder: number;
      if (itemsInDestination.length === 0) {
        newOrder = BASE_ORDER;
      } else if (destination.index === 0) {
        newOrder = itemsInDestination[0].order - BASE_ORDER;
      } else if (destination.index >= itemsInDestination.length) {
        newOrder = itemsInDestination[itemsInDestination.length - 1].order + BASE_ORDER;
      } else {
        const prevOrder = itemsInDestination[destination.index - 1].order;
        const nextOrder = itemsInDestination[destination.index].order;
        newOrder = prevOrder + Math.floor((nextOrder - prevOrder) / 2);
      }

      await updateWorkItem({
        id: draggableId as Id<"workItems">,
        parentId: newParentId as Id<"workItems"> | undefined,
        order: newOrder
      });

    } catch (error) {
      console.error("Error moving work item:", error);
      toast.error("Failed to move work item");
    }
  }, [workItems, updateWorkItem]);

  // When showing the expanded view (no item selected), we should still highlight the item from URL
  const urlSelectedItemId = searchParams?.get('id');

  // Early return with loading spinner if data isn't ready
  if (isLoading || !workspaces) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // If no workspace items exist yet, show empty state
  if (workItems?.length === 0) {
    return (
      <div className="h-full p-4">
        <EmptyWorkItems onCreateNew={handleStartCreation} />
      </div>
    );
  }

  // If no items exist or no item is selected, show expanded view
  if (workItemTree.length === 0 || !selectedItem) {
    return (
      <>
        <div
          className="px-3 pb-3 pt-2 h-full w-full"
        >
            <div className="flex flex-row justify-between">
              <h2 className="text-sm p-1 pb-4 font-semibold">Work Items</h2>
            </div>
            <div className="space-y-0.5">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="root">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-0.5"
                    >
                      {workItemTree.map((item, index) => (
                        <WorkItemNavigator
                          key={item.id}
                          item={item}
                          index={index}
                          parentId="root"
                          onSelect={handleSelectItem}
                          onRename={handleRenameWorkItem}
                          onMoveToTrash={handleMoveToTrash}
                          onAddItem={handleAddWorkItem}
                          selectedItemId={urlSelectedItemId ? (urlSelectedItemId as Id<"workItems">) : undefined}
                          onReorder={handleReorder}
                          isExpanded={true}
                          onUpdateParent={handleUpdateParent}
                          availableParents={workItems?.map(transformToWorkItem)}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <AddWorkItemButton onAddItem={() => setIsCreatingWorkItem(true)} />
              </DragDropContext>
          </div>
        </div>

        <WorkItemCreationDialog
          isOpen={isCreatingWorkItem}
          onClose={handleCloseDialog}
          onCreateWorkItem={handleCreateWorkItem}
          parentItem={creationParentItem ? {
            id: creationParentItem.id,
            type: creationParentItem.type
          } : undefined}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="h-full w-full flex flex-col"
      >
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} className="pl-3 pr-2 pb-3 pt-2">
            <div className="h-full rounded-lg p-2 bg-slate-100">
              <div className="flex flex-row justify-between">
                <h2 className="text-sm p-1 pb-4 font-semibold">Work Items</h2>
                <div className="flex flex-row gap-1">
                  <Button
                    variant="ghost"
                    onClick={handleToggleExpand}
                    className="text-xs text-slate-200 h-8 py-2 px-1 hover:bg-white hover:text-slate-800"
                  >
                    <PanelLeftOpen className="text-slate-500 hover:text-slate-800" />
                  </Button>
                </div>
              </div>
              <div className="h-full">
                <div>
                  {workItemTree.map((item, index) => (
                    <WorkItemNavigator
                      key={item.id}
                      item={item}
                      index={index}
                      parentId="root"
                      onSelect={handleSelectItem}
                      onRename={handleRenameWorkItem}
                      onMoveToTrash={handleMoveToTrash}
                      onAddItem={handleAddWorkItem}
                      selectedItemId={selectedItem?.id}
                      onReorder={handleReorder}
                      isExpanded={isExpanded}
                      onUpdateParent={handleUpdateParent}
                      availableParents={workItems?.map(transformToWorkItem)}
                    />
                  ))}
                </div>
                <AddWorkItemButton onAddItem={() => setIsCreatingWorkItem(true)} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30} className="h-full pt-2 pb-3 mr-2 mb-2">
            <div className="flex flex-col h-full border border-slate-100 rounded-lg z-10">
              <div className="flex-none px-3 pb-2 pt-2 border-b border-slate-100">
                <LabelToInput
                  value={selectedItem?.name || ""}
                  setValue={(newName) => handleRenameWorkItem(selectedItem, newName)}
                  onBlur={() => { }}
                  variant="workitem"
                />
              </div>
              <ScrollArea className="flex-1 px-3 pb-3 pt-2">
                {workItemDetails ? (
                  <LexicalEditor
                    key={selectedItem.id}
                    onBlur={async () => { }}
                    attribute="description"
                    documentDetails={{ description: content }}
                    setDocumentDetails={(value) => {
                      setContent(value);
                      handleEditorChange(value);
                    }}
                    isRichText={true}
                    context="document"
                    itemId={selectedItem.id}
                    showTableOfContents={false}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <WorkItemCreationDialog
        isOpen={isCreatingWorkItem}
        onClose={handleCloseDialog}
        onCreateWorkItem={handleCreateWorkItem}
        parentItem={creationParentItem ? {
          id: creationParentItem.id,
          type: creationParentItem.type
        } : undefined}
      />
    </>
  );
}

const transformToWorkItem = (item: any): WorkItem => ({
  id: item._id,
  name: item.title,
  type: item.type,
  items: [],
  order: item.order,
  parentId: item.parentId
});


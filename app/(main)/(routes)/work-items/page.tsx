"use client";

import { WorkItemNavigator } from "@/components/work-item-tree/WorkItemNavigator";
import LexicalEditor from "@/app/(main)/_components/Lexical/LexicalEditor";
import AIChat from "@/ai/ai-chat";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PlusIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { toast } from "react-hot-toast";
import { api } from "@/convex/_generated/api";
import { WorkItemCreationDialog } from "@/components/work-items/WorkItemCreationDialog"
import { EmptyWorkItems } from "@/components/work-items/EmptyWorkItems"
import { AddWorkItemButton } from "@/components/work-item-tree/WorkItemNavigator"
import { useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item } from "yjs";
import LabelToInput from "../../_components/LabelToInput";
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { isValidDropTarget } from '@/components/work-items/WorkItemHierarchy';

type WorkItemType = "epic" | "feature" | "story" | "task";

type WorkItem = {
  id: string;
  name: string;
  type: WorkItemType;
  items?: WorkItem[];
  order: number;
  parentId?: string;
};

export default function WorkItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const workspace = workspaces?.[0];
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

  const workItems = useQuery(
    api.workItems.getWorkItems, 
    workspace ? { workspaceId: workspace._id } : "skip"
  );
  
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

  // Add this effect to clear selection if item is deleted
  useEffect(() => {
    if (selectedItem && workItemDetails === null) {
      setSelectedItem(null)
      router.push('/work-items')
    }
  }, [workItemDetails, selectedItem, router])

  const handleStartCreation = async (workItem?: any) => {
    if (!workspace?._id) {
      toast.error("No workspace selected")
      return
    }

    try {
      const newItem = await createWorkItem({
        workspaceId: workspace._id,
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

  const handleMoveToTrash = useCallback(async (item: WorkItem) => {
    try {
      await deleteWorkItem({
        id: item.id as Id<"workItems">,
      });
      
      // If the deleted item was selected, clear selection first
      if (selectedItem?.id === item.id) {
        setSelectedItem(null)
        router.push('/work-items')
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
  }, [deleteWorkItem, selectedItem, router]);

  const buildWorkItemTree = useCallback((items: any[]) => {
    const itemMap = new Map();
    const rootItems: WorkItem[] = [];

    items?.forEach(item => {
      itemMap.set(item._id, {
        id: item._id,
        name: item.title,
        type: item.type,
        items: [],
        order: item.order,
        parentId: item.parentId,
      });
    });

    items?.forEach(item => {
      const workItem = itemMap.get(item._id);
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.items.push(workItem);
        }
      } else {
        rootItems.push(workItem);
      }
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

  const handleToggleExpand = () => {
    setSelectedItem(null);
    setIsExpanded(!isExpanded);
  };

  const handleCreateWorkItem = async (workItem: any) => {
    if (!workspace?._id) {
      toast.error("No workspace selected");
      return;
    }

    try {
      console.log("Creating work item with full details:", {
        workspaceId: workspace._id,
        parentId: workItem.parentId,
        type: workItem.type,
        title: workItem.title,
        description: workItem.description,
        status: "todo"
      });

      const newItemId = await createWorkItem({
        workspaceId: workspace._id,
        parentId: workItem.parentId ? (workItem.parentId as Id<"workItems">) : undefined,
        type: workItem.type,
        title: workItem.title,
        description: workItem.description || "",
        status: "todo",
      });
      
      setIsCreatingWorkItem(false);
      
      // Create the new item object
      const newItem = {
        id: newItemId,
        name: workItem.title,
        type: workItem.type
      };
      
      // Select the newly created item
      setSelectedItem({
        id: newItemId,
        name: workItem.title,
        type: workItem.type,
        order: 0,
        parentId: workItem.parentId
      });
      
      // Update URL to show the new item
      router.push(`/work-items?id=${newItemId}`);
      
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
  const handleSelectItem = useCallback((item: WorkItem) => {
    // Reset content before setting new selected item
    setContent("");
    setSelectedItem(item);
    router.push(`/work-items?id=${item.id}`);
  }, [router]);

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

  const handleReorder = async (itemId: string, newParentId: string, newOrder: number) => {
    try {
      await updateWorkItem({
        id: itemId as Id<"workItems">,
        parentId: newParentId === "root" ? undefined : newParentId as Id<"workItems">,
        order: newOrder
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to reorder item");
    }
  };

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
  if (isLoading || !workspace) {
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
        <motion.div 
          initial={{ width: "20%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1]
          }}
          className="px-3 pb-3 pt-2 h-full"
        >
          <motion.div 
            layout
            className="h-full p-2 bg-slate-100 rounded-lg"
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
                          selectedItemId={urlSelectedItemId || undefined}
                          onReorder={handleReorder}
                          isExpanded={true}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <AddWorkItemButton onAddItem={() => setIsCreatingWorkItem(true)} />
              </DragDropContext>
            </div>
          </motion.div>
        </motion.div>

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
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1]
        }}
        className="h-full w-full flex flex-col"
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} className="px-3 pb-3 pt-2"> 
            <motion.div layout className="h-full rounded-lg p-2 bg-slate-100">
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
              <div className="h-[calc(100%-48px)]">
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
                            selectedItemId={selectedItem?.id}
                            onReorder={handleReorder}
                            isExpanded={isExpanded}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <AddWorkItemButton onAddItem={() => setIsCreatingWorkItem(true)} />
              </div>
            </motion.div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30} className="h-full pt-2 pb-3">
            <div className="h-full rounded-lg border border-slate-100 scrollbar-thin max-h-full overflow-hidden">
              <div className="px-3 pb-1 pt-2">
                <LabelToInput
                  value={selectedItem?.name || ""}
                  setValue={(newName) => handleRenameWorkItem(selectedItem, newName)}
                  onBlur={() => {}}
                  variant="workitem"
                />
              </div>
              <ScrollArea className="h-full px-3 pb-3 pt-2">
                {workItemDetails ? (
                  <LexicalEditor
                    key={selectedItem.id}
                    onBlur={async () => {}}
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

          <ResizableHandle />

          <ResizablePanel defaultSize={30} minSize={15} className="h-full">
            <div className="h-full pb-3 px-3 pt-2 rounded-lg">
              <AIChat
                selectedItemId={selectedItem.id as Id<"workItems">}
                selectedItemType={selectedItem.type}
                selectedItemContent=""
                onInsertMarkdown={() => {}}
                workspaceId={null}
                selectedEpic={null}
                isCollapsed={false}
                toggleCollapse={() => {}}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </motion.div>

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
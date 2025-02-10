"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { WorkItemActionMenu } from "@/components/work-item-tree/WorkItemActionMenu"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { Id } from "@/convex/_generated/dataModel"
import { usePathname } from "next/navigation"

type WorkItemType = "epic" | "feature" | "story" | "task"

export type WorkItem = {
  id: Id<"workItems">
  name: string
  type: WorkItemType
  items: WorkItem[]
  order: number
  parentId?: Id<"workItems">
}

interface DragItem {
  id: Id<"workItems">
  type: WorkItemType
  index: number
  parentId: string
}

interface WorkItemNavigatorProps {
  item: WorkItem
  animated?: boolean
  onSelect: (item: WorkItem) => void
  onRename: (item: WorkItem, newName: string) => void
  onMoveToTrash: (item: WorkItem) => void
  onAddItem: (parentItem?: WorkItem) => void
  selectedItemId?: Id<"workItems"> | undefined
  parentIsOpen?: boolean
  index: number
  parentId: string
  onReorder: (itemId: Id<"workItems">, newParentId: Id<"workItems"> | undefined, newOrder: number) => void
  isExpanded?: boolean
  onUpdateParent: (itemId: Id<"workItems">, newParentId: Id<"workItems"> | undefined) => void
  availableParents?: WorkItem[]
}

const BASE_ORDER = 1000 // Make this consistent with your existing data
const MIN_GAP = 100    // Smaller gap to match the scale
const DROP_ZONE_THRESHOLD = 0.25; // 25% of the item height for top/bottom zones

const getValidChildTypes = (parentType: WorkItemType): WorkItemType[] => {
  switch (parentType) {
    case "epic":
      return ["feature", "story"];
    case "feature":
      return ["story"];
    case "story":
      return ["task"];
    default:
      return [];
  }
};

const canDropItem = (draggedItem: DragItem, targetItem: WorkItem | null, targetParentId: string) => {
  if (!draggedItem) return false;
  if (draggedItem.id === targetItem?.id) return false;

  // Allow dropping at root level
  if (targetParentId === "root") {
    return true;
  }

  // For dropping inside a target item
  if (targetItem) {
    const validChildTypes = getValidChildTypes(targetItem.type);
    console.log('Drop validation:', {
      draggedType: draggedItem.type,
      targetType: targetItem.type,
      validChildTypes,
      isValid: validChildTypes.includes(draggedItem.type)
    });
    return validChildTypes.includes(draggedItem.type);
  }

  return true;
};

export function WorkItemNavigator({
  item,
  animated = true,
  onSelect,
  onRename,
  onMoveToTrash,
  onAddItem,
  selectedItemId,
  parentIsOpen = true,
  index,
  parentId,
  onReorder,
  isExpanded = false,
  onUpdateParent,
  availableParents
}: WorkItemNavigatorProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(() => {
    if (item.items?.some(child => child.id === selectedItemId)) {
      return true
    }
    return false
  })

  useEffect(() => {
    if (item.items?.some(child => child.id === selectedItemId)) {
      setIsOpen(true)
    }
  }, [selectedItemId, item.items])

  useEffect(() => {
    const hasSelectedChild = item.items?.some(child => {
      return child.id === selectedItemId || 
        child.items?.some(grandChild => grandChild.id === selectedItemId)
    })

    if (hasSelectedChild) {
      setIsOpen(true)
    }
  }, [item.items, selectedItemId])

  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isOverTop, setIsOverTop] = useState(true)
  const [isDragStarted, setIsDragStarted] = useState(false)
  const [dropZone, setDropZone] = useState<'top' | 'bottom' | 'inside' | null>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'WORK_ITEM',
    item: () => {
      setIsDragStarted(true)
      return {
        id: item.id,
        type: item.type,
        index,
        parentId: parentId || "root"
      }
    },
    end: () => {
      setTimeout(() => {
        setIsDragStarted(false)
      }, 100)
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver, canDrop, draggedItem }, drop] = useDrop<DragItem, void, { 
    isOver: boolean
    canDrop: boolean
    draggedItem: DragItem | null 
  }>({
    accept: 'WORK_ITEM',
    canDrop: (draggedItem) => {
      // Don't allow dropping on itself
      if (draggedItem.id === item.id) return false;

      // For inside drops, check parent-child relationship
      if (dropZone === 'inside') {
        const validChildTypes = getValidChildTypes(item.type);
        const isValidChild = validChildTypes.includes(draggedItem.type);
        
        console.log('Drop validation:', {
          draggedType: draggedItem.type,
          targetType: item.type,
          dropZone,
          validChildTypes,
          isValidChild
        });
        
        return isValidChild;
      }

      // For top/bottom drops, check if they're at the same level
      return true;
    },
    hover: (_, monitor) => {
      if (!monitor.isOver({ shallow: true }) || !ref.current) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;
      const relativeY = clientOffset.y - hoverBoundingRect.top;
      const relativePosition = relativeY / hoverHeight;

      // Determine drop zone based on position and valid parent-child relationship
      if (relativePosition < DROP_ZONE_THRESHOLD) {
        setDropZone('top');
      } else if (relativePosition > (1 - DROP_ZONE_THRESHOLD)) {
        setDropZone('bottom');
      } else {
        const draggedType = monitor.getItem<DragItem>().type;
        const validChildTypes = getValidChildTypes(item.type);
        const canBeParent = validChildTypes.includes(draggedType);
        
        setDropZone(canBeParent ? 'inside' : 'bottom');
      }
    },
    drop: (draggedItem, monitor) => {
      if (!isOver || !canDrop || !draggedItem) return;

      console.log('Dropping:', {
        draggedItem,
        dropZone,
        parentId,
        itemId: item.id
      });
      
      const targetParentId = dropZone === 'inside' ? 
        item.id : 
        parentId === 'root' ? undefined : item.parentId;

      let newOrder: number;
      if (dropZone === 'inside') {
        const siblings = item.items || [];
        newOrder = siblings.length === 0 ? BASE_ORDER : (siblings[siblings.length - 1].order + MIN_GAP);
      } else {
        newOrder = dropZone === 'top' ? item.order - MIN_GAP : item.order + MIN_GAP;
      }
      
      onReorder(draggedItem.id, targetParentId, newOrder);
      setDropZone(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      draggedItem: monitor.getItem()
    })
  })

  // Clear drop zone when not hovering
  useEffect(() => {
    if (!isOver) {
      setDropZone(null)
    }
  }, [isOver])

  drag(drop(ref))

  const isSelected = selectedItemId === item.id

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedItemId === item.id) {
        onSelect(null as any); // Deselect the current item
      }
      setIsOpen(prev => !prev);
    },
    [item.id, selectedItemId, onSelect],
  );

  const handleItemClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger selection if we're dragging or just finished dragging
    if (isDragging || isDragStarted) return
    
    // Check if we're clicking on a button or action menu
    const target = e.target as HTMLElement
    if (
      target.closest('button') || 
      target.closest('[role="menuitem"]')
    ) {
      return
    }
    
    onSelect(item)
  }, [item, onSelect, isDragging, isDragStarted])

  const handleRename = useCallback(
    (newName: string) => {
      onRename(item, newName)
    },
    [item, onRename],
  )

  const handleMoveToTrash = useCallback(() => {
    // Find parent item before deletion
    const parentItem = item.parentId ? item : null
    onMoveToTrash(item)
    
    // If this was a child item, keep parent expanded
    if (parentItem) {
      setIsOpen(true)
    }
  }, [item, onMoveToTrash])

  const canAddChild = useCallback((parentType: WorkItemType) => {
    switch (parentType) {
      case "epic":
        return true; // Epics can have features and stories
      case "feature":
        return true; // Features can have stories
      case "story":
        return true; // Stories can have tasks
      case "task":
        return false; // Tasks can't have children
      default:
        return false;
    }
  }, []);

  const handleAddItem = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const validChildTypes = getValidChildTypes(item.type);
      if (validChildTypes.length === 0) {
        toast.error(`Cannot add items under a ${item.type}`);
        return;
      }
      onAddItem(item);
    },
    [item, onAddItem]
  );

  const ItemIcon = () => {
    const hasItems = item?.items && Array.isArray(item.items) && item.items.length > 0
    const showChevron = isHovered && hasItems // Only show chevron on hover if has children

    return (
      <div className="relative w-4 h-4">
        <AnimatePresence initial={false} mode="wait">
          {showChevron ? (
            <motion.span
              key={`chevron-${item.id}`}
              initial={{ opacity: 0, rotate: isOpen ? 90 : 0 }}
              animate={{ opacity: 1, rotate: isOpen ? 90 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ChevronRight className="size-4 text-gray-500" />
            </motion.span>
          ) : (
            <motion.span
              key={`icon-${item.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {getItemTypeIcon(item.type)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    ) 
  }

  const getItemTypeIcon = (type: WorkItemType) => {
    const iconStyles = "flex items-center justify-center p-1 rounded text-xs font-semibold";
    
    switch (type) {
      case "epic":
        return <span className={`${iconStyles} bg-purple-100 text-purple-700`}>EP</span>;
      case "feature":
        return <span className={`${iconStyles} bg-blue-100 text-blue-700`}>FT</span>;
      case "story":
        return <span className={`${iconStyles} bg-green-100 text-green-700`}>US</span>;
      case "task":
        return <span className={`${iconStyles} bg-orange-100 text-orange-700`}>TA</span>;
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('Item opened:', {
        id: item.id,
        name: item.name,
        hasItems: Boolean(item?.items),
        itemsLength: item?.items?.length,
        isArray: Array.isArray(item?.items)
      });
    }
  }, [isOpen, item]);

  useEffect(() => {
    console.log('WorkItemNavigator mounted/updated:', {
      id: item.id,
      name: item.name,
      type: item.type,
      hasItems: Boolean(item?.items),
      itemsCount: item?.items?.length,
      parentId: item.parentId,
      isOpen
    });
  }, [item, isOpen]);

  const generateUniqueKey = (parentId: Id<"workItems">, childId: Id<"workItems">, index: number) => {
    return `parent-${parentId}-child-${childId}-index-${index}`;
  };

  const getValidParents = (itemType: WorkItemType, allParents: WorkItem[]): WorkItem[] => {
    switch (itemType) {
      case "epic":
        return []; // Epics can't have parents
      case "feature":
        return allParents.filter(p => p.type === "epic");
      case "story":
        return allParents.filter(p => ["epic", "feature"].includes(p.type));
      case "task":
        return allParents.filter(p => ["epic", "feature", "story"].includes(p.type));
      default:
        return [];
    }
  };

  if (!parentIsOpen) return null

  return (
    <div ref={ref} className="relative py-0.25">
      {/* Drop zone indicators */}
      {isOver && canDrop && (
        <>
          {dropZone === 'top' && (
            <div className="absolute left-0 right-0 h-0.5 -top-[2px] bg-blue-500 z-10" />
          )}
          {dropZone === 'bottom' && (
            <div className="absolute left-0 right-0 h-0.5 -bottom-[2px] bg-blue-500 z-10" />
          )}
          {dropZone === 'inside' && (
            <div className={cn(
              "absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none",
              "bg-blue-50/20"
            )} />
          )}
        </>
      )}
      
      <div 
        className={cn(
          "rounded-lg",
          "cursor-grab active:cursor-grabbing",
          item.id === draggedItem?.id && isDragging && "opacity-50",
          isOver && draggedItem && draggedItem.type !== item.type && (
            canDrop ? "bg-emerald-100/50" : "bg-red-100/50"
          )
        )}
      >
        <div 
          className={cn(
            "flex items-center gap-2 rounded-lg p-2",
            isSelected ? "bg-slate-200" : "hover:bg-slate-200",
            "transition-colors duration-200"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleItemClick}
        >
          <button className="p-0.5 focus:outline-none" onClick={handleIconClick}>
            <ItemIcon />
          </button>
          <span className="flex-grow truncate" title={item.name}>
            {item.name}
          </span>
          {isHovered && (
            <>
              {canAddChild(item.type) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-4 w-4 opacity-0 group-hover:opacity-100",
                    isHovered && "opacity-100"
                  )}
                  onClick={handleAddItem}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
              <WorkItemActionMenu 
                item={item}
                onRename={handleRename}
                onUpdateParent={(newParentId) => {
                  if (onUpdateParent) {
                    onUpdateParent(item.id, newParentId as Id<"workItems"> | undefined);
                  }
                }}
                onMoveToTrash={handleMoveToTrash}
                hasChildren={Boolean(item.items && item.items.length > 0)}
                availableParents={getValidParents(item.type, availableParents || [])}
              />
            </>
          )}
        </div>

        {isOpen && item.items && item.items.length > 0 && (
          <div className="pl-6 overflow-hidden py-0.25">
            {item.items
              .filter((child, index, self) => 
                index === self.findIndex((t) => t.id === child.id)
              )
              .filter(child => {
                if (!child?.id) {
                  console.warn('Invalid child found:', child);
                  return false;
                }
                return true;
              })
              .map((child, index) => {
                const uniqueKey = generateUniqueKey(item.id, child.id, index);
                
                console.log('Rendering child:', {
                  parentId: item.id,
                  childId: child.id,
                  key: uniqueKey,
                  index,
                  childType: child.type,
                  childName: child.name
                });
                
                return (
                  <WorkItemNavigator
                    key={uniqueKey}
                    item={child}
                    index={index}
                    parentId={item.id.toString()}
                    onSelect={onSelect}
                    onRename={onRename}
                    onMoveToTrash={onMoveToTrash}
                    onAddItem={onAddItem}
                    selectedItemId={selectedItemId}
                    onReorder={onReorder}
                    isExpanded={isExpanded}
                    parentIsOpen={isOpen}
                    onUpdateParent={onUpdateParent}
                    availableParents={availableParents}
                  />
                );
            })}
          </div>
        )}
      </div>

      {isDragging && item.id === draggedItem?.id && (
        <div
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 100,
            left: '0',
            top: '0',
            width: 'calc(100% - 2rem)',
          }}
          className="mx-2 p-2 bg-white shadow-xl ring-1 ring-slate-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <ItemIcon />
            <span className="truncate">{item.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function AddWorkItemButton({ onAddItem }: { onAddItem: () => void }) {
  return (
    <Button
      variant="ghost"
      size="lg"
      className="w-full justify-start text-xs text-slate-500 hover:bg-white h-8 mt-2"
      onClick={onAddItem}
    >
      <Plus className="h-3 w-3 mr-2" />
      New Work Item
    </Button>
  );
}


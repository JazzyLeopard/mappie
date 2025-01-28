"use client"

import { useState, useCallback, useRef } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { WorkItemActionMenu } from "@/components/work-item-tree/WorkItemActionMenu"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { isValidDropTarget } from '@/components/work-items/WorkItemHierarchy'

type WorkItemType = "epic" | "feature" | "story" | "task"

type WorkItem = {
  id: string
  name: string
  type: WorkItemType
  items?: WorkItem[]
  order: number
  parentId?: string
}

interface DragItem {
  id: string
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
  selectedItemId?: string
  parentIsOpen?: boolean
  index: number
  parentId: string
  onReorder: (itemId: string, newParentId: string, newOrder: number) => void
}

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
  onReorder
}: WorkItemNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isOverTop, setIsOverTop] = useState(true)
  const [isOverShallow, setIsOverShallow] = useState(true)

  const [{ isDragging }, drag] = useDrag({
    type: 'WORK_ITEM',
    item: () => ({
      id: item.id,
      type: item.type,
      index,
      parentId
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver, canDrop, draggedItem }, drop] = useDrop<DragItem, void, { 
    isOver: boolean; 
    canDrop: boolean;
    draggedItem: DragItem | null;
  }>({
    accept: 'WORK_ITEM',
    canDrop: (draggedItem) => {
      if (draggedItem.type === 'epic') {
        return item.type === 'epic'
      }
      const validChildTypes = getValidChildTypes(item.type)
      return (validChildTypes.includes(draggedItem.type) || draggedItem.type === item.type) 
             && draggedItem.id !== item.id
    },
    hover: (_, monitor) => {
      if (!monitor.isOver({ shallow: true })) return

      const clientOffset = monitor.getClientOffset()
      if (!clientOffset || !ref.current) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      setIsOverTop(hoverClientY < hoverMiddleY)
      setIsOverShallow(true)
    },
    drop: (draggedItem) => {
      if (!isOver || !canDrop) return
      
      const BASE_ORDER = 65536 // 2^16
      const MIN_GAP = 1024 // Minimum gap between items
      
      // Determine target parent ID
      const targetParentId = draggedItem.type === item.type ? parentId : item.id
      
      // Get all siblings at the target level
      const siblings = item.items || []
      let newOrder: number
      
      if (draggedItem.type === item.type) {
        // Same level reordering
        if (isOverTop) {
          // Dropping above current item
          const prevItem = siblings[index - 1]
          if (!prevItem) {
            // First position
            newOrder = item.order - BASE_ORDER
          } else {
            // Between prev and current
            newOrder = prevItem.order + Math.max(MIN_GAP, (item.order - prevItem.order) / 2)
          }
        } else {
          // Dropping below current item
          const nextItem = siblings[index + 1]
          if (!nextItem) {
            // Last position
            newOrder = item.order + BASE_ORDER
          } else {
            // Between current and next
            newOrder = item.order + Math.max(MIN_GAP, (nextItem.order - item.order) / 2)
          }
        }
      } else {
        // Nesting as child
        if (siblings.length === 0) {
          // First child
          newOrder = BASE_ORDER
        } else {
          // Add to end of children
          const lastChild = siblings[siblings.length - 1]
          newOrder = lastChild.order + BASE_ORDER
        }
      }
      
      // Handle number overflow
      if (newOrder > Number.MAX_SAFE_INTEGER / 2) {
        // Normalize all sibling orders
        const normalizedOrder = siblings.reduce((acc, sibling, idx) => {
          const normalizedPos = BASE_ORDER * (idx + 1)
          onReorder(sibling.id, targetParentId, normalizedPos)
          return normalizedPos
        }, BASE_ORDER)
        
        // Place the dragged item in the correct position
        newOrder = isOverTop ? 
          normalizedOrder - BASE_ORDER : 
          normalizedOrder + BASE_ORDER
      }
      
      onReorder(draggedItem.id, targetParentId, newOrder)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      draggedItem: monitor.getItem()
    })
  })

  // Combine drag and drop refs
  drag(drop(ref))

  const isSelected = selectedItemId === item.id

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (item.items?.length) {
        setIsOpen((prev) => !prev)
      }
    },
    [item.items],
  )

  const handleItemClick = useCallback(() => {
    onSelect(item)
  }, [item, onSelect])

  const handleRename = useCallback(
    (newName: string) => {
      onRename(item, newName)
    },
    [item, onRename],
  )

  const handleMoveToTrash = useCallback(() => {
    onMoveToTrash(item)
  }, [item, onMoveToTrash])

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

  const canAddChild = useCallback((parentType: WorkItemType) => {
    return getValidChildTypes(parentType).length > 0;
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
    const showChevron = isHovered && item.items && item.items.length > 0

    return (
      <div className="relative w-4 h-4">
        <AnimatePresence initial={false} mode="wait" key={`icon-presence-${item.id}`}>
          {showChevron ? (
            <motion.span
              key="chevron"
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
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {getItemIcon(item.type)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const getItemIcon = (type: WorkItemType) => {
    const style = { fontSize: "14px" }
    switch (type) {
      case "epic":
        return <span style={style}>🏆</span>
      case "feature":
        return <span style={style}>🌟</span>
      case "story":
        return <span style={style}>📖</span>
      case "task":
        return <span style={style}>✅</span>
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const isTop = e.clientY - rect.top < rect.height / 2
    setIsOverTop(isTop)
  }

  if (!parentIsOpen) return null

  return (
    <div ref={ref} className="relative">
      {/* Separator for reordering - only visual indicator */}
      {isOver && canDrop && draggedItem?.type === item.type && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-blue-500 pointer-events-none" 
          style={{ top: isOverTop ? '-1px' : 'calc(100% - 1px)' }} 
        />
      )}
      
      <div className={cn(
        "rounded-lg",
        "cursor-grab active:cursor-grabbing",
        // Only dim the original dragged item
        item.id === draggedItem?.id && isDragging && "opacity-50",
        // Show nesting indicator backgrounds
        isOver && draggedItem && draggedItem.type !== item.type && (
          canDrop ? "bg-emerald-100/50" : "bg-red-100/50"
        )
      )}>
        <div 
          className={cn(
            "flex items-center gap-2 rounded-lg p-2",
            isSelected ? "bg-slate-200" : "hover:bg-slate-200",
            "transition-colors duration-200"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onSelect(item)}
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
                  className="h-4 w-4 p-0" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddItem(item)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <WorkItemActionMenu onRename={handleRename} onMoveToTrash={handleMoveToTrash} />
            </>
          )}
        </div>

        {isOpen && item.items && item.items.length > 0 && (
          <div className="pl-6">
            {item.items.map((child, index) => (
              <WorkItemNavigator
                key={child.id}
                item={child}
                index={index}
                parentId={item.id}
                onSelect={onSelect}
                onRename={onRename}
                onMoveToTrash={onMoveToTrash}
                onAddItem={onAddItem}
                selectedItemId={selectedItemId}
                onReorder={onReorder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ghost item that follows cursor */}
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


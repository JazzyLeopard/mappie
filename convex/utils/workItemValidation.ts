import { DatabaseReader } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { WorkItemType, isValidParentChild } from "../schema";

export async function validateWorkItemHierarchy(
  db: DatabaseReader,
  parentId: Id<"workItems"> | undefined,
  childType: WorkItemType
) {
  // If no parent, only epics are allowed at root level
  if (!parentId) {
    if (childType === "task") {
      throw new Error("Tasks must have a parent item");
    }
    return;
  }

  // Get parent item
  const parentItem = await db.get(parentId);
  if (!parentItem) {
    throw new Error("Parent work item not found");
  }

  // Validate relationship
  if (!isValidParentChild(parentItem.type, childType)) {
    throw new Error(
      `Invalid hierarchy: ${childType} cannot be a child of ${parentItem.type}`
    );
  }
} 
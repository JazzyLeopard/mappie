import { DatabaseReader } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function validateWorkspaceAccess(
  db: DatabaseReader,
  userId: string,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  const workspace = await db.get(workspaceId);
  
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (workspace.userId !== userId) {
    // Check sharing settings
    const sharing = await db
      .query("sharing")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("status"), true))
      .first();

    if (!sharing) {
      throw new Error("Access denied");
    }
  }

  return true;
} 
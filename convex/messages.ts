import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateWorkspaceAccess } from "./utils/workspaceAuth";

// Get chat history for a specific item
export const getChatHistory = query({
  args: {
    itemId: v.id("workItems"),
    itemType: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const { itemId, itemType, workspaceId } = args;

    // Get the most recent chat history for this item
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_itemId_and_type", (q) => 
        q.eq("itemId", itemId)
         .eq("itemType", itemType)
      )
      .order("desc")
      .first();

    return messages;
  }
});

// Store chat history with tool invocations
export const storeChatHistory = mutation({
  args: {
    itemId: v.id("workItems"),
    itemType: v.string(),
    workspaceId: v.id("workspaces"),
    messages: v.array(v.object({
      id: v.optional(v.string()),
      role: v.union(
        v.literal("system"),
        v.literal("user"),
        v.literal("assistant"),
        v.literal("function"),
        v.literal("tool"),
        v.literal("data")
      ),
      content: v.string(),
      toolInvocations: v.optional(v.array(v.object({
        toolName: v.string(),
        toolCallId: v.string(),
        state: v.string(),
        args: v.optional(v.any()),
        result: v.optional(v.object({
          content: v.string(),
          metadata: v.optional(v.object({
            title: v.optional(v.string()),
            type: v.optional(v.string())
          }))
        }))
      })))
    }))
  },
  handler: async (ctx, args) => {
    const { itemId, itemType, workspaceId, messages } = args;

    // Get existing chat history
    const existing = await ctx.db
      .query("messages")
      .withIndex("by_itemId_and_type", (q) => 
        q.eq("itemId", itemId)
         .eq("itemType", itemType)
      )
      .first();

    if (existing) {
      // Update existing chat history
      return await ctx.db.patch(existing._id, {
        messages,
        updatedAt: BigInt(Date.now())
      });
    } else {
      // Create new chat history
      return await ctx.db.insert("messages", {
        itemId,
        itemType,
        workspaceId,
        messages,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now())
      });
    }
  }
});
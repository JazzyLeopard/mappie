import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateWorkItemHierarchy } from "./utils/workItemValidation";
import { validateWorkspaceAccess } from "./utils/workspaceAuth";

export const createWorkItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("workItems")),
    type: v.union(
      v.literal("epic"),
      v.literal("feature"),
      v.literal("story"),
      v.literal("task")
    ),
    title: v.string(),
    description: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await validateWorkspaceAccess(ctx.db, identity.subject, args.workspaceId);

    // Validate hierarchy
    await validateWorkItemHierarchy(ctx.db, args.parentId, args.type);

    // Get max order of siblings
    const siblings = await ctx.db
      .query("workItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .order("desc")
      .take(1);

    const order = siblings.length ? siblings[0].order + 1000 : 1000;

    return await ctx.db.insert("workItems", {
      workspaceId: args.workspaceId,
      parentId: args.parentId,
      type: args.type,
      title: args.title,
      description: args.description,
      status: args.status,
      order,
      metadata: {},
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });
  },
});

export const getWorkItems = query({
  args: { 
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.union(v.id("workItems"), v.null()))
  },
  handler: async (ctx, args) => {
    // Query builder
    let query = ctx.db
      .query("workItems")
      .withIndex("by_workspace", (q) => 
        q.eq("workspaceId", args.workspaceId)
      );

    // Add parentId filter if provided
    if ('parentId' in args) {
      // For root items (parentId is null)
      if (args.parentId === null) {
        query = query.filter((q) => q.eq(q.field("parentId"), null));
      } 
      // For items with a specific parent
      else if (args.parentId) {
        query = query.filter((q) => q.eq(q.field("parentId"), args.parentId));
      }
    }

    // Get items and sort by order
    const items = await query.collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

export const getWorkItemChildren = query({
  args: {
    parentId: v.id("workItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("workItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .order("desc")
      .collect();
  },
});

export const updateWorkItem = mutation({
  args: {
    id: v.id("workItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    parentId: v.optional(v.union(v.id("workItems"), v.null())),
    order: v.optional(v.number()),
    metadata: v.optional(v.object({
      priority: v.optional(v.string()),
      complexity: v.optional(v.string()),
      estimatedEffort: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      assignee: v.optional(v.string()),
      dueDate: v.optional(v.int64()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    
    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error("Work item not found");
    }

    await validateWorkspaceAccess(ctx.db, identity.subject, item.workspaceId);

    // If updating parent, validate hierarchy
    if (updates.parentId !== undefined) {
      if (updates.parentId !== null) {
        await validateWorkItemHierarchy(ctx.db, updates.parentId, item.type);
      }
    }

    // Create update object
    const updateObj = {
      ...updates,
      updatedAt: BigInt(Date.now()),
    };

    // Update the item
    return await ctx.db.patch(id, updateObj);
  },
});

export const deleteWorkItem = mutation({
  args: { id: v.id("workItems") },
  handler: async (ctx, args) => {
    // Check if the item exists
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Work item not found");
    }

    // Check for child items
    const childItems = await ctx.db
      .query("workItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();

    if (childItems.length > 0) {
      throw new Error("Cannot delete item with child items. Please remove child items first.");
    }

    // Proceed with deletion
    await ctx.db.delete(args.id);
  },
});

export const getRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workItems")
      .order("desc")
      .take(args.limit);
  },
});

export const update = mutation({
  args: {
    id: v.id("workItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify the work item exists
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Work item not found");
    }

    // Update the work item
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: BigInt(Date.now()),
    });
  },
});

export const get = query({
  args: { id: v.id("workItems") },
  handler: async (ctx, args) => {
    const workItem = await ctx.db.get(args.id);
    // Return null instead of throwing if item not found
    return workItem || null;
  },
});

export const reorderWorkItem = mutation({
  args: {
    id: v.id("workItems"),
    parentId: v.optional(v.id("workItems")),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Work item not found");
    }

    await validateWorkspaceAccess(ctx.db, identity.subject, item.workspaceId);

    // If parentId is being updated, validate the hierarchy
    if (args.parentId !== undefined) {
      await validateWorkItemHierarchy(ctx.db, args.parentId, item.type);
    }

    return await ctx.db.patch(args.id, {
      ...(args.parentId !== undefined && { parentId: args.parentId }),
      order: args.order,
      updatedAt: BigInt(Date.now()),
    });
  },
}); 
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
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workItems")
      .withIndex("by_workspace_and_order", (q) => 
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .collect();
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
    parentId: v.optional(v.id("workItems")),
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
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(args.status && { status: args.status }),
      ...(args.parentId !== undefined && { parentId: args.parentId }),
      ...(args.order !== undefined && { order: args.order }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: BigInt(Date.now()),
    });
  },
});

export const deleteWorkItem = mutation({
  args: {
    id: v.id("workItems"),
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

    // Check if work item has children
    const children = await ctx.db
      .query("workItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();

    if (children.length > 0) {
      throw new Error("Cannot delete work item with children");
    }

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
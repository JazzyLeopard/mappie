import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateWorkspaceAccess } from "./utils/workspaceAuth";

export const getWorkspaces = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return []; // Return empty array instead of throwing

    return await ctx.db
      .query("workspaces")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const updateWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(v.object({
      defaultTemplates: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await validateWorkspaceAccess(ctx.db, identity.subject, args.id);

    const updates = {
      name: args.name,
      ...(args.description && { description: args.description }),
      ...(args.settings && { settings: args.settings }),
      updatedAt: BigInt(Date.now()),
    };

    await ctx.db.patch(args.id, updates);
    return await ctx.db.get(args.id);
  },
});

export const initializeWorkspace = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    projectType: v.union(
      v.literal("software"),
      v.literal("hardware"),
      v.literal("service"),
      v.literal("other")
    ),
    metadata: v.object({
      industry: v.optional(v.string()),
      objectives: v.optional(v.array(v.string())),
      stakeholders: v.optional(v.array(v.string())),
      timeline: v.optional(v.object({
        startDate: v.int64(),
        targetDate: v.optional(v.int64())
      }))
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Create the workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      userId: identity.subject,
      projectType: args.projectType,
      metadata: args.metadata,
      isArchived: false,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now())
    });

    return workspaceId;
  }
}); 
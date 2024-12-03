import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFunctionalRequirement = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const timestamp = Date.now();
    const frId = await ctx.db.insert("functionalRequirements", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      createdAt: BigInt(timestamp),
      updatedAt: BigInt(timestamp),
    });

    return await ctx.db.get(frId);
  },
});

export const getFunctionalRequirementsByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    try {
      const frs = await ctx.db
        .query("functionalRequirements")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", args.projectId))
        .collect();

      if (!frs || frs.length <= 0) {
        return [];
      }

      return frs;
    } catch (error) {
      console.error("Error fetching functional requirements:", error);
      return [];
    }
  },
});

export const updateFunctionalRequirement = mutation({
  args: {
    id: v.id("functionalRequirements"),
    title: v.optional(v.string()),
    description: v.optional(v.string())
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...updates } = args;
    const timestamp = Date.now();
    
    const updateFields: Record<string, any> = {
      updatedAt: BigInt(timestamp)
    };
    
    if (updates.title !== undefined) updateFields.title = updates.title;
    if (updates.description !== undefined) updateFields.description = updates.description;

    await ctx.db.patch(id, updateFields);
  },
});

export const deleteFunctionalRequirement = mutation({
  args: { id: v.id("functionalRequirements") },
  handler: async (ctx: any, args: any) => {
    const { id } = args;
    await ctx.db.delete(id);
  },
});

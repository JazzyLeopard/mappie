import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFunctionalRequirement = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("functionalRequirements", {
      projectId: args.projectId,
      content: args.content,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });
  },
});

export const getFunctionalRequirementsByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const requirements = await ctx.db
      .query("functionalRequirements")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();
    
    return requirements;
  },
});

export const updateFunctionalRequirement = mutation({
  args: {
    id: v.id("functionalRequirements"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, content } = args;
    await ctx.db.patch(id, { content, updatedAt: BigInt(Date.now()) });
    return { success: true };
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUseCase = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const useCaseId = await ctx.db.insert("useCases", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });

    const useCase = await ctx.db.get(useCaseId)
    return useCase;
  },
});

export const getUseCasesByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    try {
      const useCases = await ctx.db
        .query("useCases")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", args.projectId))
        .collect();

      return useCases || [];
    } catch (error) {
      console.error("Error fetching use cases:", error);
      return [];
    }
  },
});

export const getUseCases = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("useCases")
      .filter((q: any) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

export const updateUseCase = mutation({
  args: {
    id: v.id("useCases"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: BigInt(Date.now()) });
  },
});

export const deleteUseCase = mutation({
  args: { id: v.id("useCases") },
  handler: async (ctx: any, args: any) => {
    const { id } = args;
    await ctx.db.delete(id);
  },
});
import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createUserStory = mutation({
  args: {
    epicId: v.id("epics"),
    title: v.string(),
    description: v.string(),
    acceptanceCriteria: v.optional(v.string()),
    interfaceElements: v.optional(v.string()),
    inScope: v.optional(v.string()),
    outOfScope: v.optional(v.string()),
    accessibilityInfo: v.optional(v.string()),
    functionalFlow: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userStoryId = await ctx.db.insert("userStories", {
      epicId: args.epicId,
      title: args.title,
      description: args.description,
      acceptanceCriteria: args.acceptanceCriteria,
      interfaceElements: args.interfaceElements,
      inScope: args.inScope,
      outOfScope: args.outOfScope,
      accessibilityInfo: args.accessibilityInfo,
      functionalFlow: args.functionalFlow,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });
    return userStoryId;
  },
});

  export const updateEpic = mutation({
    args: {
      id: v.id("epics"),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.string()),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      owner: v.optional(v.string()),
      priority: v.optional(v.string()),
      labels: v.optional(v.array(v.string())),
      dependencies: v.optional(v.array(v.id("epics"))),
    },
    handler: async (ctx, args) => {
      const { id, ...updates } = args;
      const updatedFields = {
        ...updates,
        updatedAt: BigInt(Date.now()),
        startDate: updates.startDate ? BigInt(new Date(updates.startDate).getTime()) : undefined,
        endDate: updates.endDate ? BigInt(new Date(updates.endDate).getTime()) : undefined,
      };
      await ctx.db.patch(id, updatedFields);
    },
  });

export const deleteEpic = mutation({
  args: { id: v.id("epics") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
import { mutation, query } from "./_generated/server";
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
      ...args,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });
    return userStoryId;
  },
});

export const updateUserStory = mutation({
  args: {
    id: v.id("userStories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    acceptanceCriteria: v.optional(v.string()),
    interfaceElements: v.optional(v.string()),
    inScope: v.optional(v.string()),
    outOfScope: v.optional(v.string()),
    accessibilityInfo: v.optional(v.string()),
    functionalFlow: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: BigInt(Date.now()),
    });
  },
});

export const deleteUserStory = mutation({
  args: { id: v.id("userStories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getUserStories = query({
  args: { epicId: v.id("epics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userStories")
      .filter((q) => q.eq(q.field("epicId"), args.epicId))
      .collect();
  },
});

export const getUserStoryById = query({
  args: { userStoryId: v.id("userStories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userStoryId);
  },
});

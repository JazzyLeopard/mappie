import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUserStory = mutation({
  args: {
    epicId: v.id("epics"),
    title: v.string(),
    description: v.optional(v.string()),
  },

  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    const userId = identity.subject;

    const userStory = await ctx.db.insert("userStories", {
      title: args.title,
      description: args.description || "",
      epicId: args.epicId,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });
    return userStory;
  },
});

export const updateUserStory = mutation({
  args: {
    id: v.id("userStories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...updates } = args;
    const updatedFields = {
      ...updates,
      updatedAt: BigInt(Date.now()),
    }
    await ctx.db.patch(id, updatedFields);
  },
});

export const deleteUserStory = mutation({
  args: { id: v.id("userStories") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id);
  },
});

export const getUserStories = query({
  args: {
    projectId: v.id("projects"),
    epicId: v.optional(v.id("epics")),
  },
  handler: async (ctx: any, args: any) => {
    const { projectId, epicId } = args;

    const epics = await ctx.db
      .query("epics")
      .filter((q: any) => q.eq(q.field("projectId"), projectId))
      .collect();

    const epicIds = epics.map((epic: any) => epic._id);

    let userStoriesQuery = ctx.db
      .query("userStories")
      .filter((q: any) => 
        q.or(
          ...epicIds.map((epicId: any) => q.eq(q.field("epicId"), epicId))
        )
      );

    if (epicId) {
      userStoriesQuery = userStoriesQuery.filter((q: any) => q.eq(q.field("epicId"), epicId));
    }

    return await userStoriesQuery.collect();
  },
});

export const getUserStoryById = query({
  args: { userStoryId: v.id("userStories") },
  handler: async (ctx: any, args: any) => {
    const { userStoryId } = args;
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    if (!userStoryId) {
      throw new Error("Project ID is required");
    }

    const userStories = await ctx.db
      .query("userStories")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("_id"), userStoryId)
        ),
      )
      .first()

    if (!userStories) {
      throw new Error("userStories not found")
    }

    return userStories
  },
});

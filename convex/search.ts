import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Always fetch recent items if no query
    const documents = await ctx.db
      .query("knowledgeBase")
      .filter((q) => 
        q.eq(q.field("workspaceId"), args.workspaceId) &&
        q.eq(q.field("isDeleted"), false)
      )
      .order("desc")
      .take(20);

    const workItems = await ctx.db
      .query("workItems")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .take(20);

    // If there's a search query, filter results
    if (args.query) {
      const searchedDocs = await ctx.db
        .query("knowledgeBase")
        .withSearchIndex("search_title", (q) => 
          q.search("title", args.query!)
        )
        .filter((q) => 
          q.eq(q.field("workspaceId"), args.workspaceId) &&
          q.eq(q.field("isDeleted"), false)
        )
        .take(20);

      const searchedItems = await ctx.db
        .query("workItems")
        .withSearchIndex("search_title", (q) => 
          q.search("title", args.query!)
        )
        .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        .take(20);

      return {
        documents: searchedDocs,
        workItems: searchedItems
      };
    }

    return { documents, workItems };
  },
}); 
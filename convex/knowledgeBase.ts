import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeBase")
      .order("desc")
      .take(args.limit);
  },
});

export const getByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    types: v.array(v.union(
      v.literal("document"),
      v.literal("pdf"),
      v.literal("docx"),
      v.literal("csv"),
      v.literal("json"),
      v.literal("md"),
      v.literal("txt"),
      v.literal("ppt"),
      v.literal("image"),
      v.literal("template"),
      v.literal("reference")
    ))
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeBase")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), args.types as any))
      .collect();
  },
}); 
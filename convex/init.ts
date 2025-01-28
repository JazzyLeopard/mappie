import { api } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { SYSTEM_TEMPLATES } from "./utils/systemTemplates";

export const insertSystemTemplates = internalMutation({
  handler: async (ctx) => {
    const existingTemplates = await ctx.db
      .query("templates")
      .withIndex("by_system")
      .filter(q => q.eq(q.field("isSystemTemplate"), true))
      .collect();

    if (existingTemplates.length > 0) {
      console.log("System templates already exist");
      return;
    }

    for (const [_, template] of Object.entries(SYSTEM_TEMPLATES)) {
      await ctx.db.insert("templates", {
        title: template.title,
        type: template.type as any,
        content: template.content,
        aiPrompt: template.aiPrompt,
        isSystemTemplate: true,
        metadata: {
          ...template.metadata,
          tags: [...template.metadata.tags],
          status: "published",
        },
        workspaceId: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    console.log("System templates inserted successfully");
  },
}); 
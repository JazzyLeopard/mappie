import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateWorkspaceAccess } from "./utils/workspaceAuth";
import { SYSTEM_TEMPLATES } from "./utils/systemTemplates";
import { Id } from "./_generated/dataModel";

interface Template {
  id: string;
  title: string;
  type: "prd" | "funcReq" | "useCase" | "epic" | "feature" | "userStory" | "custom" | "srs" | "techSpec" | "testPlan" | "releaseNotes" ;
  content: string;  // Markdown structure
  aiPrompt: string; // Guidelines for AI
  metadata?: {
    description?: string;
    tags?: string[];
    version: string;
    useCount: number;
    lastUsed?: number;
    createdBy?: string;  // For custom templates
  }
  isSystemTemplate: boolean;
}

// Get system templates
export const getSystemTemplates = query({
  args: {
    type: v.optional(v.union(
      v.literal("prd"),
      v.literal("funcReq"),
      v.literal("useCase"),
      v.literal("epic"),
      v.literal("feature"),
      v.literal("userStory"),
      v.literal("custom"),
      v.literal("srs"),
      v.literal("techSpec"),
      v.literal("testPlan"),
      v.literal("releaseNotes"),
    )),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // First get all system templates to debug
    const allTemplates = await ctx.db
      .query("templates")
      .withIndex("by_system")
      .filter(q => q.eq(q.field("isSystemTemplate"), true))
      .collect();

    console.log("Found system templates:", allTemplates.length, 
      "Types:", allTemplates.map(t => t.type),
      "Requested type:", args.type);

    // Then apply type filter if specified
    let q = ctx.db
      .query("templates")
      .withIndex("by_system")
      .filter(q => q.eq(q.field("isSystemTemplate"), true));
    
    if (args.type) {
      q = q.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    if (args.category) {
      q = q.filter((q) => q.eq(q.field("metadata.category"), args.category));
    }

    return await q.collect();
  },
});

// Get workspace templates
export const getWorkspaceTemplates = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.union(
      v.literal("prd"),
      v.literal("funcReq"),
      v.literal("useCase"),
      v.literal("epic"),
      v.literal("feature"),
      v.literal("userStory"),
      v.literal("custom")
    )),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await validateWorkspaceAccess(ctx.db, identity.subject, workspaceId);

    let q = ctx.db
      .query("templates")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter(q => q.eq(q.field("isSystemTemplate"), false));

    if (type) {
      q = q.filter((q) => q.eq(q.field("type"), type));
    }

    return await q.collect();
  },
});

// Create custom template
export const createTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    type: v.union(
      v.literal("prd"),
      v.literal("funcReq"),
      v.literal("useCase"),
      v.literal("epic"),
      v.literal("feature"),
      v.literal("userStory"),
      v.literal("custom"),
      v.literal("srs"),
      v.literal("techSpec"),
      v.literal("testPlan"),
      v.literal("releaseNotes"),
    ),
    content: v.string(),
    aiPrompt: v.string(),
    metadata: v.object({
      description: v.string(),
      tags: v.array(v.string()),
      version: v.string(),
      useCount: v.number(),
      category: v.string(),
      status: v.union(v.literal("draft"), v.literal("published")),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await validateWorkspaceAccess(ctx.db, identity.subject, args.workspaceId);

    const now = Date.now();
    return await ctx.db.insert("templates", {
      ...args,
      isSystemTemplate: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Clone template to workspace
export const cloneTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("templates"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await validateWorkspaceAccess(ctx.db, identity.subject, args.workspaceId);

    const sourceTemplate = await ctx.db.get(args.templateId);
    if (!sourceTemplate) throw new Error("Template not found");

    const now = Date.now();
    return await ctx.db.insert("templates", {
      workspaceId: args.workspaceId,
      title: args.title || `Copy of ${sourceTemplate.title}`,
      type: sourceTemplate.type,
      content: sourceTemplate.content,
      aiPrompt: sourceTemplate.aiPrompt,
      isSystemTemplate: false,
      metadata: {
        ...sourceTemplate.metadata,
        description: args.description,
        useCount: 0,
        createdBy: identity.subject,
      },
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Track template usage
export const trackTemplateUsage = mutation({
  args: {
    templateId: v.id("templates"),
    workspaceId: v.id("workspaces"),
    documentId: v.id("knowledgeBase"),
    success: v.optional(v.boolean()),
    feedback: v.optional(v.string()),
    completionTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    // Update template metadata
    await ctx.db.patch(args.templateId, {
      metadata: {
        ...template.metadata,
        useCount: (template.metadata.useCount || 0) + 1,
        lastUsed: Date.now(),
      }
    });

    // Record usage details
    return await ctx.db.insert("templateUsage", {
      templateId: args.templateId,
      workspaceId: args.workspaceId,
      userId: identity.subject,
      usedAt: Date.now(),
      documentId: args.documentId,
      metadata: {
        success: args.success ?? true,
        feedback: args.feedback,
        completionTime: args.completionTime,
      },
    });
  },
});

// Add this new mutation for creating a blank template
export const createBlankTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await validateWorkspaceAccess(ctx.db, identity.subject, args.workspaceId);

    const now = Date.now();
    return await ctx.db.insert("templates", {
      workspaceId: args.workspaceId,
      title: "Untitled Template",
      type: "custom",
      content: `# [Template Title]

## Overview
[Brief description of what this template is for]

## Sections
### Section 1
[Content for section 1]

### Section 2
[Content for section 2]

## Usage Guidelines
[Instructions on how to use this template]`,
      aiPrompt: "Help create a custom template following the structure above.",
      isSystemTemplate: false,
      metadata: {
        description: "A custom template",
        version: "1.0.0",
        useCount: 0,
        createdBy: identity.subject,
        tags: [],
        category: "custom",
        status: "draft",
      },
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const initializeSystemTemplates = mutation({
  handler: async (ctx) => {
    // Delete all existing system templates
    const existingTemplates = await ctx.db
      .query("templates")
      .withIndex("by_system")
      .filter(q => q.eq(q.field("isSystemTemplate"), true))
      .collect();

    // Delete existing system templates
    for (const template of existingTemplates) {
      await ctx.db.delete(template._id);
    }

    console.log("Deleted existing templates:", existingTemplates.length);

    // Insert all templates from SYSTEM_TEMPLATES
    for (const [_, template] of Object.entries(SYSTEM_TEMPLATES)) {
      await ctx.db.insert("templates", {
        title: template.title,
        type: template.type as any, // Allow all new template types
        content: template.content,
        aiPrompt: template.aiPrompt,
        isSystemTemplate: true,
        metadata: {
          ...template.metadata,
          tags: [...template.metadata.tags],
          status: "published" as const,
        },
        workspaceId: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    console.log("Inserted new templates:", Object.keys(SYSTEM_TEMPLATES).length);
  }
});

export const deleteTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await validateWorkspaceAccess(ctx.db, identity.subject, args.workspaceId);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    
    // Only allow deletion of non-system templates
    if (template.isSystemTemplate) {
      throw new Error("Cannot delete system templates");
    }

    await ctx.db.delete(args.templateId);
    return args.templateId;
  },
});

export const getTemplate = query({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    return template;
  },
});

export const updateTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    aiPrompt: v.optional(v.string()),
    metadata: v.optional(v.object({
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      version: v.string(),
      useCount: v.number(),
      category: v.optional(v.string()),
      status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    if (template.isSystemTemplate) {
      throw new Error("Cannot update system templates");
    }

    const updates: any = {
      updatedAt: Date.now(),
      ...(args.title && { title: args.title }),
      ...(args.content && { content: args.content }),
      ...(args.aiPrompt && { aiPrompt: args.aiPrompt }),
      ...(args.metadata && { metadata: args.metadata }),
    };

    return await ctx.db.patch(args.templateId, updates);
  },
}); 
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.storage.generateUploadUrl();
    }
});

export const saveUploadedFile = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileType: v.union(
            v.literal("pdf"),
            v.literal("docx"),
            v.literal("csv"),
            v.literal("json"),
            v.literal("md"),
            v.literal("txt"),
            v.literal("ppt"),
            v.literal("image")
        ),
        fileSize: v.number(),
        metadata: v.optional(v.object({
            description: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
            originalName: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("knowledgeBase", {
            workspaceId: args.workspaceId,
            type: args.fileType,
            title: args.fileName,
            content: "", // Empty for files
            storageId: args.storageId,
            fileSize: args.fileSize,
            isSystemTemplate: false,
            metadata: args.metadata,
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now())
        });
    }
});

export const getStorageById = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx: any, args: any) => {
        return await ctx.db.system.query("_storage")
            .filter((q: any) => q.eq(q.field("_id"), args.storageId))
            .first();
    },
});

export const getStorageURL = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx: any, args: any) => {
        return await ctx.storage.getUrl(args.storageId)
    },
});

export const getDocumentById = query({
    args: {
        documentId: v.id("knowledgeBase")
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.documentId);
    }
});

export const deleteDocument = mutation({
    args: {
        documentId: v.id("knowledgeBase")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const doc = await ctx.db.get(args.documentId);
        if (!doc) throw new Error("Document not found");

        // If document was deleted more than 30 days ago, permanently delete
        if (doc.isDeleted && doc.deletedAt) {
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            if (doc.deletedAt < thirtyDaysAgo) {
                await ctx.db.delete(args.documentId);
            }
        }
    }
});

export const saveDocument = mutation({
    args: {
        projectId: v.id("projects"),
        storageId: v.id("_storage"),
        summaryId: v.id("_storage"),
        size: v.number(),
        filename: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const document = await ctx.db.insert("documents", {
            projectId: args.projectId,
            storageId: args.storageId,
            summaryId: args.summaryId,
            filename: args.filename || "",
            size: args.size,
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now()),
        });

        return document;
    },
});

export const getDocuments = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const documents = await ctx.db
            .query("knowledgeBase")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("isDeleted"), false),
                    q.eq(q.field("isDeleted"), undefined)
                )
            )
            .order("desc")
            .collect();

        return documents;
    },
});

export const getSummaryByProjectId = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const documents = await ctx.db
            .query("knowledgeBase")
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
            .collect();

        return Promise.all(
            documents.map(async (document) => ({
                ...document,
                url: document.content
            }))
        );

    },
});

export const createDocument = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        title: v.string(),
        content: v.string(),
        type: v.union(
            v.literal("prd"),
            v.literal("funcReq"),
            v.literal("useCase"),
            v.literal("document"),
            v.literal("other"),
            v.literal("epic"),
            v.literal("feature"),
            v.literal("userStory"),
            v.literal("srs"),
            v.literal("techSpec"),
            v.literal("testPlan"),
            v.literal("releaseNotes"),
        ),
        metadata: v.optional(v.object({
            description: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
            relatedDocs: v.optional(v.array(v.id("knowledgeBase")))
        }))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("knowledgeBase", {
            workspaceId: args.workspaceId,
            type: "document",
            title: args.title,
            content: args.content,
            isSystemTemplate: false,
            metadata: args.metadata,
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now())
        });
    }
});

export const updateDocument = mutation({
    args: {
        documentId: v.id("knowledgeBase"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        metadata: v.optional(v.object({
            description: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
            relatedDocs: v.optional(v.array(v.id("knowledgeBase")))
        }))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const update: any = {
            updatedAt: BigInt(Date.now())
        };
        if (args.title) update.title = args.title;
        if (args.content) update.content = args.content;
        if (args.metadata) update.metadata = args.metadata;

        return await ctx.db.patch(args.documentId, update);
    }
});

export const searchDocuments = query({
    args: {
        workspaceId: v.id("workspaces"),
        searchTerm: v.string(),
    },
    handler: async (ctx, args) => {
        const documents = await ctx.db
            .query("knowledgeBase")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("title"), args.searchTerm),
                    q.eq(q.field("content"), args.searchTerm)
                )
            )
            .collect();

        return documents;
    }
});

export const getRecent = query({
    args: { limit: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("knowledgeBase")
            .order("desc")
            .take(args.limit);
    },
});

export const moveToTrash = mutation({
    args: {
        documentId: v.id("knowledgeBase")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.patch(args.documentId, {
            isDeleted: true,
            deletedAt: BigInt(Date.now())
        });
    }
});

export const restoreFromTrash = mutation({
    args: {
        documentId: v.id("knowledgeBase")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.patch(args.documentId, {
            isDeleted: false,
            deletedAt: undefined
        });
    }
});

export const getTrashItems = query({
    args: {
        workspaceId: v.id("workspaces")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const items = await ctx.db
            .query("knowledgeBase")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("isDeleted"), true))
            .collect();

        console.log("Trash query results:", {
            workspaceId: args.workspaceId,
            itemsFound: items.length,
            items: items
        });

        return items;
    }
});

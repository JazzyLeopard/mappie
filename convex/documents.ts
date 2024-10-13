
import { action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const storeFile = action({
    args: {
        fileBuffer: v.string(), // Assuming fileBuffer is a base64-encoded string
    },
    handler: async (ctx, args) => {
        // Convert the base64-encoded string into a binary Buffer
        const binaryData = Uint8Array.from(atob(args.fileBuffer), (c) => c.charCodeAt(0));

        // Convert the Buffer into a Blob (required by ctx.storage.store)
        const blob = new Blob([binaryData]);

        // Store the file in Convex storage
        const storageId: Id<"_storage"> = await ctx.storage.store(blob);

        console.log("File stored in Convex storage with storageId:", storageId);

        // Return the storageId to the frontend
        return storageId;
    },
});


export const saveDocument = mutation({
    args: {
        projectId: v.id("projects"),
        storageId: v.id("_storage"),
        summarizedContent: v.string(),
        filename: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const document = await ctx.db.insert("documents", {
            projectId: args.projectId,
            storageId: args.storageId,
            summarizedContent: args.summarizedContent,
            filename: args.filename || "",
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now()),
        });

        console.log("Document saved", document);

        return document;
    },
});




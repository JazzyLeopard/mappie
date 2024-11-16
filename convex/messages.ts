import { Message } from 'ai';
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { nanoid } from 'nanoid';

export const getChatHistory = query({
  args: {
    itemId: v.string(),
    itemType: v.string(),
    projectId: v.id("projects")
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("itemId"), args.itemId))
      .filter(q => q.eq(q.field("itemType"), args.itemType))
      .filter(q => q.eq(q.field("projectId"), args.projectId))
      .order("desc")
      .first();
    
    return messages;
  }
});

export const storeChatHistory = mutation({
  args: {
    itemId: v.string(),
    itemType: v.string(),
    projectId: v.id('projects'),
    messages: v.array(
      v.object({
        content: v.string(),
        role: v.union(
          v.literal('system'),
          v.literal('user'),
          v.literal('assistant'),
          v.literal('function'),
          v.literal('data'),
          v.literal('tool')
        ),
        id: v.optional(v.string()),
        toolInvocations: v.optional(
          v.array(
            v.object({
              toolName: v.string(),
              toolCallId: v.string(),
              state: v.string(),
              args: v.optional(v.object({
                content: v.string(),
                metadata: v.optional(
                  v.object({
                    title: v.optional(v.string()),
                    type: v.optional(v.string())
                  })
                )
              })),
              result: v.optional(v.object({
                content: v.string(),
                metadata: v.optional(
                  v.object({
                    title: v.optional(v.string()),
                    type: v.optional(v.string())
                  })
                )
              }))
            })
          )
        )
      })
    )
  },
  handler: async (ctx, args) => {
    const now = BigInt(Date.now());
    
    // Transform messages to ensure all required fields are present
    const transformedMessages = args.messages.map(message => ({
      id: message.id || nanoid(),
      content: message.content,
      role: message.role,
      toolInvocations: message.toolInvocations?.map(invocation => ({
        toolName: invocation.toolName,
        toolCallId: invocation.toolCallId,
        state: invocation.state || 'completed',
        result: invocation.args ? {
          content: invocation.args.content,
          metadata: invocation.args.metadata
        } : undefined,
        args: undefined
      }))
    }));

    const existingRecord = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("itemId"), args.itemId))
      .filter(q => q.eq(q.field("itemType"), args.itemType))
      .filter(q => q.eq(q.field("projectId"), args.projectId))
      .first();

    if (existingRecord) {
      await ctx.db.patch(existingRecord._id, {
        messages: transformedMessages,
        updatedAt: now
      });
    } else {
      await ctx.db.insert('messages', {
        itemId: args.itemId,
        itemType: args.itemType,
        projectId: args.projectId,
        messages: transformedMessages,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
});
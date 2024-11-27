import { Message } from 'ai';
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { nanoid } from 'nanoid';

export const getChatHistory = query({
  args: {
    itemId: v.string(),
    itemType: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { itemId, itemType, projectId} = args;
    
    // Get only the most recent message history entry
    const latestMessage = await ctx.db
      .query("messages")
      .withIndex("by_itemId_and_type_and_created", q => 
        q.eq("itemId", itemId)
        .eq("itemType", itemType)
      )
      .order("desc")
      .first();

    return latestMessage;
  }
});

export const storeChatHistory = mutation({
  args: {
    itemId: v.string(),
    itemType: v.string(),
    projectId: v.id("projects"),
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
    const { itemId, itemType, projectId, messages } = args;

    // Get the latest message history for this item
    const existingHistory = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("itemId"), itemId))
      .order("desc")
      .first();

    if (existingHistory) {
      // Check if the last message in existing history matches our last message
      const existingLastMessage = existingHistory.messages[existingHistory.messages.length - 1];
      const newLastMessage = messages[messages.length - 1];
      
      if (existingLastMessage.id === newLastMessage.id) {
        // If the last messages match, no need to save
        return existingHistory;
      }
    }

    // Only save if we have new messages
    const result = await ctx.db.insert("messages", {
      itemId,
      itemType,
      projectId,
      messages: messages.map((msg: any) => ({
        ...msg,
        id: msg.id || nanoid()
      })),
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now())
    });

    return result;
  }
});
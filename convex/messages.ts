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
  handler: async (ctx: any, args: any) => {
    const { itemId, itemType, projectId } = args;

    // Get only the most recent message history entry
    const latestMessage = await ctx.db
      .query("messages")
      .withIndex("by_itemId_and_type_and_created", (q: any) =>
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
        tokens: v.optional(v.number()),
        toolInvocations: v.optional(v.array(v.object({
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
        })))
      })
    ),
    maxTokens: v.optional(v.number()),
    reservedTokens: v.optional(v.number())
  },
  handler: async (ctx: any, args: any) => {
    const { itemId, itemType, projectId, messages } = args;
    const maxTokens = args.maxTokens || 15000;
    const reservedTokens = args.reservedTokens || 1000;

    // Add token estimates to messages
    const messagesWithTokens = messages.map((msg: any) => ({
      ...msg,
      tokens: Math.ceil(msg.content.length / 4)
    }));

    // Truncate history if needed
    let totalTokens = messagesWithTokens.reduce((sum: number, msg: any) => sum + (msg.tokens || 0), 0);
    const availableTokens = maxTokens - reservedTokens;

    let truncatedMessages = [...messagesWithTokens];
    while (totalTokens > availableTokens && truncatedMessages.length > 2) {
      const startIndex = truncatedMessages[0].role === 'system' ? 1 : 0;
      const removedMessage = truncatedMessages.splice(startIndex, 1)[0];
      totalTokens -= (removedMessage.tokens || 0);
    }

    // Get existing history and update/insert as needed
    const existingHistory = await ctx.db
      .query("messages")
      .filter((q: any) => q.eq(q.field("itemId"), itemId))
      .order("desc")
      .first();

    if (existingHistory) {
      await ctx.db.patch(existingHistory._id, {
        messages: truncatedMessages.map(({tokens, ...msg}) => msg),
        updatedAt: BigInt(Date.now())
      });
      return existingHistory;
    } else {
      return await ctx.db.insert("messages", {
        itemId,
        itemType,
        projectId,
        messages: truncatedMessages.map(({tokens, ...msg}) => ({
          ...msg,
          id: msg.id || nanoid()
        })),
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now())
      });
    }
  }
});
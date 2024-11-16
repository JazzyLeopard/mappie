import { tool } from 'ai';
import { z } from 'zod';

export const displayMarkdown = tool({
  description: 'Display formatted markdown content',
  parameters: z.object({
    content: z.string().describe('The markdown content to display'),
    metadata: z.object({
      title: z.string().optional(),
      type: z.string().optional()
    }).optional()
  }),
  execute: async ({ content, metadata }: { content: string, metadata?: { title?: string, type?: string } }) => {
    return { content, metadata };
  }
});

export const tools = {
  displayMarkdown
}; 
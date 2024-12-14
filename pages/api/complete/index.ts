// pages/api/complete/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { useContextChecker } from "@/utils/useContextChecker";
import { Id } from '@/convex/_generated/dataModel';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, projectId, selectedText } = req.body;
  const convexProjectId = projectId as Id<"projects">;

  if (!prompt || !projectId) {
    return res.status(400).json({
      error: 'Missing required fields: prompt or projectId',
    });
  }

  try {
    // Get project context
    const context = await useContextChecker({ projectId: convexProjectId });

    const aiPrompt = `${context}

You are an experienced technical writer and business analyst. Based on the following context and user request, generate content in markdown format.

${selectedText ? `Selected text for context:\n${selectedText}\n` : ''}

User request: ${prompt}

Important Guidelines:
- Provide the response in proper markdown format
- Use appropriate headings, lists, and emphasis
- Be comprehensive yet concise
- Consider the project context in your response
- Maintain professional technical writing standards`;

    const completions = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        { 
          role: "system", 
          content: "You are an experienced technical writer and business analyst specializing in software documentation." 
        },
        { role: "user", content: aiPrompt }
      ],
      temperature: 0.7,
    });

    // Clean up the response
    const cleanResponse = completions.text
      .replace(/```markdown\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return res.status(200).json({ response: cleanResponse });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

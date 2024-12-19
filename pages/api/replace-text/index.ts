import type { NextApiRequest, NextApiResponse } from 'next';
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { newContent, existingText } = req.body;

  try {
    // First, get the section to replace and its replacement
    const sectionPrompt = `Analyze the existing text and find the most appropriate section to replace with the new content. Return only a JSON object with two fields:
    1. 'replacedSection': the exact section from the existing text that should be replaced
    2. 'newSection': the new content properly formatted as markdown

    Existing text:
    ${existingText}

    New content to integrate:
    ${newContent}

    Important: Ensure both sections maintain proper markdown formatting with correct headings, lists, and emphasis.`;

    const completion = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        {
          role: "system",
          content: "You are a markdown formatting expert. Return only a clean JSON object without any code block syntax or additional formatting."
        },
        { role: "user", content: sectionPrompt }
      ],
    });

    // Clean up any potential markdown or code block indicators
    const cleanedResponse = completion.text.replace(/```json\s*|\s*```/g, '').trim();
    const result = JSON.parse(cleanedResponse);

    // Format both sections to ensure consistent markdown
    const formattingPrompt = `Format these sections as proper markdown, maintaining all headings, lists, and emphasis:

    Section 1:
    ${result.replacedSection}

    Section 2:
    ${result.newSection}`;

    const formattingCompletion = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        {
          role: "system",
          content: "You are a markdown formatting expert. Return a JSON object with 'replacedSection' and 'newSection' fields, both properly formatted as markdown."
        },
        { role: "user", content: formattingPrompt }
      ],
    });

    const formattedResult = JSON.parse(formattingCompletion.text.replace(/```json\s*|\s*```/g, '').trim());

    return res.status(200).json({
      replacedSection: formattedResult.replacedSection,
      newSection: formattedResult.newSection
    });

  } catch (error) {
    console.error('Error in text replacement:', error);
    return res.status(500).json({ error: 'Failed to process text replacement' });
  }
} 
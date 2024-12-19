import { placeholderOverview } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { useContextChecker } from "@/utils/useContextChecker";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { prompt, projectId, language } = req.body;

    const context = await useContextChecker({ projectId });

    if (!prompt || !projectId || !language) {
      return res.status(400).json({ error: 'Prompt, projectId, and language are required' });
    }

    try {
      let promptWithPropertyInstructions = context

      promptWithPropertyInstructions += `Generate a comprehensive project overview and a concise title (maximum 5 words) based on the following description: ${prompt}.

Use this exact template structure for the overview, replacing the placeholders with relevant content in ${language}:

${placeholderOverview}

Return the response in the following format (without any markdown code block formatting):
{
  "title": "The generated title here",
  "overview": "The filled out template in markdown format here"
}

Important: 
1. Keep all emojis and formatting from the template
2. Replace only the placeholder text in square brackets
3. Return ONLY the JSON object without any markdown formatting or code block indicators
4. Maintain the exact same structure and headings as the template`;

      console.log("Calling OpenAi Api...");

      const completions = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        messages: [
          { role: "system", content: "You are an experienced agile business analyst with senior level UX experience that generates a comprehensive project overview based on user prompts." },
          { role: "user", content: promptWithPropertyInstructions }
        ],
      });
      console.log("OpenAi response received");

      // Clean up the response text before parsing
      const cleanResponse = completions.text
        .replace(/```json\n?/g, '')  // Remove ```json
        .replace(/```\n?/g, '')      // Remove closing ```
        .trim();                     // Remove any extra whitespace

      try {
        const parsedResponse = JSON.parse(cleanResponse);
        const { title, overview } = parsedResponse;

        if (!title || !overview) {
          throw new Error('Invalid response format');
        }

        // Update the project with both title and overview
        await convex.mutation(api.projects.updateProject, {
          _id: projectId,
          title: title,
          overview: overview,
        });

        return res.status(200).json({ message: 'Project overview generated and updated successfully' });
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }
    } catch (error) {
      console.error('Error generating project overview:', error);
      return res.status(500).json({ error: 'Failed to generate project overview' });
    }
  }

  // Handle other HTTP methods...
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

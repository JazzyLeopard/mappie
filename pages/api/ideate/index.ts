import { ideatePrompts, placeholderOverview } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { prompt, projectId } = req.body;

    if (!prompt || !projectId) {
      return res.status(400).json({ error: 'Prompt and projectId are required' });
    }

    try {
      const promptWithPropertyInstructions = `Generate a comprehensive project overview based on the following description: ${prompt}. 
      Ensure the response is in markdown format in the language of the prompt. 
      Use the ${placeholderOverview} object to guide the generation of the overview.`;

      console.log("Calling OpenAi Api...");

      const completions = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          { role: "system", content: "You are an experienced agile business analyst with senior level UX experience that generates a comprehensive project overview based on user prompts." },
          { role: "user", content: promptWithPropertyInstructions }
        ],
      });
      console.log("OpenAi response received");

      const generatedContent = completions.text || '';

      // Update the project with the generated Overview
      await convex.mutation(api.projects.updateProject, {
        _id: projectId,
        overview: generatedContent,
      });

      return res.status(200).json({ message: 'Project overview generated and updated successfully' });
    } catch (error) {
      console.error('Error generating project overview:', error);
      return res.status(500).json({ error: 'Failed to generate project overview' });
    }
  }

  // Handle other HTTP methods...
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

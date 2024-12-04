import { ideatePrompts } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function extractJSONFromResponse(response: string): string {
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  return jsonMatch ? jsonMatch[1] : response;
}

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
      const relevantPrompts = ["overview", "problemStatement", "userPersonas", "featuresInOut"];
      const promptWithPropertyInstructions = `Generate a comprehensive project overview based on the following description: ${prompt}. 
      Ensure the response is in valid JSON format with a single "Overview" field that includes all relevant details. 
      Use the following instructions for each element:
      ${relevantPrompts.map(key => `For ${key}: ${ideatePrompts[key]}`).join('\n')}
      Provide the Overview as a single string in JSON format.`;

      console.log("Calling OpenAi Api...");

      const completions = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          { role: "system", content: "You are an experienced agile business analyst that generates a comprehensive project overview based on user prompts." },
          { role: "user", content: promptWithPropertyInstructions }
        ],
      });
      console.log("OpenAi response received");

      let generatedContent;
      try {
        const jsonString = extractJSONFromResponse(completions.text || '{}');
        generatedContent = JSON.parse(jsonString);

        console.log('Parsed data:', JSON.stringify(generatedContent, null, 2))
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw AI response:', completions.text);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }

      // Ensure the Overview field is a string
      if (Array.isArray(generatedContent.Overview)) {
        generatedContent.Overview = generatedContent.Overview.join('\n');
      } else if (typeof generatedContent.Overview !== 'string') {
        generatedContent.Overview = String(generatedContent.Overview);
      }

      // Update the project with the generated Overview
      await convex.mutation(api.projects.updateProject, {
        _id: projectId,
        overview: generatedContent.Overview,
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

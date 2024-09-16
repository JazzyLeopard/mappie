import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { propertyPrompts } from "@/app/(main)/_components/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convertToMarkdown(content: Record<string, string>): Record<string, string> {
  const markdownContent: Record<string, string> = {};
  for (const [key, value] of Object.entries(content)) {
    if (key === 'title') {
      markdownContent[key] = value;
    } else {
      const lines = value.split('\n');
      if (lines.length > 1) {
        markdownContent[key] = `# ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n${lines.map(line => `- ${line}`).join('\n')}`;
      } else {
        markdownContent[key] = `# ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n${value}`;
      }
    }
  }
  return markdownContent;
}

function extractJSONFromResponse(response: string): string {
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
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
      const relevantPrompts = ['description', 'objectives', 'requirements', 'stakeholders'];
      const promptWithPropertyInstructions = `Generate a project based on the following description: ${prompt}. 
      For each field, use the following instructions:
      ${relevantPrompts.map(key => `For ${key}: ${propertyPrompts[key]}`).join('\n')}
      Provide a title, description, objectives, requirements, and stakeholders as strings in JSON format. Ensure that all fields are strings, not arrays. If you need to provide multiple items for a field, separate them with newlines within the string.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an experienced agile business analyst that generates project details based on user prompts." },
          { role: "user", content: promptWithPropertyInstructions }
        ],
      });

      let generatedContent;
      try {
        const jsonString = extractJSONFromResponse(completion.choices[0].message.content || '{}');
        generatedContent = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw AI response:', completion.choices[0].message.content);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }

      // Ensure all fields are strings
      for (const key in generatedContent) {
        if (Array.isArray(generatedContent[key])) {
          generatedContent[key] = generatedContent[key].join('\n');
        } else if (typeof generatedContent[key] !== 'string') {
          generatedContent[key] = String(generatedContent[key]);
        }
      }

      // Convert content to Markdown format
      const markdownContent = convertToMarkdown(generatedContent);

      // Update the project with all generated content in Markdown format
      await convex.mutation(api.projects.updateProject, { 
        _id: projectId,
        ...markdownContent,
      });

      return res.status(200).json({ message: 'Project details generated and updated successfully' });
    } catch (error) {
      console.error('Error generating project details:', error);
      return res.status(500).json({ error: 'Failed to generate project details' });
    }
  }

  // Handle other HTTP methods...
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

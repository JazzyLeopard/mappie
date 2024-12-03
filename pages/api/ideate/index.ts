import { ideatePrompts } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convertToMarkdown(content: Record<string, string>): Record<string, string> {
  const markdownContent: Record<string, string> = {};

  for (const [key, value] of Object.entries(content)) {
    // Capitalize the key for display purposes
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);

    // Format the content based on the key
    if (key === 'title') {
      markdownContent[key] = value.trim(); // Keep title as is
    } else {
      // Prepare formatted content
      let formattedValue = `${formattedKey}:\n\n${value.trim()}`;

      // Handle specific formatting for goals and objectives or other sections
      if (formattedKey === 'Goals and Objectives' || formattedKey === 'Key Stakeholders') {
        const lines = value.split('\n').map(line => line.trim()).filter(line => line); // Split and trim lines
        formattedValue += '\n\n' + lines.map((line, index) => `${index + 1}. ${line}`).join('\n'); // Numbered list
      }
      if (formattedKey === 'Current Situation' || formattedKey === 'Pain Points' || formattedKey === 'Opportunity') {
        const lines = value.split('\n').map(line => line.trim()).filter(line => line); // Split and trim lines
        formattedValue += '\n\n' + lines.join('\n\n'); // Separate paragraphs with double line breaks
      }
      if (formattedKey === 'Features In' || formattedKey === 'Features Out') {
        const lines = value.split('\n').map(line => line.trim()).filter(line => line); // Split and trim lines
        formattedValue += '\n\n' + lines.join('\n\n'); // Separate paragraphs with double line breaks
      }
      markdownContent[key] = formattedValue;
    }
  }

  return markdownContent;
}

function extractJSONFromResponse(response: string): string {
  // const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
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
      const promptWithPropertyInstructions = `Generate a project based on the following description: ${prompt}. 
      Ensure the response is in valid JSON format with double-quoted property keys being bold and values also ensure that the generated response follows the exact example template with each attribute as given in the ${ideatePrompts} for each field. 
      For each field, use the following instructions:
      ${relevantPrompts.map(key => `For ${key}: ${ideatePrompts[key]}`).join('\n')}
      Provide a Title, Overview, Problem statement, User Personas, Features In/Out as strings in JSON format. Ensure that all fields are strings, not arrays. If you need to provide multiple items for a field, separate them with newlines within the string.`;

      console.log("Calling OpenAi Api...");
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-4o-mini",
      //   messages: [
      //     { role: "system", content: "You are an experienced agile business analyst that generates project details based on user prompts." },
      //     { role: "user", content: promptWithPropertyInstructions }
      //   ],
      // });
      const completions = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          { role: "system", content: "You are an experienced agile business analyst that generates project details based on user prompts." },
          { role: "user", content: promptWithPropertyInstructions }
        ],
      })
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

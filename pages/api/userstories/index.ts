import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getAuth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convertUsDescriptionToMarkdown(story: any): string {
  let markdown = '';

  // Split the description into parts
  const descriptionParts = story.description.split('\n\n');
  const userStoryFormat = descriptionParts[0]; // "As a..., I want..., so that..."
  const explanation = descriptionParts[1]; // Additional explanation

  // Add user story format with proper styling
  const [asA, iWant, soThat] = userStoryFormat.split(', ');
  markdown += `${asA},\n\n`;
  markdown += `${iWant},\n\n`;
  markdown += `${soThat}\n\n`;
  
  if (explanation) {
    markdown += `${explanation}\n\n`;
  }

  // Acceptance Criteria with proper formatting
  if (story.acceptance_criteria && Array.isArray(story.acceptance_criteria)) {
    markdown += `# Acceptance Criteria\n\n`;
    story.acceptance_criteria.forEach((criteria: string) => {
      const parts = criteria.match(/Scenario \d+: \*\*Given\*\* (.*?), \*\*when\*\* (.*?), \*\*then\*\* (.*)/);
      if (parts) {
        markdown += `## ${parts[0].split(':')[0]}\n\n`; // Scenario X
        markdown += `**Given** ${parts[1]},\n\n`;
        markdown += `**when** ${parts[2]},\n\n`;
        markdown += `**then** ${parts[3]}\n\n`;
      }
    });
  }

  // Additional Considerations
  if (story.additional_considerations && Array.isArray(story.additional_considerations)) {
    markdown += `# Additional Considerations\n\n`;
    story.additional_considerations.forEach((consideration: string) => {
      markdown += `- ${consideration}\n`;
    });
    markdown += '\n';
  }

  return markdown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { projectId, epicId } = req.body;

  try {
    // Authentication
    const { userId, getToken } = getAuth(req);
    const token = await getToken({ template: "convex" });

    if (!token || !userId) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    convex.setAuth(token);
    const convexEpicId = epicId as Id<"epics">;

    const context = await useContextChecker({ projectId })
    console.log("context", context);

    const epic = await convex.query(api.epics.getEpicById, { epicId: convexEpicId });

    if (!epic) {
      return res.status(400).json({ message: "Epic not found" });
    }

    const epicText = epic.description;

    let userStoryBasePrompt = `You are an expert product owner responsible for creating high-quality, well-scoped user stories from a given epic and its related feature. Your goal is to ensure that each user story delivers tangible value, adheres to agile best practices, and is implementable within a sprint.

          ### Instructions:
          1. **Adhere to the INVEST Principles**:
            - Independent, Negotiable, Valuable, Estimable, Small, and Testable.

          2. **Story Format**:
            Write each user story in the following JSON structure:

          {
            "title": "User Story Title",
            "description": "As a [type of user], I want to [perform some action], so that [achieve some goal/value].",
            
            "acceptance_criteria": [
              "Scenario 1: **Given** [precondition], **when** [action], **then** [expected outcome].",
              "Scenario 2: **Given** [precondition], **when** [action], **then** [expected outcome].",
              [More if necessary]"
            ],

            "additional_considerations": [
              "Security requirements for [specific functionality]",
              "Performance considerations for [specific aspect]",
              "Dependencies on [other system/module]",
              "Compliance with [specific standards or policies]",
              "Error handling for [specific failure cases]"
            ]
          }`

    let userStoryPrompt = `Given the following project context:\n${context}\n\n`;
    userStoryPrompt += `For this specific epic:\n${epicText}\n\n`;
    userStoryPrompt += `Generate a focused set of user stories that directly implement this epic's functionality. Each user story should follow this exact structure and format:\n${userStoryBasePrompt}\n\n`;
    userStoryPrompt += `Important guidelines:
    - Generate only 3-5 high-quality, comprehensive user stories
    - Each story must directly contribute to implementing the epic's functionality
    - Stories should be independent but related through the epic's goal
    - Each description MUST follow the format: "As a [user], I want to [action], so that [benefit]"
    - Include a detailed explanation after the user story format
    - Include detailed acceptance criteria with clear given/when/then scenarios
    - Focus on delivering complete, testable functionality
    - Consider edge cases and error states
    - Include relevant technical and non-functional requirements
    - Format the output as a JSON array of user story objects

    Generate the user stories now.`;

    console.log("Calling OpenAI Api...");
    const response = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "user", content: userStoryPrompt }],
      temperature: 0.7,
    });
    console.log('OpenAI API response received');

    const userStoryContent = response.text;
    if (!userStoryContent) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Parsing OpenAI response...');

    // Extract JSON from Markdown code block
    const jsonMatch = userStoryContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in the response');
    }
    const jsonContent = jsonMatch[1];

    let generatedUserStories;
    try {
      generatedUserStories = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response for user stories:', parseError);
      console.log('Raw OpenAI response', userStoryContent);
      return res.status(500).json({ message: 'Invalid JSON response from OpenAI for user stories', parseError })
    }

    console.log("Creating user stories...");

    const formattedUserStories = generatedUserStories.map((userStory: any) => {
      if (userStory && userStory?.description) {
        return {
          title: userStory?.title || 'Untitled User Story',
          description: convertUsDescriptionToMarkdown(userStory)
        };
      }
      console.warn('Skipping invalid user story:', userStory);
      return null;
    }).filter(Boolean);

    if (formattedUserStories.length < 3 || formattedUserStories.length > 5) {
      console.warn(`Generated ${formattedUserStories.length} stories, which is outside the desired range of 3-5`);
    }

    console.log("User stories created successfully");

    res.status(200).json({ userStories: formattedUserStories, type: 'userstories' });
  } catch (error) {
    console.error('Error generating user stories:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating user stories', error: error instanceof Error ? error.message : String(error) });
  }
}

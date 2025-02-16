import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { anthropic } from "@ai-sdk/anthropic";
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

    const context = await useContextChecker({ 
      projectId: projectId,
      token 
    });

    if (!context) {
      return res.status(400).json({ message: 'Failed to get project context' });
    }

    const epic = await convex.query(api.epics.getEpicById, { epicId: convexEpicId });

    if (!epic) {
      return res.status(400).json({ message: "Feature not found" });
    }

    const epicText = epic.description;

    let userStoryBasePrompt = `You are an expert product owner responsible for creating high-quality, well-scoped user stories from a given epic and its related feature. Your goal is to ensure that each user story delivers tangible value, adheres to agile INVEST best practices, and is implementable within a sprint.

          ### Instructions:
          1. **Adhere to the INVEST Principles**:
            - Independent, Negotiable, Valuable, Estimable, Small, and Testable.
            - If you need to split up stories into multiple stories, do so, to ensure that each story is independent and can be implemented within a sprint. They should not be complex and there should be a clear vertical slice of functionality.
            - Too many scenarios means the user story is too complex and should be split up. The story should focus on one main flow. 

          2. **Story Format**:
            Write each user story in the following JSON structure:

          {
            "title": "User Story Title",
            "description": "As a [type of user], I want to [perform some action], so that [achieve some goal/value].",
            
            "acceptance_criteria": [
              "Scenario 1: **Given** [precondition], **when** [action], **then** [expected outcome].",
              "Scenario 2: **Given** [precondition], **when** [action], **then** [expected outcome].",
              [More if necessary but still focus on one main flow]"
            ],

            "additional_considerations": [
              "Security requirements for [specific functionality]",
              "Performance considerations for [specific aspect]",
              "Dependencies on [other system/module]",
              "Compliance with [specific standards or policies]",
              "Error handling for [specific failure cases]"
            ]
          }`

    let userStoryPrompt = `Given the following Epic context:\n${context}\n\n`;
    userStoryPrompt += `For this specific feature:\n${epicText}\n\n`;
    userStoryPrompt += `Generate a focused set of user stories that directly implement this feature's functionality. Each user story should follow this exact structure and format:\n${userStoryBasePrompt}\n\n`;
    userStoryPrompt += `Important guidelines:
    - Generate as many stories as possible that are relevant to the feature and deliver end-to-end value and are easily codable and testable according to INVEST principles
    - Each story must directly contribute to implementing the feature's functionality
    - Stories should be independent but related through the feature's goal
    - Each description MUST follow the format: "As a [user], I want to [action], so that [benefit]"
    - Include a detailed explanation after the user story format
    - Include detailed acceptance criteria with clear given/when/then scenarios, but ensure they are not too complex. Too many scenarios means the user story is too complex and should be split up. The story should focus on one main flow. 
    - Focus on delivering complete, testable functionality
    - Consider edge cases and error states
    - Include relevant technical and non-functional requirements
    - Format the output as a JSON array of user story objects

    Generate the user stories now.`;

    console.log("Calling Anthropic API...");
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [{
        role: "user",
        content: userStoryPrompt + "\nIMPORTANT: Your response must be a valid JSON array wrapped in ```json``` code blocks."
      }],
      temperature: 0.7,
    });
    console.log('Anthropic API response received');

    const userStoryContent = response.text;
    if (!userStoryContent) {
      throw new Error('No content generated from Anthropic');
    }

    console.log('Raw Anthropic response:', userStoryContent);

    // Try to find JSON in different formats
    let jsonContent;
    const jsonMatch = userStoryContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // Try to find JSON without code blocks
      const possibleJson = userStoryContent.trim();
      try {
        // Validate if it's parseable JSON
        JSON.parse(possibleJson);
        jsonContent = possibleJson;
      } catch {
        // If not parseable, try to extract array portion
        const arrayMatch = possibleJson.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          jsonContent = arrayMatch[0];
        } else {
          throw new Error('No valid JSON found in the response');
        }
      }
    }

    let generatedUserStories;
    try {
      generatedUserStories = JSON.parse(jsonContent);

      // Ensure we have an array
      if (!Array.isArray(generatedUserStories)) {
        generatedUserStories = [generatedUserStories];
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.log('Attempted to parse content:', jsonContent);
      return res.status(500).json({
        message: 'Invalid JSON response from Claude',
        rawResponse: userStoryContent,
        parseError
      });
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
    res.status(error instanceof Error && error.message?.includes('Authentication') ? 401 : 500).json({
      message: 'Error generating user stories',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

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

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Add SSE validation
  const isSSE = req.headers.accept === 'text/event-stream';
  if (!isSSE) {
    sendEvent = () => {};
  }

  try {
    // Authentication
    const { userId, getToken } = getAuth(req);
    const token = await getToken({ template: "convex" });

    if (!token || !userId) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    convex.setAuth(token);
    const convexEpicId = epicId as Id<"epics">;

    sendEvent({ progress: 5, status: 'Authenticating...' });

    const context = await useContextChecker({ 
        projectId: projectId as Id<"projects">,
        token 
    });
    console.log("context", context);

    sendEvent({ progress: 15, status: 'Setting up connection...' });

    const epic = await convex.query(api.epics.getEpicById, { epicId: convexEpicId });

    if (!epic) {
      return res.status(400).json({ message: "Feature not found" });
    }

    const epicText = epic.description;

    // Fetch existing user stories to provide as context
    const existingUserStories = await convex.query(api.userstories.getUserStories, { projectId });
    const existingStoriesText = existingUserStories
      .filter((story: any) => story.epicId === epicId)
      .map((story: any) => story.description)
      .join('\n\n');

    let userStoryBasePrompt = `As an expert user stories analyst, generate one additional user story that complements the existing user stories and implements functionality described in this epic. The user story should be detailed and comprehensive, following this exact structure:

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

    let userStoryPrompt = `Given the following Epic context:\n${context}\n\n`;
    userStoryPrompt += `For this specific feature:\n${epicText}\n\n`;
    userStoryPrompt += `Existing user stories:\n${existingStoriesText}\n\n`;
    userStoryPrompt += `Generate one additional user story that complements the existing ones. The story should follow this exact structure and format:\n${userStoryBasePrompt}\n\n`;
    userStoryPrompt += `Important guidelines:
    - Generate only ONE high-quality, comprehensive user story
    - The story must directly contribute to implementing the feature's functionality
    - The story should complement existing stories but be independent
    - Description MUST follow the format: "As a [user], I want to [action], so that [benefit]"
    - Include a detailed explanation after the user story format
    - Include detailed acceptance criteria with clear given/when/then scenarios
    - Focus on delivering complete, testable functionality
    - Consider edge cases and error states
    - Include relevant technical and non-functional requirements
    - Format the output as a JSON array of user story objects

    Generate the user story now.`;

    console.log("Calling Anthropic Api...");
    sendEvent({ progress: 55, status: 'Generating user story...' });
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [{ role: "user", content: userStoryPrompt + "\nIMPORTANT: Your response must be a valid JSON array wrapped in ```json``` code blocks." }],
      temperature: 0.7,
    });
    console.log('Anthropic API response received');

    const userStoryContent = response.text;
    if (!userStoryContent) {
      throw new Error('No content generated from Anthropic');
    }

    console.log('Raw Anthropic response:', userStoryContent);

    // Extract JSON from Markdown code block
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

    let generatedUserStory;
    try {
      const parsedContent = JSON.parse(jsonContent);
      // Check if it's an array and take the first item
      generatedUserStory = Array.isArray(parsedContent) ? parsedContent[0] : parsedContent;
      
      // Validate the structure
      if (!generatedUserStory || !generatedUserStory.description || 
          !generatedUserStory.acceptance_criteria || 
          !generatedUserStory.additional_considerations) {
          console.error('Invalid user story structure:', generatedUserStory);
          throw new Error('Generated user story does not match required format');
      }
    } catch (parseError) {
      console.error('Error parsing Anthropic response:', parseError);
      console.log('Raw content:', userStoryContent);
      console.log('Attempted to parse:', jsonContent);
      throw new Error('Failed to parse generated user story');
    }

    if (generatedUserStory && generatedUserStory?.description) {
      const formattedUserStory = {
        title: generatedUserStory?.title || 'Untitled User Story',
        description: convertUsDescriptionToMarkdown(generatedUserStory)
      };

      console.log("User story created successfully");
      sendEvent({ progress: 100, status: 'Complete!' });
      res.status(200).json({ userStory: formattedUserStory, type: 'userstory' });
    } else {
      throw new Error('Invalid user story format received from OpenAI');
    }
  } catch (error) {
    console.error('Error generating user story:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating user story', error: error instanceof Error ? error.message : String(error) });
  }
}

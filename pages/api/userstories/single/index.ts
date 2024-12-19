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

    const context = await useContextChecker({ projectId })
    console.log("context", context);

    const epic = await convex.query(api.epics.getEpicById, { epicId: convexEpicId });

    if (!epic) {
      return res.status(400).json({ message: "Epic not found" });
    }

    const epicText = epic.description;

    // Fetch existing user stories to provide as context
    const existingUserStories = await convex.query(api.userstories.getUserStories, { projectId });
    const existingStoriesText = existingUserStories
      .filter((story: any) => story.epicId === epicId)
      .map((story: any) => story.description)
      .join('\n\n');

    let userStoryBasePrompt = `As an expert user stories analyst, generate one additional user story that complements the existing user stories and implements functionality described in this epic. The user story should be detailed and comprehensive, following this exact structure:
    {
      "title": "User Story Title",
      "description": "As a [type of user], I want to [perform some action], so that [achieve some goal/value].\n\nThis user story focuses on [detailed explanation of the functionality and its importance in the context of the epic].",
      
      "acceptance_criteria": [
        "Scenario 1: **Given** I am on the registration page, **when** I enter valid personal details and click Submit, **then** I should receive a confirmation email with an activation link",
        "Scenario 2: **Given** I am on the registration page, **when** I submit the form with an already registered email, **then** I should see an error message saying Email is already registered. Please log in.",
        "Scenario 3: **Given** I have received a confirmation email, **when** I click the activation link, **then** my account should be activated and I should be able to log in"
      ],

      "additional_considerations": [
        "Security requirements for password strength",
        "Email validation format",
        "Rate limiting for registration attempts",
        "Data privacy compliance",
        "Accessibility standards"
      ]
    }`

    let userStoryPrompt = `Given the following project context:\n${context}\n\n`;
    userStoryPrompt += `For this specific epic:\n${epicText}\n\n`;
    userStoryPrompt += `Existing user stories:\n${existingStoriesText}\n\n`;
    userStoryPrompt += `Generate one additional user story that complements the existing ones. The story should follow this exact structure and format:\n${userStoryBasePrompt}\n\n`;
    userStoryPrompt += `Important guidelines:
    - Generate only ONE high-quality, comprehensive user story
    - The story must directly contribute to implementing the epic's functionality
    - The story should complement existing stories but be independent
    - Description MUST follow the format: "As a [user], I want to [action], so that [benefit]"
    - Include a detailed explanation after the user story format
    - Include detailed acceptance criteria with clear given/when/then scenarios
    - Focus on delivering complete, testable functionality
    - Consider edge cases and error states
    - Include relevant technical and non-functional requirements
    - Format the output as a JSON object (not an array)

    Generate the user story now.`;

    console.log("Calling OpenAI Api...");
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
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

    let generatedUserStory;
    try {
      generatedUserStory = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response for user story:', parseError);
      console.log('Raw OpenAI response', userStoryContent);
      return res.status(500).json({ message: 'Invalid JSON response from OpenAI for user story', parseError })
    }

    if (generatedUserStory && generatedUserStory?.description) {
      const formattedUserStory = {
        title: generatedUserStory?.title || 'Untitled User Story',
        description: convertUsDescriptionToMarkdown(generatedUserStory)
      };

      console.log("User story created successfully");
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

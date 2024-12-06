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


  // Main description
  if (story.description) {
    markdown += `${story.description}\n\n`;
  }

  // Acceptance Criteria
  if (story.acceptance_criteria && Array.isArray(story.acceptance_criteria)) {
    markdown += `## Acceptance Criteria\n`;
    story.acceptance_criteria.forEach((criteria: string) => {
      // Replace "Scenario X:" with bold version while preserving the hyphen
      const formattedCriteria = criteria.replace(/(Scenario \d+):/, '**$1**:');
      markdown += `- ${formattedCriteria}\n`;
    });
    markdown += '\n';
  }

  // Additional Considerations
  if (story.additional_considerations && Array.isArray(story.additional_considerations)) {
    markdown += `## Additional Considerations\n`;
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

    const epics = await convex.query(api.epics.getEpics, { projectId });

    if (!epics) {
      return res.status(400).json({ message: "No userStories found for the project" });
    }

    const epicsText = epics.map((epic: any) => epic?.description).join('\n');

    let userStoryBasePrompt = `As an expert user stories analyst, generate a comprehensive list of user stories for the following project. Each user stories should be detailed and specific to the project's need following this exact structure and level of detail, and should not use Heading 1 and 2.
    {
      "title": "User Story Title",
      "description": "This user story focuses on a new user creating an account to access personalized features. The goal is to streamline the registration process, ensuring a smooth onboarding experience. Simplifying the sign-up reduces barriers, improves accessibility, and boosts user retention and engagement, supporting the platform's growth in active users.",
      
      "acceptance_criteria": [
        "Scenario 1: Given I am on the registration page, when I enter valid personal details and click Submit, then I should receive a confirmation email with an activation link",
        "Scenario 2: Given I am on the registration page, when I submit the form with an already registered email, then I should see an error message saying Email is already registered. Please log in.",
        "Scenario 3: Given I have received a confirmation email, when I click the activation link, then my account should be activated and I should be able to log in"
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
    userStoryPrompt += `And these existing epics:\n${epicsText}\n\n`;
    userStoryPrompt += `As an expert user story analyst, generate a comprehensive list of user stories that align with the project context and epics above. Each user story should follow this exact structure and format:\n${userStoryBasePrompt}\n\n`;
    userStoryPrompt += `Important guidelines:
    - Ensure each user story directly relates to and supports the epics
    - Include detailed acceptance criteria with clear given/when/then scenarios
    - Consider edge cases, error states and validation requirements
    - Focus on user value and business outcomes
    - Make stories specific, measurable and testable
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

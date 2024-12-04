import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getAuth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convertUsDescriptionToMarkdown(description: any): string {
  let markdown = '';

  if (typeof description === 'string') {
    return description;
  }

  if (description.Description) {
    markdown += `## Description\n${description.Description}\n\n`;
  }

  if (description.acceptance_criteria) {
    markdown += `## Acceptance Criteria\n${description.acceptance_criteria}\n\n`;
  }

  if (description.interface_elements) {
    markdown += `## Interface Elements\n${description.interface_elements}\n\n`;
  }

  if (description.functional_flow) {
    markdown += `## Functional Flow\n${description.functional_flow}\n\n`;
  }

  if (description.states_and_emptyStates) {
    markdown += `## States and Empty States\n${description.states_and_emptyStates}\n\n`;
  }

  if (description.errorMessages_and_validation) {
    markdown += `## Error Messages and Validation\n${description.errorMessages_and_validation}\n\n`;
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

      "description": "Create a detailed description of the user story that addresses the business need it fulfills, including the following elements:

        - **Description**: This user story focuses on a new user creating an account to access personalized features. The goal is to streamline the registration process, ensuring a smooth onboarding experience. Simplifying the sign-up reduces barriers, improves accessibility, and boosts user retention and engagement, supporting the platform's growth in active users.

        - **Acceptance Criteria**: 
          - **Scenario 1**: Given I am on the registration page, when I enter valid personal details and click Submit, then I should receive a confirmation email with an activation link.
          - **Scenario 2**: Given I am on the registration page, when I submit the form with an already registered email, then I should see an error message saying Email is already registered. Please log in.
          - **Scenario 3**: Given I have received a confirmation email, when I click the activation link, then my account should be activated, and I should be able to log in.
          ...

        - **Additional considerations**:

          Present the description as a single cohesive string, combining all these elements in a clear and engaging manner.Also ensure that each element starts from a new line" 
    }`

    let userStoryPrompt = context
    userStoryPrompt += `Based on the following epics- ${epicsText} generate a comprehensive list of user stories using this format- ${userStoryBasePrompt}. Be creative and consider edge cases that might not be immediately obvious. 
    Format the output as a JSON array of objects. Wrap the entire JSON output in a Markdown code block don't use Heading 1 and Heading 2 in Markdown.
    `;

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

    console.log('Parsed user stories', JSON.stringify(generatedUserStories, null, 2));

    console.log("Creating user stories...");

    for (const userStory of generatedUserStories) {
      if (userStory && userStory?.description) {
        const formattedDescription = convertUsDescriptionToMarkdown(userStory?.description);

        let userStoryId = await convex.mutation(api.userstories.createUserStory, {
          epicId: convexEpicId,
          title: userStory?.title || 'Untitled Epic',
          description: formattedDescription,
        });
        userStory['id'] = userStoryId
      }
      else {
        console.warn('Skipping invalid user stories:', userStory)
      }
    }
    console.log("User stories created successfully");

    res.status(200).json({ userStories: generatedUserStories, markdown: convertUsDescriptionToMarkdown(generatedUserStories[0]?.description || {}) });
  } catch (error) {
    console.error('Error generating user stories:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating user stories', error: error instanceof Error ? error.message : String(error) });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import OpenAI from 'openai';
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function convertDescriptionToMarkdown(description: any): string {
  let markdown = '';

  if (typeof description === 'string') {
    return description;
  }

  if (description.Description) {
    markdown += `## Description\n${description.Description}\n\n`;
  }

  if (description.creation_date) markdown += `**Creation Date:** ${description.creation_date}\n`;
  if (description.update_date) markdown += `**Update Date:** ${description.update_date}\n`;

  if (description.business_value) {
    markdown += `## Business Value\n${description.business_value}\n\n`;
  }

  if (description.acceptance_criteria) {
    markdown += `## Acceptance Criteria\n${description.acceptance_criteria}\n\n`;
  }

  if (description.dependencies) {
    markdown += `## Dependencies\n${description.dependencies}\n\n`;
  }

  if (description.risks) {
    markdown += `## Risks\n${description.risks}\n\n`;
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

  const { projectId } = req.body;
  const authHeader = req.headers.authorization;
  const authToken = authHeader && authHeader.split(' ')[1];

  if (!authToken) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  try {
    convex.setAuth(authToken);
    const convexProjectId = projectId as Id<"projects">;

    const context = await useContextChecker({ projectId: convexProjectId })
    console.log("context", context);

    // Fetch functional requirements for the project
    const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, { 
        projectId: convexProjectId 
    });

    if (!functionalRequirements) {
      return res.status(400).json({ message: "No functional requirements found for the project" });
    }

    const functionalRequirementsText = functionalRequirements.content;

    //Fetch the useCases
    const useCases = await convex.query(api.useCases.getUseCases, { projectId: convexProjectId });

    if (!useCases) {
      return res.status(400).json({ message: "No Use cases found for the project" });
    }

    let basePrompt = `As an expert EPICs analyst, generate a comprehensive list of EPICs for the following project. Each EPIC should be detailed and specific to the project's needs, following this exact structure and level of detail, don't use Heading 1 and 2 
    {
        "name": "Name of the epic should be short and concise. Example: Restaurant Menu Search",
        
        "description": "Create a detailed description of the epic that addresses the business need it fulfills, including the following elements: 
    
        - **Description**: This epic focuses on implementing the core functionality of the restaurant menu browsing and search system. It allows users to easily discover restaurants and their offerings, contributing to a seamless dining experience.
    
        - **Business Value**: Articulate the business value delivered by this epic. By enabling users to efficiently browse and search restaurant menus, this epic drives increased app usage and customer satisfaction, leading to higher order volumes and revenue growth.
    
        - **Acceptance Criteria**: Define what success looks like for this Epic. Users must be able to filter restaurants by cuisine type, and search results should be displayed within 2 seconds.
    
        - **Dependencies**: Identify any dependencies that could affect the completion of this Epic. This epic is dependent on the completion of the restaurant onboarding process and integration with the external menu management system.
    
        - **Risks**: Outline any risks that might prevent this Epic from being successfully completed. There is a risk that search functionality could slow down the app during peak usage times, affecting user experience.
    
        Present the description as a single cohesive string, combining all these elements in a clear and engaging manner."
    }`;


    if (useCases?.length > 0) {
      const useCasesText = useCases.map(useCase => useCase?.description).join('\n');
      basePrompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
    }

    let epicPrompt = context

    epicPrompt += `Based on the following functional requirements- ${functionalRequirementsText} generate a comprehensive list of epics using this format- ${basePrompt}. Be creative and consider edge cases that might not be immediately obvious.Format the output as a JSON array of objects. Wrap the entire JSON output in a Markdown code block don't use Heading 1 and Heading 2 in Markdown.
    `;

    console.log("Calling OpenAI Api...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: epicPrompt }],
      temperature: 0.7,
    });
    console.log('OpenAI API response received');

    const epicContent = response.choices[0].message.content;
    if (!epicContent) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Parsing OpenAI response...');

    // Extract JSON from Markdown code block
    const jsonMatch = epicContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in the response');
    }
    const jsonContent = jsonMatch[1];

    let generatedEpics;
    try {
      generatedEpics = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response for epics:', parseError);
      console.log('Raw OpenAI response', epicContent);
      return res.status(500).json({ message: 'Invalid JSON response from OpenAI for epics', parseError });
    }

    console.log('Parsed epics', JSON.stringify(generatedEpics, null, 2));

    console.log("Creating epic...");

    for (const epic of generatedEpics) {
      if (epic && epic?.description) {
        const formattedDescription = convertDescriptionToMarkdown(epic?.description);

        let epicId = await convex.mutation(api.epics.createEpics, {
          projectId: convexProjectId,
          name: epic.name || 'Untitled Epic',
          description: formattedDescription
        });

        epic['id'] = epicId
      }
      else {
        console.warn('Skipping invalid epics:', epic)
      }
    }
    console.log('Epics created successfully');

    res.status(200).json({ epics: generatedEpics, markdown: convertDescriptionToMarkdown(generatedEpics?.description || {}) });
  } catch (error) {
    console.error('Error generating Epics:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating Epics', error: error instanceof Error ? error.message : String(error) });
  }
}

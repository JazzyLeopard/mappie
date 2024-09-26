import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import OpenAI from 'openai';
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function convertDescriptionToMarkdown(description: any): string {
  let markdown = '';

  if (typeof description === 'string') {
    return description;
  }

  if (description.description) {
    markdown += `## Description\n${description.description}\n\n`;
  }

  if (description.acceptance_criteria) {
    markdown += `## Acceptance Criteria\n${description.acceptance_criteria}\n\n`;
  }

  if (description.business_value) {
    markdown += `## Business Value\n${description.business_value}\n\n`;
  }

  if (description.dependencies) {
    markdown += `## Dependencies\n${description.dependencies}\n\n`;
  }

  if (description.risks) {
    markdown += `## Risks\n${description.risks}\n\n`;
  }

  return markdown.trim();
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

    // Fetch functional requirements for the project
    const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, { projectId });

    if (!functionalRequirements) {
      return res.status(400).json({ message: "No functional requirements found for the project" });
    }

    const functionalRequirementsText = functionalRequirements.content;

    const useCases = await convex.query(api.useCases.getUseCasesByProjectId, { projectId });

    let basePrompt = `As an expert EPICs analyst, generate a comprehensive list of EPICs for the following project. Each EPIC should be detailed and specific to the project's needs, following this exact structure and level of detail, don't use Heading 1 and 2 
    {
        "name": "Name of the epic should be short and concise. Example: Restaurant Menu Browsing and Search"
        
        "description": 
        {
          "Create a detailed description of the epic that addresses the business need it fulfills. Explain how this epic contributes to the overall project goals.Consider this example for generating description- 
          This epic focuses on implementing the core functionality of the restaurant menu browsing and search system. It allows users to easily discover restaurants and their offerings, contributing to a seamless dining experience.",
          
          "business_value": "Articulate the business value delivered by this epic. Why is it essential? How does it align with strategic goals?
          Consider this example - By enabling users to efficiently browse and search restaurant menus, this epic drives increased app usage and customer satisfaction, leading to higher order volumes and revenue growth.",
          
          "acceptance_criteria": "Define what success looks like for this Epic. What specific conditions or outcomes must be met for the Epic to be considered complete? It's like setting the finish line in a race.
          Consider this example - Users must be able to filter restaurants by cuisine type, and search results should be displayed within 2 seconds.",
          
          "dependencies": "Identify any dependencies that could affect the completion of this Epic. Does it rely on other features, teams, or external systems? It's like making sure all the puzzle pieces fit together 
          Consider this example - This epic is dependent on the completion of the restaurant onboarding process and integration with the external menu management system.",
          
          "risks": "Outline any risks that might prevent this Epic from being successfully completed. Think of this as identifying the potential potholes on the road to success
          Consider this example - There is a risk that search functionality could slow down the app during peak usage times, affecting user experience."
        }
      }  
    
    Create epics based on the following functional requirements:\n${functionalRequirementsText}\n`;

    if (useCases?.length > 0) {
      const useCasesText = useCases.map(useCase => useCase.description).join('\n');
      basePrompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
    }

    // Update the prompt to request a JSON response
    const epicPrompt = `${basePrompt} Be creative and consider edge cases that might not be immediately obvious. 
    Format the output as a JSON array of objects, each containing 'name' and 'description' fields as shown in the structure above. Wrap the entire JSON output in a Markdown code block
    Use the language of the functional requirements, don't use Heading 1 and Heading 2 in Markdown.
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
    let generatedEpic;
    try {
      // Extract JSON from Markdown code block
      const jsonMatch = epicContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the response');
      }
      const jsonContent = jsonMatch[1];
      generatedEpic = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response for epics:', parseError);
      console.log('Raw OpenAI response', epicContent);
      throw new Error('Invalid JSON response from OpenAI for epics');
    }
    console.log('Parsed epics', JSON.stringify(generatedEpic, null, 2));


    console.log("Creating epic...");
    for (const epic of generatedEpic) {
      if (epic?.description) {
        const formattedDescription = convertDescriptionToMarkdown(epic.description);
        let epicId = await convex.mutation(api.epics.createEpics, {
          projectId: convexProjectId,
          name: epic.name || 'Untitled Epic',
          description: formattedDescription,
        });
        epic['id'] = epicId
      }
    }


    res.status(200).json({ message: "Epics generated successfully!", epics: generatedEpic });
  } catch (error) {
    console.error('Error generating Epics:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating Epics', error: error instanceof Error ? error.message : String(error) });
  }
}

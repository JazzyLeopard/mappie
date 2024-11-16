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

        //Fetch the existing epics
        const epics = await convex.query(api.epics.getEpics, { projectId: convexProjectId });

        if (!epics) {
            return res.status(400).json({ message: "No Use cases found for the project" });
        }

        const existingEpicNames = epics.map(epic => epic?.name);
        const epicsText = epics.map(epic => epic?.description).join('\n');

        let basePrompt = `As an expert Epic analyst, generate one unique additional epic for the following project. The epic should be detailed and specific to the project's needs, following this exact structure and level of detail, don't use Heading 1 and 2. Ensure that the epic name  should be different and unique not one of these: [${existingEpicNames.join(', ')}]. Do not repeat any themes or ideas related to sustainability, eco-friendliness, or green initiatives. 
    
        {
            "name": "Name of the epic should be short and concise. Example: Restaurant Menu Search",
            
            "description": "Include the following elements:
        
            - **Description**: This epic focuses on implementing the core functionality of the restaurant menu browsing and search system. It allows users to easily discover restaurants and their offerings, contributing to a seamless dining experience.
        
            - **Business Value**: Articulate the business value delivered by this epic. By enabling users to efficiently browse and search restaurant menus, this epic drives increased app usage and customer satisfaction, leading to higher order volumes and revenue growth.
        
            - **Acceptance Criteria**: Define what success looks like for this Epic. Users must be able to filter restaurants by cuisine type, and search results should be displayed within 2 seconds.
        
            - **Dependencies**: Identify any dependencies that could affect the completion of this Epic. This epic is dependent on the completion of the restaurant onboarding process and integration with the external menu management system.
        
            - **Risks**: Outline any risks that might prevent this Epic from being successfully completed. There is a risk that search functionality could slow down the app during peak usage times, affecting user experience.
        
            Present the description as a single cohesive string, combining all these elements in a clear and engaging manner. Also ensure that each element starts from a new line with correct styling on each element"
        }`;


        if (useCases?.length > 0) {
            const useCasesText = useCases.map(useCase => useCase.description).join('\n');
            basePrompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
        }

        const singleEpicPrompt = `Based on the following functional requirements- ${functionalRequirementsText} and existing epics- ${epicsText} generate one more epic using this format- ${basePrompt}.Be creative and consider edge cases that might not be immediately obvious. If no additional epic is needed and the existing epic suffice the requirements, return 'NULL'. Follow this exact structure and level of detail, Format the output as a JSON array of objects. Wrap the entire JSON output in a Markdown code block, don't use Heading 1 and Heading 2 in Markdown.
    `;

        console.log("Calling OpenAI Api...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: singleEpicPrompt }],
            temperature: 0.7,
        });
        console.log('OpenAI API response received');

        const epicContent = response.choices[0].message.content;
        if (!epicContent) {
            throw new Error('No content generated from OpenAI');
        }

        console.log('Parsing OpenAI response...');

        // Handle 'NULL' response
        if (epicContent.trim() === 'NULL') {
            console.log('AI determined that no new use case is needed.');
            return res.status(200).json({ message: 'NULL' });  // Send 'NULL' to the UI
        }

        // Utility function to handle BigInt serialization
        const serializeBigInt = (obj: any) => {
            return JSON.parse(JSON.stringify(obj, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));
        };

        let generatedEpic;
        const jsonMatch = epicContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            const jsonContent = jsonMatch[1];
            generatedEpic = JSON.parse(jsonContent);

            console.log('Parsed epic', JSON.stringify(generatedEpic, null, 2));

            if (generatedEpic && generatedEpic[0]?.description) {
                const formattedDescription = convertDescriptionToMarkdown
                    (generatedEpic[0]?.description)

                let epicId = await convex.mutation(api.epics.createEpics, {
                    projectId: convexProjectId,
                    name: generatedEpic[0]?.name || 'Untitled Epic',
                    description: formattedDescription,
                });
                generatedEpic[0]['id'] = epicId

                const serializedUseCase = serializeBigInt(epicId);
                console.log("Epic id", serializedUseCase);
            }
        } else {
            console.warn('Skipping invalid epic:', generatedEpic)
        }
        console.log('Epic created successfully');

        res.status(200).json({ epics: serializeBigInt(generatedEpic), markdown: convertDescriptionToMarkdown(generatedEpic[0]?.description || {}) });
    } catch (error) {
        console.error('Error generating Epic:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ message: 'Error generating Epic', error: error instanceof Error ? error.message : String(error) });
    }
}

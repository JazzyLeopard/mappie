import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { getAuth } from "@clerk/nextjs/server";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        if (req.method !== 'POST') {
            throw new Error('Method not allowed');
        }

        // Authentication
        sendEvent({ progress: 5, status: 'Authenticating...' });
        const { userId, getToken } = getAuth(req);
        const token = await getToken({ template: "convex" });

        if (!userId || !token) {
            throw new Error('Unauthorized');
        }

        // Set the auth token for the Convex client
        convex.setAuth(token);

        const { projectId } = req.body;
        const convexProjectId = projectId as Id<"projects">;

        // Fetch project data
        sendEvent({ progress: 15, status: 'Fetching project data...' });

        // Fetch functional requirements for the project
        const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
            projectId: convexProjectId
        });

        if (!functionalRequirements) {
            return res.status(400).json({ message: "No functional requirements found for the project" });
        }

        const functionalRequirementsText = functionalRequirements.map((fr: any) => fr.description).join('\n');

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

        const existingEpicNames = epics.map((epic: any) => epic?.name);
        const epicsText = epics.map((epic: any) => epic?.description).join('\n');

        let basePrompt = `As an expert Epic analyst, generate one unique additional epic for the following project. The epic should be detailed and specific to the project's needs, following this exact structure and level of detail. Ensure the epic name is different and unique from these: [${existingEpicNames.join(', ')}].

{
    "name": "Keep the name very short (2-4 words max). Example: 'User Authentication' or 'Payment Processing'",
    
    "description": "Include the following elements:
    
    - **Description**: [Concise description of the epic's core functionality]
    
    - **Business Value**: [Clear statement of value delivered]
    
    - **Acceptance Criteria**: [List 3-4 key criteria]
    
    - **Dependencies**: [List any critical dependencies]
    
    - **Risks**: [List 2-3 key risks]
    
    Present the description as a single cohesive string, with each element on a new line."
}`;


        if (useCases?.length > 0) {
            const useCasesText = useCases.map((useCase: any) => useCase.description).join('\n');
            basePrompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
        }

        const singleEpicPrompt = `Based on the following functional requirements- ${functionalRequirementsText} and existing epics- ${epicsText} generate one more epic using this format- ${basePrompt}.Be creative and consider edge cases that might not be immediately obvious. If no additional epic is needed and the existing epic suffice the requirements, return 'NULL'. Follow this exact structure and level of detail, Format the output as a JSON array of objects. Wrap the entire JSON output in a Markdown code block, don't use Heading 1 and Heading 2 in Markdown.
    `;

        sendEvent({ progress: 35, status: 'Analyzing requirements...' });

        console.log("Calling OpenAI Api...");
        sendEvent({ progress: 55, status: 'Generating epic...' });
        const response = await generateText({
            model: openai("gpt-4o"),
            messages: [{ role: "user", content: singleEpicPrompt }],
            temperature: 0.7,
        });
        console.log('OpenAI API response received');

        const epicContent = response.text;
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

        sendEvent({ progress: 75, status: 'Processing AI response...' });
        res.status(200).json({ epics: serializeBigInt(generatedEpic), markdown: convertDescriptionToMarkdown(generatedEpic[0]?.description || {}) });

        sendEvent({ progress: 95, status: 'Finalizing...' });
        sendEvent({ progress: 100, status: 'Complete!' });
        sendEvent({ done: true, content: serializeBigInt(generatedEpic) });

    } catch (error) {
        console.error('Error generating Epic:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        sendEvent({
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
            progress: 100,
            status: 'Error'
        });
    } finally {
        res.end();
    }
}

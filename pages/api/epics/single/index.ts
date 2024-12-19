import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { getAuth } from "@clerk/nextjs/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from 'ai';
import { useContextChecker } from "@/utils/useContextChecker";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const convertBigIntToNumber = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
    if (typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: convertBigIntToNumber(value)
        }), {});
    }
    return obj;
};

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

        // Setup Convex client
        sendEvent({ progress: 15, status: 'Setting up connection...' });
        convex.setAuth(token);
        const { projectId } = req.body;
        const convexProjectId = projectId as Id<"projects">;

        // Fetch project and context
        sendEvent({ progress: 25, status: 'Loading epic...' });
        const project = await convex.query(api.projects.getProjectById, { projectId: convexProjectId });

        if (!project) throw new Error('Project not found');
        if (project.userId !== userId) throw new Error('Unauthorized access to epic');

        // Get functional requirements
        sendEvent({ progress: 35, status: 'Loading requirements...' });
        const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
            projectId: convexProjectId
        });

        // Prepare context
        sendEvent({ progress: 45, status: 'Preparing context...' });
        const context = await useContextChecker({ projectId: convexProjectId });
        const functionalRequirementsText = functionalRequirements
            .map((fr: any) => `${fr.title}\n${fr.description}`)
            .join('\n\n');

        //Fetch the useCases
        const useCases = await convex.query(api.useCases.getUseCases, { projectId: convexProjectId });

        if (!useCases) {
            return res.status(400).json({ message: "No Use cases found for the epic" });
        }

        //Fetch the existing epics
        const existingEpics = await convex.query(api.epics.getEpics, { projectId: convexProjectId });

        if (!existingEpics) {
            return res.status(400).json({ message: "No Use cases found for the epic" });
        }

        const existingEpicNames = existingEpics.map((epic: any) => epic?.name);
        const epicsText = existingEpics.map((epic: any) => epic?.description).join('\n');

        let prompt = `
        Epic Context:
        ${context}

        Functional Requirements:
        ${functionalRequirementsText}

        Existing Features:
        ${epicsText}

        Based on the above epic context, functional requirements, existing features, and use cases, generate one unique additional feature for the following project. Ensure the feature name is different and unique from these: [${existingEpicNames.join(', ')}]. The feature should be detailed and specific to the project's needs, following this exact structure and level of detail. 

### Feature: [Feature Name]

**Description**: Provide a clear and concise description of the feature, outlining its purpose and functionality. Ensure that the description highlights how the feature benefits users and enhances their experience, focusing on the key aspects that make it valuable and relevant to their needs.

**Business Value**: [Describe how this feature directly impacts the business or user experience. Focus on measurable improvements like time savings, increased efficiency, or enhanced usability.]

**Functionality**:
Functionality 1: [Detailed explanation of the core functionality]
Functionality 2: [Detailed explanation of another key capability]
... and so on

**Dependencies**:
• Dependency 1: [Technical or system dependency that is critical to success]
• Dependency 2: [External factor or prerequisite that must be in place]

**Risks**:
• Risk 1: [Technical, business, or operational risk that could impact delivery]
• Risk 2: [Timeline, resource, or quality risk that needs mitigation]

IMPORTANT:
- Each feature MUST have an adequate number of functional criteria
- Each feature MUST have EXACTLY 2 dependencies
- Each feature MUST have EXACTLY 2 risks
- Each point should be detailed and specific
- Include measurable outcomes where possible
- Consider both technical and business aspects

Please ensure the feature is well-defined, practical, and aligns with the epic goals and requirements.`;

        if (useCases?.length > 0) {
            const useCasesText = useCases.map((useCase: any) => useCase.description).join('\n');
            prompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
        }

        console.log("Calling OpenAI Api...");
        sendEvent({ progress: 55, status: 'Generating epic...' });
        const completion = await generateText({
            model: anthropic('claude-3-5-sonnet-20241022'),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const epicContent = completion.text;
        console.log('AI Response:', epicContent);

        if (!epicContent) throw new Error('No content generated from OpenAI');

        // Create epics in database
        sendEvent({ progress: 75, status: 'Processing features...' });
        const epics = epicContent
            .split(/(?=###\s*Feature:\s*)/g)
            .filter(section => section.trim())
            .map(section => {
                const nameMatch = section.match(/Feature:\s*(.+?)(?=\n|$)/);
                const descriptionMatch = section.match(/\*\*Description\*\*:\s*([^]*?)(?=\*\*Business Value|$)/m);
                const businessValueMatch = section.match(/\*\*Business Value\*\*:\s*([^]*?)(?=\*\*Functionality|$)/m);
                const functionalityMatch = section.match(/\*\*Functionality\*\*:\s*([^]*?)(?=\*\*Dependencies|$)/m);

                const functionalitySection = functionalityMatch?.[1];
                const dependenciesSection = section.match(/\*\*Dependencies\*\*:\s*([^]*?)(?=\*\*Risks\*\*)/m)?.[1];
                const risksSection = section.match(/\*\*Risks\*\*:\s*((?:.*\n?)*?)(?=\s*---|$)/m)?.[1];

                const extractBulletPoints = (sectionText: string, prefix: string) => {
                    return sectionText
                        ?.split('\n')
                        .map(line => line.trim())
                        .filter(line =>
                            (line.startsWith('•') || line.startsWith('-') || line.startsWith('Functionality')) &&
                            (prefix === 'Functionality' ? line.startsWith('Functionality') : line.includes(prefix))
                        )
                        .map(line => {
                            const indentation = line.match(/^\s*/)?.[0] || '';
                            if (prefix === 'Functionality' && line.startsWith('Functionality')) {
                                const content = line.split(':')[1]?.trim() || '';
                                return `${indentation}• **${line.split(':')[0].trim()}:** ${content}`;
                            }
                            const numberMatch = line.match(new RegExp(`${prefix}\\s*(\\d+)`));
                            const number = numberMatch ? numberMatch[1] : '';
                            const content = line.split(':')[1]?.trim() || '';
                            return `${indentation}• **${prefix} ${number}:** ${content}`;
                        }) || [];
                };

                // Process each section
                const functionality = extractBulletPoints(functionalitySection ?? "", 'Functionality');
                const dependencies = extractBulletPoints(dependenciesSection ?? "", 'Dependency');
                const risks = extractBulletPoints(risksSection ?? "", 'Risk');

                const processedData = {
                    name: nameMatch?.[1]?.trim() || 'Untitled Feature',
                    description: {
                        Description: descriptionMatch?.[1]?.trim() || '',
                        "Business Value": businessValueMatch?.[1]?.trim() || '',
                        "Functionality": functionality,
                        Dependencies: dependencies,
                        Risks: risks
                    }
                };

                return processedData;
            });

        // Create epics in database
        sendEvent({ progress: 85, status: 'Saving features...' });

        const createdEpics = await Promise.all(epics.map(async (epic) => {
            const markdownDescription = `# ${epic.name}

## Description
${epic.description.Description}

## Business Value
${epic.description["Business Value"]}

## Functionality
${epic.description.Functionality.length > 0
                    ? epic.description.Functionality.join('\n')
                    : '• No functionality specified'}

## Dependencies
${epic.description.Dependencies.length > 0
                    ? epic.description.Dependencies.map(dep => `${dep}`).join('\n')
                    : '• No dependencies specified'}

## Risks
${epic.description.Risks.length > 0
                    ? epic.description.Risks.map(risk => `${risk}`).join('\n')
                    : '• No risks specified'}`;

            return await convex.mutation(api.epics.createEpics, {
                projectId: convexProjectId,
                name: epic.name,
                description: markdownDescription
            });
        }));

        // Send final response
        const serializedEpics = convertBigIntToNumber(createdEpics);
        sendEvent({ progress: 100, status: 'Complete!' });
        sendEvent({ done: true, content: serializedEpics });

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

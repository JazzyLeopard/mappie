import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { anthropic } from "@ai-sdk/anthropic";
import { getAuth } from "@clerk/nextjs/server";
import { generateText } from 'ai';
import { ConvexHttpClient } from "convex/browser";
import { NextApiRequest, NextApiResponse } from "next";

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

        if (!project) throw new Error('Epic not found');
        if (project.userId !== userId) throw new Error('Unauthorized access to epic');

        // Get functional requirements
        sendEvent({ progress: 35, status: 'Loading requirements...' });
        const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
            projectId: convexProjectId
        });

        // Prepare context
        sendEvent({ progress: 45, status: 'Preparing context...' });
        const context = await useContextChecker({ projectId: convexProjectId, token: token });
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
        const featuresText = existingEpics.map((epic: any) => epic?.description).join('\n');

        let prompt = `
Epic Context:
${context}

Functional Requirements:
${functionalRequirementsText}

Existing Features:
${featuresText}

Based on the above epic context, functional requirements, existing features, and use cases, generate one unique additional feature for the following epic. Ensure that the feature is not one of the existing features and the names are not similar to the existing features: [${existingEpicNames.join(', ')}]. The feature should be detailed and specific to the epic's needs, following this exact structure and level of detail:

**Feature Name:**
[A short, action-oriented title describing the feature.]

**Why we are building this:**
[Why this feature is being developed. Focus on the user need or problem it solves.]

**Description:**
[A high-level explanation of what the feature includes, written in clear, concise terms. Mention the key actions or outcomes.]

**Scope:**
[Define the specific aspects or components of the feature. Be explicit about what is included.]

**Out of scope:**
[List items that are explicitly not included in this feature.]

**Success Metrics:**
[Define measurable outcomes that indicate the feature is working as intended.]

**Dependencies:**
[Mention any prerequisites, integrations, or other features required for this feature to work.]

**Additional Notes:**
[Add any extra information or context to help refine user stories.]

IMPORTANT:
- Keep consistent formatting throughout the document
- Each section should be detailed and specific
- Focus on user-centric explanations
- Consider both technical and business aspects
- Clearly separate in-scope and out-of-scope items

Please ensure the feature is well-defined, practical, and aligns with the epic goals and requirements.`;

        if (useCases?.length > 0) {
            const useCasesText = useCases.map((useCase: any) => useCase.description).join('\n');
            prompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
        }

        console.log("Calling Anthropic Api...");
        sendEvent({ progress: 55, status: 'Generating feature...' });
        const completion = await generateText({
            model: anthropic('claude-3-5-sonnet-20241022'),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const epicContent = completion.text;
        console.log('AI Response:', epicContent);

        if (!epicContent) throw new Error('No content generated from Anthropic');

        // Create epics in database
        sendEvent({ progress: 75, status: 'Processing features...' });
        const epics = epicContent
            .split(/(?=\*\*Feature Name:\*\*)/g)
            .filter(section => section.trim().startsWith('**Feature Name:**'))
            .map(section => {
                const nameMatch = section.match(/\*\*Feature Name:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const whyMatch = section.match(/\*\*Why we are building this:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const descriptionMatch = section.match(/\*\*Description:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const scopeMatch = section.match(/\*\*Scope:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const outOfScopeMatch = section.match(/\*\*Out of scope:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const metricsMatch = section.match(/\*\*Success Metrics:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const dependenciesMatch = section.match(/\*\*Dependencies:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
                const notesMatch = section.match(/\*\*Additional Notes:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);

                const processedData = {
                    name: nameMatch?.[1]?.trim() || 'Untitled Feature',
                    description: {
                        Why: whyMatch?.[1]?.trim() || '',
                        Description: descriptionMatch?.[1]?.trim() || '',
                        Scope: scopeMatch?.[1]?.trim() || '',
                        OutOfScope: outOfScopeMatch?.[1]?.trim() || '',
                        "Success Metrics": metricsMatch?.[1]?.trim() || '',
                        Dependencies: dependenciesMatch?.[1]?.trim() || '',
                        "Additional Notes": notesMatch?.[1]?.trim() || ''
                    }
                };

                return processedData;
            });

        // Create epics in database
        sendEvent({ progress: 85, status: 'Saving features...' });

        const createdEpics = await Promise.all(epics.map(async (epic) => {
            const markdownDescription = `## ${epic.name}

### Why we are building this
${epic.description.Why || 'No information provided'}

### Description
${epic.description.Description || 'No information provided'}

### Scope
${epic.description.Scope || 'No information provided'}

${epic.description.OutOfScope ? `#### Out of scope\n${epic.description.OutOfScope}\n\n` : ''}
${epic.description["Success Metrics"] ? `### Success Metrics\n${epic.description["Success Metrics"]}\n\n` : ''}
${epic.description.Dependencies ? `### Dependencies\n${epic.description.Dependencies}\n\n` : ''}
${epic.description["Additional Notes"] ? `### Additional Notes\n${epic.description["Additional Notes"]}` : ''}`;

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
        console.error('Error generating Feature:', error);
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

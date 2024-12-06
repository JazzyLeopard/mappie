import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { getAuth } from "@clerk/nextjs/server";
import { openai } from '@ai-sdk/openai';
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
        sendEvent({ progress: 25, status: 'Loading project...' });
        const project = await convex.query(api.projects.getProjectById, { projectId: convexProjectId });

        if (!project) throw new Error('Project not found');
        if (project.userId !== userId) throw new Error('Unauthorized access to project');

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

        Project Context:
        ${context}

### Epic: [Epic Name]

**Description**: [Detailed description of what this epic entails]

**Business Value**: [Clear statement of the business value this epic delivers]

**Acceptance Criteria**:
- Criterion 1: [Start with an action verb (Implement/Develop/Create) and be specific about what needs to be achieved]
- Criterion 2: [Include measurable outcomes with specific metrics (e.g., response times, success rates)]
- Criterion 3: [Address edge cases, error scenarios, or quality requirements]

**Dependencies**:
- Dependency 1: [Technical or system dependency that is critical to success]
- Dependency 2: [External factor or prerequisite that must be in place]

**Risks**:
- Risk 1: [Technical, business, or operational risk that could impact delivery]
- Risk 2: [Timeline, resource, or quality risk that needs mitigation]

IMPORTANT:
- Each epic MUST have EXACTLY 3 acceptance criteria
- Each epic MUST have EXACTLY 2 dependencies
- Each epic MUST have EXACTLY 2 risks
- Each point should be detailed and specific
- Start acceptance criteria with action verbs
- Include measurable outcomes where possible
- Consider both technical and business aspects

Please ensure each epic is well-defined, practical, and aligns with the project goals and requirements.
`;

        if (useCases?.length > 0) {
            const useCasesText = useCases.map((useCase: any) => useCase.description).join('\n');
            basePrompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
        }

        const singleEpicPrompt = `Based on the following functional requirements- ${functionalRequirementsText} and existing epics- ${epicsText} generate one more epic using this format- ${basePrompt}.Be creative and consider edge cases that might not be immediately obvious. If no additional epic is needed and the existing epic suffice the requirements, return 'NULL'. Follow this exact structure and level of detail, Format the output as a JSON array of objects. Wrap the entire JSON output in a Markdown code block, don't use Heading 1 and Heading 2 in Markdown.
    `;

        console.log("Calling OpenAI Api...");
        sendEvent({ progress: 55, status: 'Generating epic...' });
        const completion = await generateText({
            model: openai("gpt-4o-mini"),
            messages: [{ role: "user", content: singleEpicPrompt }],
            temperature: 0.7,
        });

        const epicContent = completion.text;
        console.log('AI Response:', epicContent);

        if (!epicContent) throw new Error('No content generated from OpenAI');

        // Handle 'NULL' response
        if (epicContent.trim() === 'NULL') {
            return res.status(200).json({ message: 'NULL' });
        }

        // Try to parse as JSON first
        try {
            // Remove markdown code block syntax if present
            const jsonContent = epicContent.replace(/```json\n|\n```/g, '');
            const parsedEpics = JSON.parse(jsonContent);

            // Transform JSON format to our expected format
            const transformedEpics = parsedEpics.map((epic: any) => ({
                name: epic["Epic Name"] || epic.name,
                description: {
                    Description: epic.Description || '',
                    "Business Value": epic["Business Value"] || '',
                    "Acceptance Criteria": Array.isArray(epic["Acceptance Criteria"])
                        ? epic["Acceptance Criteria"]
                        : [],
                    Dependencies: Array.isArray(epic.Dependencies)
                        ? epic.Dependencies
                        : [],
                    Risks: Array.isArray(epic.Risks)
                        ? epic.Risks
                        : []
                }
            }));

            // Process epics
            sendEvent({ progress: 75, status: 'Processing epics...' });

            // Create epics in database
            const createdEpics = await Promise.all(transformedEpics.map(async (epic: any) => {
                const markdownDescription = `# ${epic.name}

            ## Description
            ${epic.description.Description}

            ## Business Value
            ${epic.description["Business Value"]}

            ## Acceptance Criteria
            ${epic.description["Acceptance Criteria"].map((criterion: any) => `- ${criterion}`).join('\n')}

            ## Dependencies
            ${epic.description.Dependencies.map((dep: any) => `- ${dep}`).join('\n')}

            ## Risks
            ${epic.description.Risks.map((risk: any) => `- ${risk}`).join('\n')}`;

                sendEvent({ progress: 85, status: 'Saving epics...' });
                return await convex.mutation(api.epics.createEpics, {
                    projectId: convexProjectId,
                    name: epic.name,
                    description: markdownDescription
                });
            }));

            // Send final response
            const serializedEpics = convertBigIntToNumber(createdEpics);
            sendEvent({ progress: 95, status: 'Finalizing...' });
            sendEvent({ progress: 100, status: 'Complete!' });
            sendEvent({ done: true, content: serializedEpics });

        } catch (jsonError) {
            // If JSON parsing fails, fall back to markdown parsing
            console.log('JSON parsing failed, falling back to markdown parsing');
            // ... your existing markdown parsing code ...
        }

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

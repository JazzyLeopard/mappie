import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { openai } from '@ai-sdk/openai';
import { generateText } from "ai";

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

    if (!token || !userId) {
      throw new Error('Authentication failed');
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
    const context = await useContextChecker({ projectId: convexProjectId });
    const functionalRequirementsText = functionalRequirements
      .map((fr: any) => `${fr.title}\n${fr.description}`)
      .join('\n\n');

    //Fetch the useCases
    const useCases = await convex.query(api.useCases.getUseCases, { projectId: convexProjectId });

    if (!useCases) {
      return res.status(400).json({ message: "No Use cases found for the epic" });
    }

    // Generate epics with OpenAI
    sendEvent({ progress: 55, status: 'Generating features...' });
    let prompt = `
Epic Context:
${context}

Functional Requirements:
${functionalRequirementsText}

Based on the above epic context and functional requirements, please generate a reasonable number of high-level features. Each feature name should be kept short and unique. Each feature should follow this format:

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

Please ensure each feature is well-defined, practical, and aligns with the epic goals and requirements.`;

    if (useCases?.length > 0) {
      const useCasesText = useCases.map((useCase: any) => useCase.description).join('\n');
      prompt += `Additionally, consider the following use cases:\n${useCasesText}\n`;
    }

    const completion = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    console.log('AI Response:', content);

    if (!content) throw new Error('No content generated from OpenAI');

    // Process AI response
    sendEvent({ progress: 75, status: 'Processing epics...' });
    const epics = content
      .split(/(?=###\s*Epic:\s*)/g)
      .filter(section => section.trim())
      .map(section => {
        const nameMatch = section.match(/Epic:\s*(.+?)(?=\n|$)/);
        const descriptionMatch = section.match(/\*\*Description\*\*:\s*([^]*?)(?=\*\*Business Value|$)/m);
        const businessValueMatch = section.match(/\*\*Business Value\*\*:\s*([^]*?)(?=\*\*Acceptance Criteria|$)/m);

        // Updated regex patterns to better capture multiple bullet points
        const acceptanceCriteriaSection = section.match(/\*\*Acceptance Criteria\*\*:\s*([^]*?)(?=\*\*Dependencies\*\*)/m)?.[1];
        const dependenciesSection = section.match(/\*\*Dependencies\*\*:\s*([^]*?)(?=\*\*Risks\*\*)/m)?.[1];
        const risksSection = section.match(/\*\*Risks\*\*:\s*((?:.*\n?)*?)(?=\s*---|$)/m)?.[1];

        const extractBulletPoints = (sectionText: string, prefix: string) => {
          return sectionText
            ?.split('\n')
            .map(line => line.trim())
            .filter(line =>
              line.startsWith('•') &&
              line.includes(`${prefix}`)
            )
            .map(line => {
              const indentation = line.match(/^\s*/)?.[0] || '';
              const numberMatch = line.match(new RegExp(`${prefix}\\s*(\\d+)`));
              const number = numberMatch ? numberMatch[1] : '';
              const content = line.split(':')[1]?.trim() || '';
              return `${indentation}• **${prefix} ${number}:** ${content}`;
            }) || [];
        };

        // Process each section
        const acceptanceCriteria = extractBulletPoints(acceptanceCriteriaSection ?? "", 'Criterion');
        const dependencies = extractBulletPoints(dependenciesSection ?? "", 'Dependency');
        const risks = extractBulletPoints(risksSection ?? "", 'Risk');


        const processedData = {
          name: nameMatch?.[1]?.trim() || 'Untitled Epic',
          description: {
            Description: descriptionMatch?.[1]?.trim() || '',
            "Business Value": businessValueMatch?.[1]?.trim() || '',
            "Acceptance Criteria": acceptanceCriteria,
            Dependencies: dependencies,
            Risks: risks
          }
        };

        // Debug logging for processed data
        console.log('Processed data:', JSON.stringify(processedData, null, 2));

        return processedData;
      });

    // Create epics in database
    sendEvent({ progress: 85, status: 'Saving epics...' });

    const createdEpics = await Promise.all(epics.map(async (epic) => {
      const markdownDescription = `# ${epic.name}

## Description
${epic.description.Description}

## Business Value
${epic.description["Business Value"]}

## Acceptance Criteria
${epic.description["Acceptance Criteria"].length > 0
          ? epic.description["Acceptance Criteria"].map(criterion => `${criterion}`).join('\n')
          : '• No acceptance criteria specified'}

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
    console.error('API Error:', error);
    sendEvent({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      progress: 100,
      status: 'Error'
    });
  } finally {
    res.end();
  }
}

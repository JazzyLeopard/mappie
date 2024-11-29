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
      .map(fr => `${fr.title}\n${fr.description}`)
      .join('\n\n');

    // Generate epics with OpenAI
    sendEvent({ progress: 55, status: 'Generating epics...' });
    const prompt = `
Project Context:
${context}

Functional Requirements:
${functionalRequirementsText}

Based on the above project context and functional requirements, please generate a reasonable number of high-level epics. Each epic name should be kept short and unique. Each epic should follow this format:

### Epic: [Epic Name]
**Description**: [Detailed description of what this epic entails]
**Business Value**: [Clear statement of the business value this epic delivers]
**Acceptance Criteria**:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

**Dependencies**:
- [Dependency 1]
- [Dependency 2]

**Risks**:
- [Risk 1]
- [Risk 2]

Please ensure each epic is well-defined, practical, and aligns with the project goals and requirements.`;

    const completion = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    if (!content) throw new Error('No content generated from OpenAI');

    // Process AI response
    sendEvent({ progress: 75, status: 'Processing epics...' });
    const epics = content
      .split(/(?=###\s*Epic:\s*)/g)
      .filter(section => section.trim())
      .map(section => {
        const nameMatch = section.match(/Epic:\s*(.+?)(?=\n|$)/);
        const descriptionMatch = section.match(/\*\*Description\*\*:\s*(.+?)(?=\*\*|$)/m);
        const businessValueMatch = section.match(/\*\*Business Value\*\*:\s*(.+?)(?=\*\*|$)/m);
        const acceptanceCriteriaMatch = section.match(/\*\*Acceptance Criteria\*\*:\s*((?:-.+?\n?)+)/m);
        const dependenciesMatch = section.match(/\*\*Dependencies\*\*:\s*((?:-.+?\n?)+)/m);
        const risksMatch = section.match(/\*\*Risks\*\*:\s*((?:-.+?\n?)+)/m);

        const formatList = (match: RegExpMatchArray | null): string[] => {
          if (!match?.[1]) return [];
          return match[1]
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.startsWith('-'))
            .map(item => item.slice(1).trim())
            .filter(Boolean);
        };

        return {
          name: nameMatch?.[1]?.trim() || 'Untitled Epic',
          description: {
            Description: descriptionMatch?.[1]?.trim() || '',
            "Business Value": businessValueMatch?.[1]?.trim() || '',
            "Acceptance Criteria": formatList(acceptanceCriteriaMatch),
            Dependencies: formatList(dependenciesMatch),
            Risks: formatList(risksMatch)
          }
        };
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
${epic.description["Acceptance Criteria"].map(criterion => `- ${criterion}`).join('\n')}

## Dependencies
${epic.description.Dependencies.map(dep => `- ${dep}`).join('\n')}

## Risks
${epic.description.Risks.map(risk => `- ${risk}`).join('\n')}`;

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

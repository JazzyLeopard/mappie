import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

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
    console.log('Project data:', {
      exists: !!project,
      id: project?._id,
      overview: project?.overview,  // This should contain your epic context
      name: project?.title
    });

    if (!project) throw new Error('Epic not found');
    if (project.userId !== userId) throw new Error('Unauthorized access to epic');

    // Get functional requirements
    sendEvent({ progress: 35, status: 'Loading requirements...' });
    const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
      projectId: convexProjectId
    });

    // Prepare context
    sendEvent({ progress: 45, status: 'Preparing context...' });
    const context = await useContextChecker({ 
        projectId: convexProjectId,
        token  // Pass token where available
    }).catch(error => {
        console.error('Context checker error:', error);
        throw new Error(`Failed to get context: ${error.message}`);
    });

    // Validate context with more detailed error
    if (!context || context.trim() === '') {
      throw new Error(`Epic context is missing. Project overview: ${project?.overview ? 'exists' : 'missing'}`);
    }

    // Start building the prompt
    let prompt = '';

    // Add context if available
    if (context && context.trim()) {
      prompt += `Epic Context:\n${context}\n\n`;
    }

    // Add functional requirements if available
    if (functionalRequirements && functionalRequirements.length > 0) {
      const functionalRequirementsText = functionalRequirements
        .map((fr: any) => `${fr.title}\n${fr.description}`)
        .join('\n\n');
      
      prompt += `Functional Requirements:\n${functionalRequirementsText}\n\n`;
    }

    // Validate we have at least context
    if (!context || !context.trim()) {
      throw new Error('Epic context is required to generate features');
    }

    // Add the main instruction part
    prompt += `Based on the ${context ? 'above Epic context' : ''}${
      functionalRequirements?.length ? 
        (context ? ' and functional requirements' : 'functional requirements') : 
        ''
    }, please generate a reasonable number of high-level features. Each feature should follow this exact format without any deviations:

**Feature Name:**
[A short, action-oriented title describing the feature.]

**Why we are building this:**
[Why this feature is being developed. Focus on the user need or problem it solves.]

**Description:**
[A high-level explanation of what the feature includes, written in clear, concise terms. Mention the key actions or outcomes.]

**Scope:**
[Define what is included:]
- Item 1
- Item 2
- Item 3

**Out of scope:**
- Item 1
- Item 2

**Success Metrics:**
[Optional. Define measurable outcomes that indicate the feature is working as intended.]

**Dependencies:**
[Optional. Mention any prerequisites, integrations, or other features required for this feature to work.]

**Additional Notes:**
[Optional. Add any extra information or context to help refine user stories.]

IMPORTANT:
- Keep consistent formatting throughout the document
- Each section should be detailed and specific
- Focus on user-centric explanations
- Optional sections can be omitted if not relevant
- Consider both technical and business aspects
- Always separate in-scope and out-of-scope items into different sections

Please ensure each feature is well-defined, practical, and aligns with the epic goals and requirements.`;


    console.log("Calling Anthropic Api...");
    const completion = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    console.log('AI Response:', content);

    if (!content) throw new Error('No content generated from Anthropic');

    // Process AI response
    sendEvent({ progress: 75, status: 'Processing features...' });
    const epics = content
      .split(/(?=\*\*Feature Name:\*\*)/g)
      .filter(section => section.trim().startsWith('**Feature Name:**'))
      .map(section => {
        const nameMatch = section.match(/\*\*Feature Name:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
        const whyMatch = section.match(/\*\*Why we are building this:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
        const descriptionMatch = section.match(/\*\*Description:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
        const scopeMatch = section.match(/\*\*Scope:\*\*\s*([\s\S]+?)(?=\s*\*\*Out of scope:|$)/);
        const outOfScopeMatch = section.match(/\*\*Out of scope:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
        const metricsMatch = section.match(/\*\*Success Metrics:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
        const dependenciesMatch = section.match(/\*\*Dependencies:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);
        const notesMatch = section.match(/\*\*Additional Notes:\*\*\s*([\s\S]+?)(?=\s*\*\*|$)/);

        console.log('Raw section:', section);
        console.log('Section parsing results:', {
          name: nameMatch?.[1],
          why: whyMatch?.[1],
          scope: scopeMatch?.[1],
          description: descriptionMatch?.[1]
        });

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

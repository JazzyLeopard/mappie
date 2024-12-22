import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { anthropic } from '@ai-sdk/anthropic';
import { getAuth } from "@clerk/nextjs/server";
import { generateText } from 'ai';

// Initialize clients
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper function to convert BigInt to number
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

// Add debug logging to see what we're receiving
const validateRequirements = (content: string): boolean => {
  console.log('Validating content:', content.substring(0, 500) + '...');

  // Split into sections using double newlines instead of ---
  const sections = content.split(/\n\n(?=# [^\n]+)/).filter(section => section.trim());
  console.log(`Found ${sections.length} sections`);

  if (sections.length < 2) {
    console.log('Validation failed: Not enough sections found');
    return false;
  }

  for (const section of sections) {
    if (!section.trim()) continue;

    console.log('Validating section:', section.substring(0, 200) + '...');

    // Update regex patterns to be more lenient with whitespace
    const hasTitle = /^#\s+[^\n]+/m.test(section.trim());
    const hasDescription = /##\s+Description\s+[^\n]+/m.test(section);
    const hasSubRequirements = /###\s+Sub-requirements/m.test(section);
    const hasPriorities = /Priority:\s*(Must Have|Should Have|Could Have)/m.test(section);
    const subReqCount = (section.match(/^-\s+.*Priority:/gm) || []).length;
    const hasMinimumSubReqs = subReqCount >= 4;

    console.log('Section validation results:', {
      hasTitle,
      hasDescription,
      hasSubRequirements,
      hasPriorities,
      subReqCount,
      hasMinimumSubReqs,
      sectionStart: section.substring(0, 100)
    });

    if (!hasTitle || !hasDescription || !hasSubRequirements || !hasPriorities || !hasMinimumSubReqs) {
      return false;
    }
  }

  return true;
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
    // Check if it's an SSE request
    const isSSE = req.headers.accept === 'text/event-stream';
    if (!isSSE) {
      throw new Error('Invalid request type');
    }

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Authentication
    sendEvent({ progress: 5, status: 'Generating...' });
    const { userId, getToken } = getAuth(req);
    const token = await getToken({ template: "convex" });

    if (!token || !userId) {
      throw new Error('Authentication failed');
    }

    // Setup Convex client
    sendEvent({ progress: 15, status: 'Setting up connection...' });
    convex.setAuth(token);
    const { projectId } = req.body;

    // Fetch project
    sendEvent({ progress: 25, status: 'Loading project...' });
    const project = await convex.query(api.projects.getProjectById, {
      projectId: projectId as Id<"projects">
    });

    if (!project) {
      throw new Error('Project not found');
    }
    if (project.userId !== userId) {
      throw new Error('Unauthorized access to project');
    }

    // Prepare context and project details
    sendEvent({ progress: 35, status: 'Preparing project context...' });
    const context = await useContextChecker({ 
        projectId: projectId as Id<"projects">,
        token  // Pass the auth token
    });

    const projectDetails = `Overview: ${project.overview}`;
    // Prepare prompt
    sendEvent({ progress: 45, status: 'Preparing AI prompt...' });
    const prompt = `${context}\n\nGenerate an adequate number of focused, non-overlapping functional requirements that directly contribute to the project's core functionality. Each requirement MUST follow this EXACT format with no deviations:

# [Requirement Title]

## Description
[Write a concise one paragraph description explaining the requirement's purpose, its main functionality, and its value to the project. Focus on what the requirement achieves rather than how it will be implemented.]

### Sub-requirements
- [Specific, measurable action or capability that directly supports the main requirement in the following format "The system should ..."]
[continue with more requirements]

---

[Repeat format for next requirement]

IMPORTANT: 
- Ensure not to generate any introductory text or comments, start with the first requirement immediately
- Title must be clear, specific, and concise
- Description should focus on business value and purpose
- Each sub-requirement must:
  * Be specific and measurable
  * Directly contribute to the main requirement
  * Be technically feasible and clear
- Include at least 4 sub-requirements per main requirement
- Ensure each requirement is distinct and avoids overlap with others

Project details:
${projectDetails}`;

    // Generate requirements with OpenAI
    console.log("Calling OpenAI Api...");
    sendEvent({ progress: 55, status: 'Generating requirements...' });
    const completion = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Processing AI response...');
    sendEvent({ progress: 75, status: 'Processing AI response...' });


    // Validate the response
    if (!validateRequirements(content)) {
      console.log('Full content:', content); // Add full content logging
      throw new Error('Generated content does not meet the required format. Please try again.');
    }

    // Split into separate requirements using --- as delimiter
    const requirements = content
      .split(/\n\n(?=# [^\n]+)/)
      .map(req => req.trim())
      .filter(req => {
        const hasContent = req.length > 0;
        const hasTitle = req.match(/^#\s+[^\n]+/m);
        return hasContent && hasTitle;
      });

    if (requirements.length < 2) {
      throw new Error('Not enough separate requirements generated. Please try again.');
    }

    const formattedRequirements = requirements
      .map(req => {
        const titleMatch = req.match(/^# ([^\n]+)/m);
        const title = titleMatch ? titleMatch[1].trim() : null;

        return {
          title: title,
          description: req
        };
      })
      .filter(req => req !== null); // Remove any null entries

    // Validate we have requirements after filtering
    if (formattedRequirements.length === 0) {
      throw new Error('No valid requirements were generated. Please try again.');
    }

    sendEvent({ progress: 95, status: 'Finalizing...' });
    sendEvent({ progress: 100, status: 'Complete!' });
    sendEvent({
      type: 'requirements',
      content: formattedRequirements
    });

  } catch (error) {
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
    sendEvent({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      progress: 100,
      status: 'Error'
    });
  } finally {
    res.end();
  }
}


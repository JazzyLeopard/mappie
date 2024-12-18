import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { anthropic } from '@ai-sdk/anthropic';
import { getAuth } from "@clerk/nextjs/server";
import { generateText } from 'ai';
import { useContextChecker } from "@/utils/useContextChecker";

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

  // For single requirement, we only need one # header
  const mainRequirement = content.match(/^# [^\n]+$/m);
  console.log('Found requirement:', mainRequirement);

  if (!mainRequirement) {
    console.log('Validation failed: No main requirement found');
    return false;
  }

  // No need to split into sections for single requirement
  const section = content;

  console.log('Validating section:', section.substring(0, 200) + '...');

  // Update regex patterns for the new format
  const hasTitle = /^# [^\n]+/m.test(section.trim());
  const hasDescription = /^## Description\s+[^\n]+/m.test(section);
  const hasSubRequirements = /^### Sub-requirements/m.test(section);
  const hasPriorities = /Priority: (Must Have|Should Have|Could Have)/m.test(section);
  const hasMinimumSubReqs = (section.match(/- .+Priority: (Must Have|Should Have|Could Have)/g) || []).length >= 4;

  console.log('Section validation results:', {
    hasTitle,
    hasDescription,
    hasSubRequirements,
    hasPriorities,
    hasMinimumSubReqs,
    sectionStart: section.substring(0, 100)
  });

  if (!hasTitle || !hasDescription || !hasSubRequirements || !hasPriorities || !hasMinimumSubReqs) {
    console.log('Section validation failed:', {
      hasTitle,
      hasDescription,
      hasSubRequirements,
      hasPriorities,
      hasMinimumSubReqs,
      sectionContent: section.substring(0, 200)
    });
    return false;
  }

  return true;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    const serializedData = convertBigIntToNumber(data);
    res.write(`data: ${JSON.stringify(serializedData)}\n\n`);
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

    sendEvent({ progress: 5, status: 'Generating...' });
    const { userId, getToken } = getAuth(req);
    const token = await getToken({ template: "convex" });

    if (!userId || !token) {
      throw new Error('Unauthorized');
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
    const context = await useContextChecker({ projectId: projectId as Id<"projects"> });

    sendEvent({ progress: 45, status: 'Loading existing requirements...' });
    const existingFRs = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
      projectId: projectId as Id<"projects">
    });

    const existingFRNames = existingFRs?.map((fr: any) => fr?.title) || [];

    const projectDetails = `Overview: ${project.overview}`;
    // Prepare prompt
    sendEvent({ progress: 45, status: 'Preparing AI prompt...' });
    const prompt = `
    Project Context:
    ${context}
    
    Generate a single detailed functional requirement that adds onto the existing requirements. The new requirement MUST be unique and different from these existing requirements:
        
${existingFRs.length > 0 ? `${existingFRs.map((fr: any) => `${fr.title}: ${fr.description}`).join('\n')}

Current requirement IDs: ${existingFRNames.join(', ')}` : ''}

Format the requirement exactly like this:

# [Requirement Title]

## Description
[One paragraph description]

### Sub-requirements
- [Specific requirement] - **Priority: Must Have**
- [Specific requirement] - **Priority: Should Have**
- [Specific requirement] - **Priority: Could Have**
- [Specific requirement] - **Priority: Must Have**
[continue with more requirements, each with an inline priority]

IMPORTANT: 
- Title should be short and concise
- Each sub-requirement MUST end with "Priority: [level]"
- Priority levels MUST be one of: Must Have, Should Have, or Could Have
- The requirement must have at least 4 sub-requirements

Project details:
${projectDetails}

Remember: The generated requirement must provide NEW functionality not already covered by existing requirements.`;


    console.log("Calling OpenAI Api...");
    sendEvent({ progress: 55, status: 'Generating requirement...' });
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
      .split('---')
      .map(req => req.trim())
      .filter(req => {
        // Add additional validation to ensure we don't process empty requirements
        const hasContent = req.length > 0;
        const hasTitle = req.match(/^# [^\n]+/m);
        return hasContent && hasTitle;
      });

    const formattedRequirements = requirements.map(req => {
      const titleMatch = req.match(/^# ([^\n]+)/m);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Requirement';

      return {
        title,
        description: req
      };
    })
      .filter(req => req !== null);

    sendEvent({ progress: 95, status: 'Finalizing...' });
    sendEvent({ progress: 100, status: 'Complete!' });
    const requirement = formattedRequirements[0];
    sendEvent({
      done: true,
      content: {
        title: requirement.title,
        description: requirement.description
      }
    });

  } catch (error) {
    console.error('Error generating requirement:', error);
    sendEvent({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      progress: 100,
      status: 'Error'
    });
  } finally {
    res.end();
  }
}

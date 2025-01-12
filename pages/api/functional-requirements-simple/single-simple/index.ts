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
  // Split into sections using double newlines
  const sections = content.split(/\n\n(?=# [^\n]+)/).filter(section => section.trim());
  
  if (sections.length === 0) return false;

  for (const section of sections) {
    if (!section.trim()) continue;

    const hasTitle = /^#\s+[^\n]+/m.test(section.trim());
    const hasDescription = /##\s+Description\s+[^\n]+/m.test(section);
    const hasSubRequirements = /###\s+Sub-requirements/m.test(section);
    const subRequirements = section.match(/^-\s+The system should/gm);
    const hasMinimumSubReqs = subRequirements && subRequirements.length >= 4;

    if (!hasTitle || !hasDescription || !hasSubRequirements || !hasMinimumSubReqs) {
      return false;
    }
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
    const context = await useContextChecker({ 
        projectId: projectId as Id<"projects">,
        token 
    });

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

Format the requirement EXACTLY like this template (keep the exact headings and structure):

# [Single Short Requirement Title]

## Description
[One clear paragraph describing the requirement]

### Sub-requirements
- The system should [specific action or capability]
- The system should [specific action or capability]
- The system should [specific action or capability]
- The system should [specific action or capability]
- The system should [specific action or capability]

Project details:
${projectDetails}

IMPORTANT: 
1. Follow the exact format above with the same heading levels
2. Include at least 4-5 sub-requirements
3. Each sub-requirement must start with "The system should"
4. Generate only ONE requirement
5. Make sure it's unique from existing requirements
6. Do not include any additional explanatory text after the requirement format`;


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

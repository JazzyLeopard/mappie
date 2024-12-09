import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { ConvexHttpClient } from "convex/browser";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { openai } from '@ai-sdk/openai';
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

  // Check if we have multiple # headers
  const mainRequirements = content.match(/^# [^\n]+$/gm);
  console.log('Found requirements:', mainRequirements);

  if (!mainRequirements || mainRequirements.length < 2) {
    console.log('Validation failed: Not enough main requirements found');
    return false;
  }

  // Split into sections using --- as delimiter
  const sections = content.split('---').filter(section => section.trim());
  console.log(`Found ${sections.length} sections`);

  for (const section of sections) {
    if (!section.trim()) continue;
    
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
    const { projectId, singleFR } = req.body;

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

    const projectDetails = `Overview: ${project.overview}`;
    // Prepare prompt
    sendEvent({ progress: 45, status: 'Preparing AI prompt...' });
    const prompt = singleFR
      ? `${context}\n\nPlease write a single functional requirement based on the following project details:\n\n${projectDetails}`
      : `${context}\n\nCreate an adequate number of SEPARATE functional requirements based on the following project details to cover the project. Each requirement MUST follow this EXACT format with no deviations:

# [Requirement Title]

## Description
[One paragraph description]

### Sub-requirements
- [Specific requirement] - **Priority: Must Have**
- [Specific requirement] - **Priority: Should Have**
- [Specific requirement] - **Priority: Could Have**
- [Specific requirement] - **Priority: Must Have**
[continue with more requirements, each with an inline priority]

---

[Repeat format for next requirement]

IMPORTANT: 
- Each sub-requirement MUST end with "Priority: [level]"
- Priority levels MUST be one of: Must Have, Should Have, or Could Have
- Each requirement must have at least 4 sub-requirements

Project details:
${projectDetails}`;

    // Generate requirements with OpenAI
    console.log("Calling OpenAI Api...");
    sendEvent({ progress: 55, status: 'Generating requirements...' });
    const completion = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Processing AI response...');
    sendEvent({ progress: 75, status: 'Processing AI response...' });

    // Handle 'NULL' response
    if (content.trim() === 'NULL') {
      console.log('AI determined that no new requirements are needed.');
      return res.status(200).json({ message: 'NULL' });
    }

    // Validate the response
    if (!validateRequirements(content)) {
      console.log('Full content:', content); // Add full content logging
      throw new Error('Generated content does not meet the required format. Please try again.');
    }

    // Split into separate requirements using --- as delimiter
    const requirements = content
      .split('---')
      .map(req => req.trim())
      .filter(req => req.match(/^# [^\n]+/m));

    if (!singleFR && requirements.length < 2) {
      throw new Error('Not enough separate requirements generated. Please try again.');
    }

    const formattedRequirements = requirements.map(req => {
      const titleMatch = req.match(/^# ([^\n]+)/m);
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Requirement';
      
      return {
        title,
        description: req
      };
    });

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
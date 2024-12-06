import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { getAuth } from "@clerk/nextjs/server";
import { openai } from '@ai-sdk/openai';
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

// Add function to create Lexical editor state
const createMarkdownTable = (requirement: any) => {
  // Create the markdown string
  let markdown = `### Requirement ID: ${requirement.id}\n\n`;

  // Add table header with Comments column
  markdown += `| Req ID | Priority | Description | Comments |\n`;
  markdown += `|---------|----------|-------------|----------|\n`;

  // Add table rows with Comments
  requirement.rows.forEach((row: any) => {
    markdown += `| ${row.reqId} | ${row.priority} | ${row.description} | ${row.comments || ''} |\n`;
  });

  return markdown;
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

    sendEvent({ progress: 15, status: 'Setting up connection...' });
    convex.setAuth(token);
    const { projectId } = req.body;
    const convexProjectId = projectId as Id<"projects">;

    sendEvent({ progress: 25, status: 'Loading project...' });
    const project = await convex.query(api.projects.getProjectById, {
      projectId: projectId as Id<"projects">
    });

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
    const prompt = `Generate a functional requirement that adds onto the existing requirements. Here are the existing requirements:
        
    ${existingFRs.length > 0 ? `${existingFRs.map((fr: any) => `${fr.title}: ${fr.description}`).join('\n')}
    
    Current requirement IDs: ${existingFRNames.join(', ')}` : ''}
    
    Make sure to add single row with a sufficient amount of subrequirements and avoid duplicating any existing requirements. Return it in the following JSON structure:

    {
      "id": "FR-001",
      "title": "User Authentication System",
        "rows": [
          {
            "reqId": "FR_001",
            "priority": "Must have",
            "description": "The system shall provide a secure user authentication mechanism",
            "comments": "Implements industry standard security protocols"
          },
          {
            "reqId": "FR_001.1",
            "priority": "Must have",
            "description": "The system shall allow users to register with email and password",
            "comments": ""
    }
  ]
}

Project details:
${projectDetails}`;


    console.log("Calling OpenAI Api...");
    sendEvent({ progress: 55, status: 'Generating requirement...' });
    const completion = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Parsing OpenAI response...');

    // Process AI response
    sendEvent({ progress: 75, status: 'Processing AI response...' });

    let requirement;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch) {
      const jsonContent = jsonMatch[1];
      requirement = JSON.parse(jsonContent);
      console.log('Parsed requirement:', JSON.stringify(requirement, null, 2));

      if (requirement) {
        sendEvent({ progress: 75, status: 'Processing AI response...' });
        const markdownTable = createMarkdownTable(requirement);

        const formattedFr = {
          title: `${requirement.id}: ${requirement.title}`,
          description: markdownTable
        }

        sendEvent({ progress: 95, status: 'Finalizing...' });
        sendEvent({ progress: 100, status: 'Complete!' });
        sendEvent({ done: true, content: formattedFr });
      }
    } else {  
      throw new Error('No content generated from OpenAI');
    }

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

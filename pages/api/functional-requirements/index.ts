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
      : `${context}\n\nGenerate 5-10 functional requirements with detailed subrequirements based on the following project details. Format the response as markdown using this structure:

{
  "requirements": [
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
        }
      ]
    }
  ]
}

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

    console.log('Parsing OpenAI response...');

    // Process AI response
    sendEvent({ progress: 75, status: 'Processing AI response...' });

    // Handle 'NULL' response
    if (content.trim() === 'NULL') {
      console.log('AI determined that no new requirements are needed.');
      return res.status(200).json({ message: 'NULL' });
    }

    let parsedContent;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch) {
      const jsonContent = jsonMatch[1];
      parsedContent = JSON.parse(jsonContent);
      console.log('Parsed requirements:', JSON.stringify(parsedContent, null, 2));

      sendEvent({ progress: 85, status: 'Saving requirements...' });
      if (parsedContent && parsedContent.requirements) {
        const formattedRequirements = parsedContent.requirements.map((req: any) => ({
          title: `${req.id}: ${req.title}`,
          description: createMarkdownTable(req)
        }));

        sendEvent({ progress: 95, status: 'Finalizing...' });
        sendEvent({ progress: 100, status: 'Complete!' });
        sendEvent({
          type: 'requirements',
          content: formattedRequirements
        });
      }
    } else {
      throw new Error('No content generated from OpenAI');
    }

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
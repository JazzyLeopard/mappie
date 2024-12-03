import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { getAuth } from "@clerk/nextjs/server";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    sendEvent({ progress: 5, status: 'Authenticating...' });
    const { userId, getToken } = getAuth(req);
    const token = await getToken({ template: "convex" });

    if (!userId || !token) {
      throw new Error('Unauthorized');
    }

    convex.setAuth(token);

    const { projectId } = req.body;
    const convexProjectId = projectId as Id<"projects">;

    sendEvent({ progress: 15, status: 'Fetching project data...' });

    const existingFRs = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
      projectId: convexProjectId
    });

    const existingFRNames = existingFRs?.map((fr: any) => fr?.title) || [];

    let basePrompt = `Generate a functional requirement that adds onto the existing requirements. Here are the existing requirements:
        
        ${existingFRs.map((fr: any) => `${fr.title}: ${fr.description}`).join('\n')}
        
        Current requirement IDs: ${existingFRNames.join(', ')}
        
        Make sure to add multiple rows with a sufficient amount of subrequirements and avoid duplicating any existing requirements. Return it in the following JSON structure:

{
  "id": "FR-001",
  "title": "User Authentication System",
  "rows": [
    {
      "reqId": "FR_001",
      "priority": "Must have",
      "description": "The system shall provide a secure user authentication mechanism",
      "comments": ""
    },
    {
      "reqId": "FR_001.1",
      "priority": "Must have",
      "description": "The system shall allow users to register with email and password",
      "comments": ""
    }
  ]
}`;

    sendEvent({ progress: 35, status: 'Analyzing requirements...' });

    console.log("Calling OpenAI Api...");
    sendEvent({ progress: 55, status: 'Generating requirement...' });

    const completion = await generateText({
      model: openai("gpt-4o"),
      messages: [{ role: "user", content: basePrompt }],
      temperature: 0.7,
    });

    const content = completion.text;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Parsing OpenAI response...');

    let requirement;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch) {
      const jsonContent = jsonMatch[1];
      requirement = JSON.parse(jsonContent);
      console.log('Parsed requirement:', JSON.stringify(requirement, null, 2));

      if (requirement) {
        sendEvent({ progress: 75, status: 'Processing AI response...' });
        const lexicalState = createLexicalState(requirement);

        const createdFR = await convex.mutation(api.functionalRequirements.createFunctionalRequirement, {
          projectId: convexProjectId,
          title: requirement.title,
          description: lexicalState,
        });

        sendEvent({ progress: 95, status: 'Finalizing...' });
        sendEvent({ progress: 100, status: 'Complete!' });
        sendEvent({ done: true, content: createdFR });
      }
    } else {
      // Try parsing the content directly in case it's already JSON
      try {
        requirement = JSON.parse(content);
      } catch (e) {
        console.warn('Invalid response format from AI');
        throw new Error('Failed to parse AI response into valid JSON');
      }
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

function createLexicalState(requirement: any) {
  const editorState = {
    root: {
      children: [
        // Heading node
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: requirement.title,
              type: "text",
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          tag: "h3",
          version: 1
        },
        // Table node
        {
          type: "table",
          version: 1,
          children: [
            // Header row
            {
              type: "tablerow",
              version: 1,
              children: [
                {
                  type: "tablecell",
                  headerState: 1,
                  children: [{ type: "text", text: "Req ID" }]
                },
                {
                  type: "tablecell",
                  headerState: 1,
                  children: [{ type: "text", text: "Priority" }]
                },
                {
                  type: "tablecell",
                  headerState: 1,
                  children: [{ type: "text", text: "Description" }]
                },
                {
                  type: "tablecell",
                  headerState: 1,
                  children: [{ type: "text", text: "Comments" }]
                }
              ]
            },
            // Data rows
            ...requirement.rows.map((row: any) => ({
              type: "tablerow",
              version: 1,
              children: [
                {
                  type: "tablecell",
                  headerState: 0,
                  children: [{ type: "text", text: row.reqId }]
                },
                {
                  type: "tablecell",
                  headerState: 0,
                  children: [{ type: "text", text: row.priority }]
                },
                {
                  type: "tablecell",
                  headerState: 0,
                  children: [{ type: "text", text: row.description }]
                },
                {
                  type: "tablecell",
                  headerState: 0,
                  children: [{ type: "text", text: row.comments || "" }]
                }
              ]
            }))
          ]
        }
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1
    }
  };

  return JSON.stringify(editorState);
} 
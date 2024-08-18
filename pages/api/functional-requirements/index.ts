import type { NextApiRequest, NextApiResponse } from 'next'
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import OpenAI from 'openai';
import { Id } from "@/convex/_generated/dataModel";
import { getAuth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { projectId } = req.body;
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!authToken) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Valid project ID is required' });
  }

  try {
    // Set the auth token for this request
    convex.setAuth(authToken);

    const convexProjectId = projectId as Id<"projects">;
    const project = await convex.query(api.projects.getProjectById, { projectId: convexProjectId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectDetails = Object.entries(project)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `Please write functional requirements based on the following project details: ${projectDetails}. The requirement should include the following elements:

Requirement ID: A unique identifier for the requirement.
Title: A brief, descriptive title summarizing the requirement.
Requirement: A detailed description of the functionalitis that the system should provide regarding this requirement. Create a list of sub-requirements that each start with 'The system shall ...'. Ensure the sub-requirements are clear, concise, and free of ambiguity.
Priority: Indicate the importance of this requirement (e.g., Must have, Should have, Could have).
Traceability: Link the requirement to a specific business goal or objective that it supports.

Use the language of the project details to write the functional requirements. Order them from most important to least important. Make sure they are detailed and clear. If the input is too short or missing key points, add suggestions to make a complete list. If the requirements can be made more granular by splitting them up, please do so. Use plain language that anyone can understand. Format the output as a markdown list, with each requirement as a separate item.`;

    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    console.log('OpenAI API response received');

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }


    console.log('Creating functional requirements...');
    const existingFR = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, { projectId: convexProjectId });
    
    if (existingFR) {
      await convex.mutation(api.functionalRequirements.updateFunctionalRequirement, {
        id: existingFR._id,
        content: content,
      });
    } else {
      await convex.mutation(api.functionalRequirements.createFunctionalRequirement, {
        projectId: convexProjectId,
        content: content,
      });
    }
    console.log('Functional requirements created successfully');

    res.status(200).json({ content: content });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating functional requirements', error: error instanceof Error ? error.message : String(error) });
  }
}
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

    const prompt = `Please write functional requirements based on the following project details: ${projectDetails}. The requirements should include the following elements with each element starting on a new line:

- **Requirement ID**: A unique identifier for the requirement.
- **Title**: A brief, descriptive title summarizing the requirement.
- **Requirement**: A detailed description of the functionalities that the system should provide regarding this requirement. Create a list of sub-requirements that each start with "The system shall ...". Ensure the sub-requirements are clear, concise, and free of ambiguity.
- **Priority**: Indicate the importance of this requirement (e.g., Must have, Should have, Could have).
- **Traceability**: Link the requirement to a specific business goal or objective that it supports.

Format the output as follows:
- Each requirement should be presented as an H3 heading (### Requirement ID: ID).
- Follow each heading with the details of the requirement, including the description, priority, and traceability.
- Ensure that the requirements are ordered from most important to least important.
- Ensure that all the elements are indented and aligned properly for each element - Title, Requirement, Priority and Traceability.
- Use plain language that anyone can understand. 
- If the input is too short or missing key points, add suggestions to make a complete list. 
- If the requirements can be made more granular by splitting them up, please do so.

Do not include any main headings or titles at the top of the output. Provide the response in complete Markdown format only, without any additional explanations or information.`

    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
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
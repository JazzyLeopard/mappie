import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getAuth } from "@clerk/nextjs/server"; // Import getAuth

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data, instructions, projectDetails } = req.body;

  console.log("type", type);
  console.log("type", data);
  console.log("type", instructions);


  // Validate the request body contains all required fields
  if (!type || !data || !instructions || !projectDetails) {
    return res.status(400).json({
      response: 'The request is missing required fields: type, data, instructions, or projectDetails.',
    });
  }



  // try {
  // const prompt = `You're an experienced project manager and scrum master with over 10 years of hands-on experience in managing diverse teams and delivering successful projects using Agile methodologies. I am giving you a Project Property {${type}} help me follow the instructions passed by the user on the data provided below: ${JSON.stringify(data)} ${instructions} and give me response in complete MARKDOWN format only without any explanation also remove the headings or headers or titles if any and don't add extra information or fields just follow the instructions`;
  const jsonReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  try {
    const { type, data, instructions, projectDetails, context } = req.body;

    if (!type || !instructions || !projectDetails || !context) {
      console.error('Missing fields:', { type, data, instructions, projectDetails, context });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Retrieve the auth token from the request headers
    const authHeader = req.headers.authorization;
    const authToken = authHeader && authHeader.split(' ')[1];

    if (!authToken) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const prompt = data === "Generate content based on the provided instructions"
      ? `${instructions}\n\nProject Details: ${JSON.stringify(projectDetails)}`
      : `${instructions}\n\nCurrent content:\n${data}\n\nProject Details: ${JSON.stringify(projectDetails)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
    });

    const aiResponse = completion.choices[0].message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    res.status(200).json({ response: aiResponse });
  } catch (error: any) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
}

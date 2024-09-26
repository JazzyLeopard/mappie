// pages/api/projects/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data, instructions, projectDetails } = req.body;

  console.log("type", type);
  console.log("type", data);
  console.log("type", instructions);


  // Validate the request body contains all required fields
  if (!type || !instructions || !projectDetails) {
    return res.status(400).json({
      response: 'The request is missing required fields: type, instructions, or projectDetails.',
    });
  }

  const jsonReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  try {
    let prompt;
    if (data) {
      prompt = `You're an experienced project manager and scrum master. You're working on a project with the following details:

      ${JSON.stringify(projectDetails, jsonReplacer, 2)}

      Now, for the project property "${type}", ${instructions}

      Current content for ${type}: ${data}
        
        Please provide your response in complete MARKDOWN format.Do not include any JSON formatting or additional explanations or any top headings. Only include information directly related to the instructions.`;
    } else {
      prompt = `You're an experienced project manager and scrum master. You're working on a project with the following details:

      ${JSON.stringify(projectDetails, jsonReplacer, 2)}

      Please generate the content for the project property "${type}" based on the following instructions: ${instructions}.
        
      Please provide your response in complete MARKDOWN format. Do not include any JSON formatting or additional explanations or any top headings. Only include information directly related to the instructions.`;
    }


    const completions = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You're an experienced product manager and business analyst." },
        { role: "user", content: prompt }
      ],
    });

    const aiResponse = completions.choices[0].message.content;
    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

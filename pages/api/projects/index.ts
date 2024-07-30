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
  
  const {type, data, instructions} = req.body;

  console.log("type", type);
  console.log("type", data);
  console.log("type", instructions);
  

    // Validate the request body contains all required fields
    if (!type || !data || !instructions) {
      return res.status(400).json({
        response: 'The request is missing required fields: type, data, or instructions.',
      });
    }

    try {
      const prompt = `You're an experienced project manager and scrum master with over 10 years of hands-on experience in managing diverse teams and delivering successful projects using Agile methodologies. I am giving you a Project Property {${type}} help me follow the instructions passed by the user on the data provided below: ${JSON.stringify(data)} ${instructions} and give me response in complete MARKDOWN format only without any explanation also remove the headings or headers if any`;
      
      const completions = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });
  
      const aiResponse = completions.choices[0].message.content;
      return res.status(200).json({ response: aiResponse });
    } catch (error) {
      console.error('Error processing AI request:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

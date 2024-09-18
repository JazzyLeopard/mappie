// pages/api/complete/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";

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

  const { preFilled, required } = req.body;

  // Validate the request body contains all required fields
  if (!preFilled || !required) {
    return res.status(400).json({
      error: 'The request is missing required fields: preFilled or required.',
    });
  }

  // Construct the prompt
  const prompt = `
    You're an experienced project manager and scrum master with over 10 years of hands-on experience in managing diverse teams and delivering successful projects using Agile methodologies.
   
    You're provided with the below details / fields of Project filled by the user:
    ${preFilled.map((field: { key: any; value: any; }) => `${field.key}: ${field.value}`).join('\n')}
    
    Based on the fields I have shared, Help me generate the below fields / details:

    ${required.join(', ')}

    Return ONLY the json response as below without any explanations or other details:
    [{"key": "value"}]

    The keys in the JSON response should match the keys provided in the required fields, and the value should be the generated content for each field.
  `;

  try {
    const completions = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = completions.choices[0].message.content;

    // Parse the AI response to ensure it is in the expected format
    // const parsedResponse = JSON.parse(aiResponse);

    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

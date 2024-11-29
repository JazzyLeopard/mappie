import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { oldContent, newContent } = req.body;

    try {
      const response = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes changes between two pieces of text."
          },
          {
            role: "user",
            content: `Summarize the main changes between these two texts:\n\nOld:\n${oldContent}\n\nNew:\n${newContent}. List them in bullet points. Be concise.`
          }
        ],
      });

      const summary = response.text;
      res.status(200).json({ summary });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while summarizing changes' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
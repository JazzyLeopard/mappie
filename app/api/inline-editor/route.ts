import OpenAI from "openai";
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { $getRoot, createEditor } from 'lexical';
import { diffLines } from 'diff';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { prompt, selectedText, fullText } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI writing assistant. You will receive the full text and a selected portion to improve. Generate an improved version that maintains the context and formatting. Return only the complete text with the improvement integrated."
        },
        {
          role: "user",
          content: `Full text: "${fullText}"
Selected text to improve: "${selectedText}"
Prompt: ${prompt}
Keep the markdown formatting intact and return the complete text with the improvement integrated.`
        }
      ],
    });

    const newFullText = completion.choices[0].message.content ?? '';
    
    // Find the changed portion by comparing the old and new text
    const diff = diffLines(fullText, newFullText);
    const changedPortion = diff
      .filter(part => part.added)
      .map(part => part.value)
      .join('\n');

    return new Response(JSON.stringify({ 
      text: newFullText, // Full text for when user accepts
      diff: changedPortion // Only the changed portion for the suggestion card
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate route:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate text' }), 
      { status: 500 }
    );
  }
}
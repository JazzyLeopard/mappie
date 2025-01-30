import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [{
        role: 'user',
        content: `Generate a concise, one-line description for this template content. Focus on its purpose and key elements: \n\n${content}`
      }],
      temperature: 0.7,
      maxTokens: 150,
    });

    return NextResponse.json({
      description: result.text
    });

  } catch (error) {
    console.error("Error generating template description:", error);
    return NextResponse.json(
      { error: "Failed to generate template description" },
      { status: 500 }
    );
  }
}

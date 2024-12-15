import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { useContextChecker } from '@/utils/useContextChecker';
import { Id } from '@/convex/_generated/dataModel';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

    const { prompt, projectId, selectedText, selectedItemContent, selectedItemType, selectedEpic } = await request.json();
    const convexProjectId = projectId as Id<"projects">;

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt or projectId' },
        { status: 400 }
      );
    }

    // Get project context
    const context = await useContextChecker({ projectId: convexProjectId });

    const systemPrompt = {
      role: 'system',
      content: `You are an AI assistant specialized in agile project management and content generation.
      
      Important response guidelines:
      - Provide clear, structured responses
      - Focus on actionable recommendations
      - Be concise and specific

      Current ${selectedItemType} content to consider:
      ${selectedItemContent}
      
      ${selectedItemType === 'userStory' ? `
        For user stories:
        - Focus on user value and measurable business outcomes
        - Use precise format: "As a [specific user role], I want [concrete action] so that [measurable benefit]"
        - Structure with Gherkin scenarios:
          * Given [clear context]
          * When [specific action]
          * Then [verifiable outcome]
        - Ensure alignment with epic context: ${selectedEpic?.name} - ${selectedEpic?.description}
        - Include acceptance criteria that are testable and measurable
        ` : selectedItemType === 'epic' ? `
        For epics:
        - Define clear business objectives and success metrics
        - Articulate value proposition and stakeholder benefits
        - Outline high-level scope and boundaries
        - Include key dependencies and constraints
        - Define measurable success criteria
        - Consider potential risks and mitigation strategies
        ` : `
        For other content:
        - Be specific and actionable
        - Include clear acceptance criteria
        - Focus on implementation details`}

      Ensure all content is:
      - Detailed and unambiguous
      - Aligned with agile best practices
      - Testable and measurable
      - Focused on delivering value`
    };

    const userMessage = {
      role: 'user',
      content: `${selectedText ? `Selected text for context:\n${selectedText}\n\n` : ''}User request: ${prompt}`
    };

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [systemPrompt as any, userMessage as any],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      content: result.text,
      usage: result.usage
    });

  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

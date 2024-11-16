import { streamText } from 'ai';
import { tools } from '@/ai/tools';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { messages, selectedItemContent, selectedItemType, selectedEpic } = await request.json();

  // Add system prompt based on content type
  const systemPrompt = {
    role: 'system',
    content: `You are an AI assistant specialized in agile project management and content generation.
    Always use the displayMarkdown tool to show content suggestions and don't repeat it in regular text.
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

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: [systemPrompt, ...messages],
    tools,
    experimental_toolCallStreaming: true,
    maxSteps: 5,
    onFinish: ({ usage }) => {
      const { promptTokens, completionTokens, totalTokens } = usage;
      console.log('Prompt tokens:', promptTokens);
      console.log('Completion tokens:', completionTokens); 
      console.log('Total tokens:', totalTokens);
    }
  });

  return result.toDataStreamResponse({
    headers: {
      'Connection': 'keep-alive', 
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
    }
  });
}
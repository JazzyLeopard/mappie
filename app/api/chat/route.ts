import { streamText } from 'ai';
import { tools } from '@/ai/tools';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  try {
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

    const body = await request.json();
    const { messages, selectedItemContent, selectedItemType, selectedEpic } = body;

    // Clean and validate messages
    const validatedMessages = messages
      .filter((msg: any) => msg.content || (msg.toolInvocations && msg.toolInvocations.length > 0))
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content || '',
        // Only include valid tool calls
        ...(msg.toolInvocations?.some((tool: any) => 
          tool.state === 'result' && 
          tool.result?.content
        ) ? {
          tool_calls: msg.toolInvocations
            .filter((tool: any) => tool.state === 'result' && tool.result?.content)
            .map((tool: any) => ({
              id: tool.toolCallId,
              type: 'function',
              function: {
                name: tool.toolName,
                arguments: JSON.stringify(tool.args || {})
              }
            }))
        } : {})
      }));

    // Add system prompt based on content type
    const systemPrompt = {
      role: 'system',
      content: `You are an AI assistant specialized in agile project management and content generation.
      
      Important response guidelines:
      1. Always use the displayMarkdown tool to show content suggestions
      2. After using the displayMarkdown tool, your response should only include:
         - Brief context or explanations if needed
         - Questions to gather more information
         - Next steps or recommendations
      3. NEVER repeat the content that was shown in the displayMarkdown tool

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

    const result = await streamText({
      model: openai('gpt-4o-mini'),  // Fixed model name
      messages: [systemPrompt, ...validatedMessages],  // Use validated messages
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
  } catch (error) {
    console.error('Error in POST route:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
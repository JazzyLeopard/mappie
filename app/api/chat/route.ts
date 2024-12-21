import { streamText } from 'ai';
import { tools } from '@/ai/tools';
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(request: Request) {
  try {
    console.log('Received chat request:', {
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url
    });
    console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing');

    // Read the body only once and store it
    const body = await request.json();
    console.log('Request body:', body);

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
      model: anthropic('claude-3-5-sonnet-20241022'),  // Fixed model name
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
    console.error('Chat API Error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
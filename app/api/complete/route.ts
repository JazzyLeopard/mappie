import { generateText } from 'ai';
import { anthropic } from "@ai-sdk/anthropic";
import { useContextChecker } from '@/utils/useContextChecker';
import { Id } from '@/convex/_generated/dataModel';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    convex.setAuth(token);

    const { 
      prompt, 
      projectId, 
      selectedText = '', 
      selectedItemContent = '', 
      selectedItemType = '', 
      selectedEpic = null 
    } = await request.json();

    const convexProjectId = projectId as Id<"projects">;

    const project = await convex.query(api.projects.getProjectById, {
      projectId: convexProjectId
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to project' },
        { status: 403 }
      );
    }

    const context = await useContextChecker({ 
      projectId: convexProjectId, 
      token 
    });

    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt or projectId' },
        { status: 400 }
      );
    }

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
      model: anthropic('claude-3-5-sonnet-20241022'),
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

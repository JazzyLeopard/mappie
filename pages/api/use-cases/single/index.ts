import { NextApiRequest, NextApiResponse } from "next";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import { useContextChecker } from "@/utils/useContextChecker";
import { getAuth } from "@clerk/nextjs/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from 'ai';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function convertDescriptionToMarkdown(description: any): string {
  let markdown = '';

  if (typeof description === 'string') {
    return description;
  }

  if (description.actors) {
    markdown += `## Actors\n`;
    if (description.actors.primary) {
      markdown += `- Primary: ${description.actors.primary}\n`;
    }
    if (description.actors.secondary) {
      markdown += `- Secondary: ${Array.isArray(description.actors.secondary) ? description.actors.secondary.join(', ') : description.actors.secondary}\n`;
    }
    markdown += '\n';
  }

  if (description.creation_date) markdown += `**Creation Date:** ${description.creation_date}\n`;
  if (description.update_date) markdown += `**Update Date:** ${description.update_date}\n`;
  if (description.version) markdown += `**Version:** ${description.version}\n`;
  if (description.person_in_charge) markdown += `**Person in Charge:** ${description.person_in_charge}\n\n`;

  if (description.preconditions && Array.isArray(description.preconditions)) {
    markdown += `## Preconditions\n${description.preconditions.map((p: string) => `- ${p}`).join('\n')}\n\n`;
  }

  if (description.main_success_scenario && Array.isArray(description.main_success_scenario)) {
    markdown += "## Main Success Scenario\n";
    description.main_success_scenario.forEach((step: string, index: number) => {
      markdown += `${index + 1}. ${step}\n`;
    });
    markdown += '\n';
  }

  if (description.alternative_scenarios && Array.isArray(description.alternative_scenarios)) {
    markdown += "## Alternative Scenarios\n";
    description.alternative_scenarios.forEach((scenario: any) => {
      markdown += `### ${scenario.name}\n`;
      markdown += `Starts at step ${scenario.start_point} of the main scenario.\n`;
      if (scenario.steps && Array.isArray(scenario.steps)) {
        scenario.steps.forEach((step: string, index: number) => {
          markdown += `${index + 1}. ${step}\n`;
        });
      }
      markdown += `Returns to step ${scenario.return_point} of the main scenario.\n\n`;
    });
  }

  if (description.error_scenarios && Array.isArray(description.error_scenarios)) {
    markdown += "## Error Scenarios\n";
    description.error_scenarios.forEach((scenario: any) => {
      markdown += `### ${scenario.name}\n`;
      markdown += `Can occur at step ${scenario.start_point} of the main scenario.\n`;
      if (scenario.steps && Array.isArray(scenario.steps)) {
        scenario.steps.forEach((step: string, index: number) => {
          markdown += `${index + 1}. ${step}\n`;
        });
      }
      if (scenario.end_state) markdown += `End state: ${scenario.end_state}\n`;
      markdown += '\n';
    });
  }

  if (description.postconditions && Array.isArray(description.postconditions)) {
    markdown += `## Postconditions\n${description.postconditions.map((p: string) => `- ${p}`).join('\n')}\n\n`;
  }

  if (description.ui_requirements && Array.isArray(description.ui_requirements)) {
    markdown += `## UI Requirements\n${description.ui_requirements.map((r: string) => `- ${r}`).join('\n')}\n\n`;
  }

  if (description.performance_requirements && Array.isArray(description.performance_requirements)) {
    markdown += `## Performance Requirements\n${description.performance_requirements.map((r: string) => `- ${r}`).join('\n')}\n\n`;
  }

  if (description.frequency_of_use) markdown += `**Frequency of Use:** ${description.frequency_of_use}\n`;
  if (description.criticality) markdown += `**Criticality:** ${description.criticality}\n`;

  return markdown;
}

// Add this helper function to format functional requirements
const formatFunctionalRequirements = (requirements: any[]) => {
  return requirements.map(req => {
    try {
      // For simple FR format, just return the description directly since it's markdown
      if (req.description.startsWith('#')) {
        return req.description;
      }

      // For legacy table format, try parsing JSON
      try {
        const description = JSON.parse(req.description);

        // Handle table format
        if (description?.root?.children) {
          const table = description.root.children.find((child: any) => child.type === 'table');
          if (table?.children) {
            return table.children
              .slice(1)
              .map((row: any) => {
                const cells = row.children;
                if (cells?.[0]?.children?.[0]?.text && cells?.[2]?.children?.[0]?.text) {
                  return `${cells[0].children[0].text}: ${cells[2].children[0].text}`;
                }
                return '';
              })
              .filter(Boolean)
              .join('\n');
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, return the raw description
        return req.description;
      }

      return req.title || '';
    } catch (error) {
      console.error('Error processing requirement:', error);
      return '';
    }
  })
    .filter(Boolean)
    .join('\n\n');
};

const extractJsonFromResponse = (content: string): any[] => {
  try {
    // First, try to parse the content directly as JSON
    const parsed = JSON.parse(content);
    // Check if the response has a use_cases array
    if (parsed.use_cases && Array.isArray(parsed.use_cases)) {
      return parsed.use_cases;
    }
    // If not, ensure we always return an array
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    // If direct parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error('Failed to parse extracted JSON:', e);
        throw new Error('Invalid JSON format in the response');
      }
    }

    // If no JSON block is found, try to find an array in the content
    const arrayMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error('Failed to parse array from content:', e);
        throw new Error('Invalid JSON array format in the response');
      }
    }

    throw new Error('No valid JSON found in the response');
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Check if it's an SSE request
    const isSSE = req.headers.accept === 'text/event-stream';
    if (!isSSE) {
      throw new Error('Invalid request type');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Authentication
    sendEvent({ progress: 5, status: 'Generating...' });
    const { userId, getToken } = getAuth(req);
    const token = await getToken({ template: "convex" });

    if (!token || !userId) {
      throw new Error('Authentication failed');
    }

    // Setup Convex client
    sendEvent({ progress: 15, status: 'Setting up connection...' });
    convex.setAuth(token);
    const { projectId } = req.body;

    const context = await useContextChecker({ projectId })
    console.log("context", context);

    // Fetch project
    sendEvent({ progress: 25, status: 'Loading project...' });
    const project = await convex.query(api.projects.getProjectById, {
      projectId: projectId as Id<"projects">
    });

    if (!project) {
      throw new Error('Project not found');
    }
    if (project.userId !== userId) {
      throw new Error('Unauthorized access to project');
    }

    // Fetch functional requirements
    const functionalRequirements = await convex.query(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
      projectId: projectId as Id<"projects">
    });

    const projectDetails = `Overview: ${project.overview}`;

    sendEvent({ progress: 35, status: 'Loading functional requirements...' });
    const formattedRequirements = formatFunctionalRequirements(functionalRequirements);

    // Fetch the exsisting use cases
    const useCases = await convex.query(api.useCases.getUseCasesByProjectId, { projectId });

    if (!useCases) {
      return res.status(400).json({ message: "No Use cases found for the project" });
    }

    const useCasesText = useCases.map((useCase: any) => useCase.description).join('\n');

    sendEvent({ progress: 45, status: 'Generating use case...' });
    let basePrompt = context;

    basePrompt += `As an expert use case analyst, generate one unique additional use case for the following project. The use case should be detailed and specific to the project's needs, following this exact structure and level of detail, don't use Heading 1 and 2:

{
  "title": "Use Case Title",
  "description": {
    "actors": {
      "primary": "Main actor",
      "secondary": ["Supporting actor 1", "Supporting actor 2"]
    },
    "preconditions": [
      "Required condition 1",
      "Required condition 2"
    ],
    "main_success_scenario": [
      "Step 1",
      "Step 2"
    ],
    "alternative_scenarios": [
      {
        "name": "Alternative Path Name",
        "start_point": 2,
        "steps": [
          "Alternative step 1",
          "Alternative step 2"
        ],
        "return_point": 3
      }
    ],
    "error_scenarios": [
      {
        "name": "Error Scenario Name",
        "start_point": 2,
        "steps": [
          "Error handling step 1",
          "Error handling step 2"
        ]
      }
    ],
    "postconditions": [
      "Result 1",
      "Result 2"
    ],
    "ui_requirements": [
      "UI element 1",
      "UI element 2"
    ]
  }
}`;

    // Update the prompt to request a JSON response
    const singleUseCasePrompt = `Based on the following project details-${projectDetails},functional requirements-${formattedRequirements} and existing usecases-${useCasesText} generate one more use case using this format- ${basePrompt}. If no additional use case is needed and the existing use cases suffice the requirements, return 'NULL'. Follow this exact structure and level of detail, Format the output as a JSON array of objects. Wrap the entire JSON output in a Markdown code block, don't use Heading h1 and h2 in the Markdown.
    `;

    sendEvent({ progress: 55, status: 'Calling OpenAI API...' });
    console.log('Calling OpenAI API...');
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [{ role: "user", content: singleUseCasePrompt }],
      temperature: 0.7,
    });
    console.log('OpenAI API response received');

    const content = response.text;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Parsing OpenAI response...');

    // Utility function to handle BigInt serialization
    const serializeBigInt = (obj: any) => {
      return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
    };

    sendEvent({ progress: 65, status: 'Parsing use cases...' });
    let generatedUseCase;
    try {
      generatedUseCase = extractJsonFromResponse(content);
      console.log('Parsed use cases:', JSON.stringify(generatedUseCase, null, 2));
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
    console.log('Parsed use cases:', JSON.stringify(generatedUseCase, null, 2));

    sendEvent({ progress: 75, status: 'Creating use case...' });
    if (generatedUseCase && generatedUseCase[0]?.description) {
      const formattedDescription = convertDescriptionToMarkdown
        (generatedUseCase[0]?.description)

      let useCaseId = await convex.mutation(api.useCases.createUseCase, {
        projectId: projectId,
        title: generatedUseCase[0]?.title || "Untitled Use Case",
        description: formattedDescription
      })
      generatedUseCase[0]['id'] = useCaseId

      const serializedUseCase = serializeBigInt(useCaseId);
      console.log("use case id", serializedUseCase);
    }

    sendEvent({ progress: 85, status: 'Use cases created successfully' });
    console.log('Use cases created successfully');
    sendEvent({ progress: 95, status: 'Finalizing...' });
    sendEvent({ progress: 100, status: 'Complete!' });
    sendEvent({
      done: true,
      type: 'complete',
      useCases: serializeBigInt(generatedUseCase)
    });
  }
  catch (error) {
    console.error('API Error:', error);
    sendEvent({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      progress: 100,
      status: 'Error'
    });
  } finally {
    res.end();
  }
}


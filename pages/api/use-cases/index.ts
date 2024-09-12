import type { NextApiRequest, NextApiResponse } from 'next'
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import OpenAI from 'openai';
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { projectId } = req.body;
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!authToken) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Valid project ID is required' });
  }

  try {
    // Set the auth token for this request
    convex.setAuth(authToken);

    const convexProjectId = projectId as Id<"projects">;
    const project = await convex.query(api.projects.getProjectById, { projectId: convexProjectId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectDetails = Object.entries(project)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `As an expert systems analyst, generate a comprehensive list of use cases for the following project. Each use case should be detailed and specific to the project's needs, following this exact structure and level of detail, don't use Heading 1 and 2:

{
  "title": "Withdraw Cash from ATM",
  "description": {
    "actors": {
      "primary": "Visa CardHolder",
      "secondary": "Visa AS"
    },
    
    "preconditions": [
      "The ATM cash box is well stocked.",
      "There is no card in the reader."
    ],
    "main_success_scenario": [
      "The Visa CardHolder inserts his or her smartcard in the ATM's card reader.",
      "The ATM verifies that the card that has been inserted is indeed a smartcard.",
      "The ATM asks the Visa CardHolder to enter his or her pin number.",
      "The Visa CardHolder enters his or her pin number.",
      "The ATM compares the pin number with the one that is encoded on the chip of the smartcard.",
      "The ATM requests an authorisation from the VISA authorisation system.",
      "The VISA authorisation system confirms its agreement and indicates the daily withdrawal limit.",
      "The ATM asks the Visa CardHolder to enter the desired withdrawal amount.",
      "The Visa CardHolder enters the desired withdrawal amount.",
      "The ATM checks the desired amount against the daily withdrawal limit.",
      "The ATM asks the Visa CardHolder if he or she would like a receipt.",
      "The Visa CardHolder requests a receipt.",
      "The ATM returns the card to the Visa CardHolder.",
      "The Visa CardHolder takes his or her card.",
      "The ATM issues the banknotes and a receipt.",
      "The Visa CardHolder takes the banknotes and the receipt."
    ],
    "alternative_scenarios": [
      {
        "name": "A1: temporarily incorrect pin number",
        "start_point": 5,
        "steps": [
          "The ATM informs the CardHolder that the pin is incorrect for the first or second time.",
          "The ATM records the failure on the smartcard."
        ],
        "return_point": 3
      },
      {
        "name": "A2: the amount requested is greater than the daily withdrawal limit",
        "start_point": 10,
        "steps": [
          "The ATM informs the CardHolder that the amount requested is greater than the daily withdrawal limit."
        ],
        "return_point": 8
      },
      {
        "name": "A3: the Visa CardHolder does not want a receipt",
        "start_point": 11,
        "steps": [
          "The Visa CardHolder declines the offer of a receipt.",
          "The ATM returns the smartcard to the Visa CardHolder.",
          "The Visa CardHolder takes his or her smartcard.",
          "The ATM issues the banknotes.",
          "The Visa CardHolder takes the banknotes."
        ],
        "return_point": "end"
      }
    ],
    "error_scenarios": [
      {
        "name": "E1: invalid card",
        "start_point": 2,
        "steps": [
          "The ATM informs the Visa CardHolder that the smartcard is not valid (unreadable, expired, etc.) and confiscates it; the use case fails."
        ]
      },
      {
        "name": "E2: conclusively incorrect pin number",
        "start_point": 5,
        "steps": [
          "The ATM informs the Visa CardHolder that the pin is incorrect for the third time.",
          "The ATM confiscates the smartcard.",
          "The VISA authorisation system is notified; the use case fails."
        ]
      },
      {
        "name": "E3: unauthorised withdrawal",
        "start_point": 6,
        "steps": [
          "The VISA authorisation system forbids any withdrawal.",
          "The ATM ejects the smartcard; the use case fails."
        ]
      },
      {
        "name": "E4: the card is not taken back by the holder",
        "start_point": 13,
        "steps": [
          "After 15 seconds, the ATM confiscates the smartcard.",
          "The VISA authorisation system is notified; the use case fails."
        ]
      },
      {
        "name": "E5: the banknotes are not taken by the holder",
        "start_point": 15,
        "steps": [
          "After 30 seconds, the ATM takes back the banknotes.",
          "The VISA authorisation system is informed; the use case fails."
        ]
      }
    ],
    "postconditions": [
      "The cashbox of the ATM contains fewer notes than it did at the start of the use case (the number of notes missing depends on the withdrawal amount)."
    ],
    "ui_requirements": [
      "A smartcard reader.",
      "A numerical keyboard (to enter his or her pin number), with "enter", "correct" and "cancel" keys.",
      "A screen to display any messages from the ATM.",
      "Keys around the screen so that the card holder can select a withdrawal amount from the amounts that are offered.",
      "A note dispenser.",
      "A receipt dispenser."
    ]
  }
}

Generate enough use cases to cover all the functional requirements of the project, following this exact structure and level of detail. Be creative and consider edge cases that might not be immediately obvious. Format the output as a JSON array of objects, each containing 'title' and 'description' fields as shown in the structure above. Wrap the entire JSON output in a Markdown code block.
Use the language of the project, don't use Heading 1 and Heading 2 in Markdown.

Project Details:
${projectDetails}`;

    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    console.log('OpenAI API response received');

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Parsing OpenAI response...');
    let generatedUseCases;
    try {
      // Extract JSON from Markdown code block
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the response');
      }
      const jsonContent = jsonMatch[1];
      generatedUseCases = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    console.log('Parsed use cases:', JSON.stringify(generatedUseCases, null, 2));

    console.log('Creating use cases...');
    for (const useCase of generatedUseCases) {
      if (useCase && useCase.description) {
        const formattedDescription = convertDescriptionToMarkdown(useCase.description);
        await convex.mutation(api.useCases.createUseCase, {
          projectId: convexProjectId,
          title: useCase.title || 'Untitled Use Case',
          description: formattedDescription,
        });
      } else {
        console.warn('Skipping invalid use case:', useCase);
      }
    }
    console.log('Use cases created successfully');

    res.status(200).json({ useCases: generatedUseCases, markdown: convertDescriptionToMarkdown(generatedUseCases[0]?.description || {}) });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Error generating use cases', error: error instanceof Error ? error.message : String(error) });
  }
}
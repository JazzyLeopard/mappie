'use server'

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

// Define our user story schema
const userStorySchema = z.object({
  title: z.string(),
  description: z.object({
    as_a: z.string(),
    i_want_to: z.string(),
    so_that: z.string(),
    acceptance_criteria: z.array(z.object({
      scenario: z.string(),
      given: z.string(),
      when: z.string(),
      then: z.string()
    }))
  })
});

export async function generateUserStory(
  prompt: string,
  epicContext?: {
    name?: string;
    description?: string;
  }
) {
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai('gpt-4'),
      system: `You are an AI assistant specialized in creating user stories.
        ${epicContext ? `
        Context:
        Epic: ${epicContext.name || 'Untitled Epic'}
        Description: ${epicContext.description || 'No description provided'}
        ` : ''}
        
        Create a well-structured user story that follows these guidelines:
        1. Title should be clear and concise
        2. Use standard user story format (As a..., I want to..., So that...)
        3. Include specific, testable acceptance criteria
        4. Ensure alignment with the epic's goals (if provided)`,
      prompt,
      schema: userStorySchema
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
} 
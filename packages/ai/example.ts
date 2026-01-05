/* eslint-disable no-console */
import 'dotenv/config';

import { OpenAIClient } from '@/ai/client';
import { RecipeExamplePrompts } from '@/ai/prompts';

const recipe =
  'To make fluffy scrambled eggs, start by cracking three eggs into a bowl and whisking them with a pinch of salt and a splash of milk until well combined. Heat a non-stick skillet over medium-low heat and add a tablespoon of butter. Once the butter has melted and is slightly foamy, pour in the eggs. Let them sit undisturbed for a few seconds, then gently stir with a spatula, pushing the eggs from the edges to the center. Continue cooking and stirring until the eggs are just set and creamy, then remove from heat. Serve immediately with a sprinkle of freshly ground black pepper and chopped chives if desired.';

const runOpenAiExample = async (): Promise<void> => {
  const openAiClient = new OpenAIClient({
    systemPrompt: RecipeExamplePrompts.config,
  });
  const completion = await openAiClient.sendPrompt({
    prompt: RecipeExamplePrompts.recipePrompt,
    content: recipe,
  });

  console.log('Completion:\n %o', completion);
};

runOpenAiExample().catch((error) => {
  const e = error as Error;
  console.error('Error running OpenAI example: %o', e.message, e);
});

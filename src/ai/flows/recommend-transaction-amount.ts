'use server';

/**
 * @fileOverview An AI agent to recommend transaction amounts based on user history.
 *
 * - recommendTransactionAmount - A function that recommends transaction amounts.
 * - RecommendTransactionAmountInput - The input type for the recommendTransactionAmount function.
 * - RecommendTransactionAmountOutput - The return type for the recommendTransactionAmount function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTransactionAmountInputSchema = z.object({
  transactionHistory: z
    .array(z.number())
    .describe("The user's last 3 transactions of a specific type."),
  transactionType: z
    .enum(['deposit', 'withdrawal'])
    .describe('The transaction type.'),
  previousSuggestions: z
    .array(z.number())
    .optional()
    .describe(
      'A list of previously suggested amounts to avoid suggesting them again.'
    ),
});
export type RecommendTransactionAmountInput = z.infer<
  typeof RecommendTransactionAmountInputSchema
>;

const RecommendTransactionAmountOutputSchema = z.object({
  recommendedAmounts: z
    .array(z.number())
    .describe('The list of recommended amounts for the transaction.'),
});
export type RecommendTransactionAmountOutput = z.infer<
  typeof RecommendTransactionAmountOutputSchema
>;

export async function recommendTransactionAmount(
  input: RecommendTransactionAmountInput
): Promise<RecommendTransactionAmountOutput> {
  return recommendTransactionAmountFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendTransactionAmountPrompt',
  input: {schema: RecommendTransactionAmountInputSchema},
  output: {schema: RecommendTransactionAmountOutputSchema},
  prompt: `You are a helpful assistant that suggests transaction amounts. You will be given a user's last 3 transactions for a specific transaction type.

Your task is to return three sensible transaction amounts based on the provided history.

-   If the transaction history is empty, you MUST return [500, 1000, 2000].
-   If the transaction history is not empty, you MUST analyze the amounts and suggest three different round numbers. These numbers should be close to the previous transaction amounts and rounded to the nearest 500 or 1000. For example, if the history is [480, 510, 495], you could suggest [500, 1000, 1500]. If the history is [2100, 2200, 1900], you could suggest [1500, 2000, 2500]. DO NOT return [500, 1000, 2000] if there is a transaction history.
{{#if previousSuggestions}}
-   The user has already seen the following suggestions: {{{previousSuggestions}}}. It is CRITICAL that you provide different suggestions this time. DO NOT repeat any of the previous suggestions.
{{/if}}

Transaction Type: {{transactionType}}
Transaction History: {{{transactionHistory}}}

Return ONLY the three suggested amounts. Do not include any other text or explanation.`,
});

const areArraysEqual = (a: number[], b: number[]): boolean => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);
    return sortedA.every((value, index) => value === sortedB[index]);
};


const recommendTransactionAmountFlow = ai.defineFlow(
  {
    name: 'recommendTransactionAmountFlow',
    inputSchema: RecommendTransactionAmountInputSchema,
    outputSchema: RecommendTransactionAmountOutputSchema,
  },
  async input => {
    // If the history is empty, provide default suggestions immediately.
    if (input.transactionHistory.length === 0) {
      return {
        recommendedAmounts: [500, 1000, 2000],
      };
    }

    const {output} = await prompt(input);

    const fallback = () => {
        const avg = input.transactionHistory.reduce((a, b) => a + b, 0) / input.transactionHistory.length;
        let suggestion1 = Math.round(avg / 500) * 500;
        if(suggestion1 === 0) suggestion1 = 500;

        // If we have previous suggestions, try to make new ones
        if (input.previousSuggestions && input.previousSuggestions.includes(suggestion1)) {
            suggestion1 += 500;
        }

        const suggestions = [suggestion1, suggestion1 + 500, suggestion1 + 1000].filter(v => v > 0);
        // Ensure suggestions are different from previous ones
        if (input.previousSuggestions && areArraysEqual(suggestions, input.previousSuggestions)) {
            return {
                recommendedAmounts: suggestions.map(s => s + 250)
            }
        }
        return {
            recommendedAmounts: suggestions,
        };
    }

    if (output && output.recommendedAmounts && output.recommendedAmounts.length > 0) {
      // Basic check to see if the AI is just returning the default values.
      const isDefault = areArraysEqual(output.recommendedAmounts, [500, 1000, 2000]);

      // Check if the AI returned the same suggestions as before
      const isRepeated = input.previousSuggestions && areArraysEqual(output.recommendedAmounts, input.previousSuggestions);

      if ((isDefault && input.transactionHistory.length > 0) || isRepeated) {
         // Fallback if AI returns default values or repeated values
        return fallback();
      }
      return {
        recommendedAmounts: output.recommendedAmounts,
      };
    } else {
      // Fallback in case the AI fails to generate a valid response
      return fallback();
    }
  }
);

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
  transactionHistory: z.array(z.number()).describe('The user\'s last 3 transactions of a specific type.'),
  transactionType: z.enum(['deposit', 'withdrawal']).describe('The transaction type.'),
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

Transaction Type: {{transactionType}}
Transaction History: {{{transactionHistory}}}

Return ONLY the three suggested amounts. Do not include any other text or explanation.`,
});

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

    if (output && output.recommendedAmounts && output.recommendedAmounts.length > 0) {
      // Basic check to see if the AI is just returning the default values.
      const isDefault = JSON.stringify(output.recommendedAmounts.sort((a,b) => a-b)) === JSON.stringify([500, 1000, 2000]);
      if (isDefault) {
         // Fallback if AI returns default values for a non-empty history
        const avg = input.transactionHistory.reduce((a, b) => a + b, 0) / input.transactionHistory.length;
        const suggestion1 = Math.round(avg / 500) * 500;
        return {
            recommendedAmounts: [suggestion1, suggestion1 + 500, suggestion1 + 1000].filter(v => v > 0),
        };
      }
      return {
        recommendedAmounts: output.recommendedAmounts,
      };
    } else {
      // Fallback in case the AI fails to generate a valid response
        const avg = input.transactionHistory.reduce((a, b) => a + b, 0) / input.transactionHistory.length;
        const suggestion1 = Math.round(avg / 500) * 500;
        return {
            recommendedAmounts: [suggestion1, suggestion1 + 500, suggestion1 + 1000].filter(v => v > 0),
        };
    }
  }
);

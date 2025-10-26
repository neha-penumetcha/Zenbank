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
  transactionHistory: z.array(z.number()).describe('The user transaction history.'),
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
  prompt: `You are an expert financial advisor. Your task is to suggest three transaction amounts to a user based on their past behavior.

Analyze the user's transaction history for the specified transaction type.

1.  **Calculate the average transaction amount.**
2.  Based on the average, suggest three distinct, rounded amounts for a new {{transactionType}}.
3.  One suggestion should be slightly lower than the average, one should be close to the average, and one should be slightly higher.
4.  The amounts should be sensible round numbers. For example, if the average is 483, you could suggest 400, 500, and 600. If the average is 1120, you could suggest 1000, 1100, and 1200.
5.  If the user has a higher number of transactions (e.g., more than 10), you can provide more varied but still relevant suggestions.

Transaction History: {{{transactionHistory}}}
Transaction Type: {{{transactionType}}}

Only return the three suggested amounts. Do not provide any explanations.
If the transaction history is empty, suggest amounts: 500, 1000, and 2000.`,
});

const recommendTransactionAmountFlow = ai.defineFlow(
  {
    name: 'recommendTransactionAmountFlow',
    inputSchema: RecommendTransactionAmountInputSchema,
    outputSchema: RecommendTransactionAmountOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && output.recommendedAmounts && output.recommendedAmounts.length > 0) {
      return {
        recommendedAmounts: output.recommendedAmounts,
      };
    } else {
      // If the prompt does not produce recommended amounts, return some default values
      return {
        recommendedAmounts: [500, 1000, 2000],
      };
    }
  }
);

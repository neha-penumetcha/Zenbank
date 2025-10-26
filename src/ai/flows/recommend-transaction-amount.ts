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
Analyze the user's transaction history provided below for the specified transaction type. The number of transactions should also influence your suggestions.
The amounts should be round numbers close to the user's previous transaction amounts. For example, if they often transact around 480, you could suggest 500. If they transact for 1100, you could suggest 1000 or 1200.
If the user has a higher number of transactions, you can provide more varied suggestions.
Transaction History: {{{transactionHistory}}}
Transaction Type: {{{transactionType}}}

Based on this, suggest three distinct, rounded amounts for a new {{transactionType}}. Do not provide any explanations, just the numbers.
If the transaction history is empty, suggest amounts like 500, 1000, and 2000.`,
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

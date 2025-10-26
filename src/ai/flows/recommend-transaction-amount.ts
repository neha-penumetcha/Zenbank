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
  prompt: `You are an expert financial advisor. You will analyze the user's transaction history and transaction type and determine the amounts they would like to deposit or withdraw.
Transaction History: {{{transactionHistory}}}
Transaction Type: {{{transactionType}}}

Based on this information, what are three different amounts that the user is likely to {{transactionType}}? Do not provide any explanations, just the numbers.`,
});

const recommendTransactionAmountFlow = ai.defineFlow(
  {
    name: 'recommendTransactionAmountFlow',
    inputSchema: RecommendTransactionAmountInputSchema,
    outputSchema: RecommendTransactionAmountOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && output.recommendedAmounts) {
      return {
        recommendedAmounts: output.recommendedAmounts,
      };
    } else {
      // If the prompt does not produce recommended amounts, return some default values
      return {
        recommendedAmounts: [20, 50, 100],
      };
    }
  }
);

'use server';

import { recommendTransactionAmount, type RecommendTransactionAmountInput } from '@/ai/flows/recommend-transaction-amount';

export async function getAiSuggestions(input: RecommendTransactionAmountInput): Promise<number[]> {
  try {
    const result = await recommendTransactionAmount(input);
    return result.recommendedAmounts.sort((a,b) => a - b) || [];
  } catch (error) {
    console.error('AI suggestion failed:', error);
    // Return default or empty array on failure
    return [20, 50, 100];
  }
}

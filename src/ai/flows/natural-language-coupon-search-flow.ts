'use server';
/**
 * @fileOverview A Genkit flow for intelligently suggesting relevant coupons based on natural language queries.
 *
 * - naturalLanguageCouponSearch - A function that handles the natural language coupon search process.
 * - NaturalLanguageCouponSearchInput - The input type for the naturalLanguageCouponSearch function.
 * - NaturalLanguageCouponSearchOutput - The return type for the naturalLanguageCouponSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NaturalLanguageCouponSearchInputSchema = z.object({
  query: z.string().describe('The natural language query from the user (e.g., "coupons for coffee shops nearby", "discounts for electronics", "pizza deals for tonight").'),
});
export type NaturalLanguageCouponSearchInput = z.infer<typeof NaturalLanguageCouponSearchInputSchema>;

const NaturalLanguageCouponSearchOutputSchema = z.object({
  category: z.string().nullable().describe('The product or service category identified in the query (e.g., "coffee shops", "electronics", "pizza"). Returns null if no category is specified.'),
  brand: z.string().nullable().describe('The specific brand or store identified in the query (e.g., "Starbucks", "Best Buy", "Domino\u0027s"). Returns null if no brand is specified.'),
  location: z.string().nullable().describe('The location constraint identified in the query (e.g., "nearby", "online", "in-store"). Returns null if no location is specified.'),
  timeConstraint: z.string().nullable().describe('The time-based constraint identified in the query (e.g., "tonight", "this weekend", "tomorrow"). Returns null if no time constraint is specified.'),
});
export type NaturalLanguageCouponSearchOutput = z.infer<typeof NaturalLanguageCouponSearchOutputSchema>;

export async function naturalLanguageCouponSearch(input: NaturalLanguageCouponSearchInput): Promise<NaturalLanguageCouponSearchOutput> {
  return naturalLanguageCouponSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageCouponSearchPrompt',
  input: { schema: NaturalLanguageCouponSearchInputSchema },
  output: { schema: NaturalLanguageCouponSearchOutputSchema },
  prompt: `You are an expert coupon search assistant. Your task is to extract key entities from a user's natural language query to help them find relevant coupons.

From the following user query, identify and extract the:
- 'category': The general product or service category.
- 'brand': The specific brand or store.
- 'location': Any location-based constraints (e.g., "nearby", "online").
- 'timeConstraint': Any time-based constraints (e.g., "tonight", "this weekend").

If an entity is not explicitly mentioned or clearly implied, return its value as 'null'.

User Query: "{{{query}}}"`,
});

const naturalLanguageCouponSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageCouponSearchFlow',
    inputSchema: NaturalLanguageCouponSearchInputSchema,
    outputSchema: NaturalLanguageCouponSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

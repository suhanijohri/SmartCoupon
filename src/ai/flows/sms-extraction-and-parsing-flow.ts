'use server';
/**
 * @fileOverview A Genkit flow for extracting coupon details from SMS messages.
 *
 * - extractCouponDetails - A function that handles the SMS coupon extraction process.
 * - SmsExtractionAndParsingInput - The input type for the extractCouponDetails function.
 * - SmsExtractionAndParsingOutput - The return type for the extractCouponDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmsExtractionAndParsingInputSchema = z.object({
  smsContent: z.string().describe('The content of the promotional SMS message.'),
});
export type SmsExtractionAndParsingInput = z.infer<typeof SmsExtractionAndParsingInputSchema>;

const SmsExtractionAndParsingOutputSchema = z.object({
  couponCode: z
    .string()
    .describe('The extracted coupon code, if available. If not found, return an empty string.'),
  brand: z.string().describe('The brand or store associated with the coupon.'),
  discountValue: z.number().describe('The numerical value of the discount.'),
  discountType: z
    .enum(['PERCENTAGE', 'FLAT_AMOUNT'])
    .describe('The type of discount: PERCENTAGE for % off, FLAT_AMOUNT for a fixed amount off.'),
  expiryDate: z
    .string()
    .optional()
    .describe('The expiry date of the coupon in ISO 8601 format (YYYY-MM-DD), if available.'),
});
export type SmsExtractionAndParsingOutput = z.infer<typeof SmsExtractionAndParsingOutputSchema>;

export async function extractCouponDetails(
  input: SmsExtractionAndParsingInput
): Promise<SmsExtractionAndParsingOutput> {
  return smsExtractionAndParsingFlow(input);
}

const smsExtractionAndParsingPrompt = ai.definePrompt({
  name: 'smsExtractionAndParsingPrompt',
  input: {schema: SmsExtractionAndParsingInputSchema},
  output: {schema: SmsExtractionAndParsingOutputSchema},
  prompt: `You are an expert at parsing promotional SMS messages to extract coupon details.

Carefully read the following SMS content and extract the coupon code, the brand/store name, the discount value, the type of discount (percentage or flat amount), and the expiry date.

If a coupon code is not explicitly mentioned, return an empty string for 'couponCode'.
If an expiry date is mentioned, provide it in ISO 8601 format (YYYY-MM-DD). If no expiry date is found, omit the field.

SMS Content: {{{smsContent}}}`,
});

const smsExtractionAndParsingFlow = ai.defineFlow(
  {
    name: 'smsExtractionAndParsingFlow',
    inputSchema: SmsExtractionAndParsingInputSchema,
    outputSchema: SmsExtractionAndParsingOutputSchema,
  },
  async (input) => {
    const {output} = await smsExtractionAndParsingPrompt(input);
    return output!;
  }
);

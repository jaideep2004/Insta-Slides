'use server';

/**
 * @fileOverview An AI agent to automatically adjust text size and wrapping for optimal image layout.
 *
 * - autoAdjustText - A function that handles the text auto-adjustment process.
 * - AutoAdjustTextInput - The input type for the autoAdjustText function.
 * - AutoAdjustTextOutput - The return type for the autoAdjustText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoAdjustTextInputSchema = z.object({
  text: z.string().describe('The text to be auto-adjusted.'),
  imageWidth: z.number().describe('The width of the image in pixels.'),
  imageHeight: z.number().describe('The height of the image in pixels.'),
  font: z.string().optional().default('Arial').describe('The font to use for the text.'),
});
export type AutoAdjustTextInput = z.infer<typeof AutoAdjustTextInputSchema>;

const AutoAdjustTextOutputSchema = z.object({
  fontSize: z.number().describe('The optimal font size for the text.'),
  wrappedText: z.string().describe('The text wrapped to fit the image dimensions.'),
});
export type AutoAdjustTextOutput = z.infer<typeof AutoAdjustTextOutputSchema>;

export async function autoAdjustText(input: AutoAdjustTextInput): Promise<AutoAdjustTextOutput> {
  return autoAdjustTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoAdjustTextPrompt',
  input: {schema: AutoAdjustTextInputSchema},
  output: {schema: AutoAdjustTextOutputSchema},
  prompt: `You are an expert layout designer. Given the following text, image width, and image height, determine the optimal font size and wrap the text so that it neatly fits within the image.

Text: {{{text}}}
Image Width: {{{imageWidth}}}px
Image Height: {{{imageHeight}}}px
Font: {{{font}}}

Consider readability and visual appeal. The wrappedText must not exceed the image dimensions.

Ensure the response is a valid JSON object.`, //Crucially, ask for a valid JSON object
});

const autoAdjustTextFlow = ai.defineFlow(
  {
    name: 'autoAdjustTextFlow',
    inputSchema: AutoAdjustTextInputSchema,
    outputSchema: AutoAdjustTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

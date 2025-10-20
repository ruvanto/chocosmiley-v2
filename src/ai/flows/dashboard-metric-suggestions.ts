'use server';

/**
 * @fileOverview AI flow for suggesting relevant dashboard metrics and visualizations based on tracked data.
 *
 * - suggestDashboardMetrics - A function that generates dashboard metric suggestions.
 * - DashboardMetricSuggestionsInput - The input type for the suggestDashboardMetrics function.
 * - DashboardMetricSuggestionsOutput - The return type for the suggestDashboardMetrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardMetricSuggestionsInputSchema = z.object({
  revenueData: z.string().describe('Revenue data in JSON format, including categories and amounts.'),
  expenseData: z.string().describe('Expense data in JSON format, including categories and amounts.'),
  profitData: z.string().describe('Profit data in JSON format, including categories and amounts.'),
});
export type DashboardMetricSuggestionsInput = z.infer<typeof DashboardMetricSuggestionsInputSchema>;

const DashboardMetricSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      metric: z.string().describe('The suggested metric to display.'),
      visualization: z.string().describe('The suggested visualization type (e.g., chart, graph, table).'),
      reason: z.string().describe('Reasoning for suggesting this metric and visualization.'),
    })
  ).describe('A list of suggested metrics and visualizations for the dashboard.'),
});
export type DashboardMetricSuggestionsOutput = z.infer<typeof DashboardMetricSuggestionsOutputSchema>;

export async function suggestDashboardMetrics(input: DashboardMetricSuggestionsInput): Promise<DashboardMetricSuggestionsOutput> {
  return suggestDashboardMetricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardMetricSuggestionsPrompt',
  input: {schema: DashboardMetricSuggestionsInputSchema},
  output: {schema: DashboardMetricSuggestionsOutputSchema},
  prompt: `You are an AI assistant that suggests relevant metrics and visualizations for a business dashboard based on the provided revenue, expense, and profit data.

  Analyze the data to identify key trends, insights, and potential areas of interest for the business owner.

  Provide suggestions for metrics to display on the dashboard, along with the most appropriate visualization type for each metric. Explain the reasoning behind each suggestion.

  Revenue Data: {{{revenueData}}}
  Expense Data: {{{expenseData}}}
  Profit Data: {{{profitData}}}

  Format your output as a JSON array of objects, where each object has the following keys:
  - metric: The suggested metric to display.
  - visualization: The suggested visualization type (e.g., chart, graph, table).
  - reason: Reasoning for suggesting this metric and visualization.
  `,
});

const suggestDashboardMetricsFlow = ai.defineFlow(
  {
    name: 'suggestDashboardMetricsFlow',
    inputSchema: DashboardMetricSuggestionsInputSchema,
    outputSchema: DashboardMetricSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

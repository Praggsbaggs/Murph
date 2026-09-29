import { z } from "zod";

export const WhatWorkedItemSchema = z.object({
  ad: z.string().describe("The name of the ad that performed well"),
  insight: z.string().describe("Specific data-backed insight explaining what made it successful based on the metrics"),
});

export const WhatDidntItemSchema = z.object({
  ad: z.string().describe("The name of the ad that underperformed"),
  insight: z.string().describe("Specific data-backed insight explaining why it underperformed based on the metrics"),
});

export const NextTestItemSchema = z.object({
  hypothesis: z.string().describe("Testable hypothesis formulated as: 'If we change X, then Y will improve because...'"),
  variable_to_change: z.string().describe("Single variable to isolate and change (e.g., Headline, Hook, Call-to-Action, Target Audience)"),
  success_metric: z.string().describe("Primary metric used to judge the winner (e.g., CTR > 3.5%, CPA < $25, ROAS > 3.0x)"),
});

export const AIPostMortemSchema = z.object({
  headline: z.string().describe("A punchy, one-sentence executive summary of the overall campaign performance"),
  what_worked: z.array(WhatWorkedItemSchema).describe("List of top-performing ads with metric-backed insights"),
  what_didnt: z.array(WhatDidntItemSchema).describe("List of underperforming ads with metric-backed insights"),
  possible_reasons: z.array(z.string()).describe("Plausible marketing hypotheses for why certain ads won or lost"),
  next_tests: z.array(NextTestItemSchema).describe("Actionable A/B testing recommendations changing only one variable at a time"),
  confidence_note: z.string().describe("An objective assessment of data confidence, accounting for sample size and statistical reliability"),
});

export type AIPostMortemReport = z.infer<typeof AIPostMortemSchema>;
export type WhatWorkedItem = z.infer<typeof WhatWorkedItemSchema>;
export type WhatDidntItem = z.infer<typeof WhatDidntItemSchema>;
export type NextTestItem = z.infer<typeof NextTestItemSchema>;

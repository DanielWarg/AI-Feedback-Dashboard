import { z } from 'zod'

export const AnalyzeResponseSchema = z.object({
  suggestions: z.array(z.string()).min(2).max(3),
  tone: z.enum(['positive', 'neutral', 'negative']),
  alternative_text: z.string()
})

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>

export const GenerateRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  suggestions: z.array(z.string()).min(1),
  selected_suggestions: z.array(z.boolean()),
  temperature: z.number().min(0).max(2).default(0.7)
})

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>

export const GenerateResponseSchema = z.object({
  generated_text: z.string()
})

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>

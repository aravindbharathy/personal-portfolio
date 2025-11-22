import { z } from 'zod';

export const tagCategoryEnum = z.enum([
  'RESEARCH_METHOD',
  'INDUSTRY',
  'TOPIC',
  'TOOL',
  'SKILL',
]);

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  category: tagCategoryEnum,
});

export const tagQuerySchema = z.object({
  category: tagCategoryEnum.optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type TagQueryInput = z.infer<typeof tagQuerySchema>;

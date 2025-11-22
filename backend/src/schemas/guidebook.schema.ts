import { z } from 'zod';

export const createGuidebookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  area: z.string().min(1, 'Area is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  coverImage: z.string().url().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export const updateGuidebookSchema = createGuidebookSchema.partial();

export const addArticleToGuidebookSchema = z.object({
  publicationId: z.string(),
  order: z.number().int().min(0),
  customTitle: z.string().optional(),
  customExcerpt: z.string().optional(),
});

export const guidebookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['lastUpdated', 'createdAt', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateGuidebookInput = z.infer<typeof createGuidebookSchema>;
export type UpdateGuidebookInput = z.infer<typeof updateGuidebookSchema>;
export type AddArticleToGuidebookInput = z.infer<typeof addArticleToGuidebookSchema>;
export type GuidebookQueryInput = z.infer<typeof guidebookQuerySchema>;

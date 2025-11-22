import { z } from 'zod';

export const platformEnum = z.enum(['MEDIUM', 'SUBSTACK', 'EXTERNAL', 'INTERNAL']);

export const createPublicationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(1000),
  content: z.string().optional(),
  platform: platformEnum,
  externalUrl: z.string().url('Invalid URL'),
  publishedAt: z.string().datetime('Invalid date format'),
  readTime: z.number().int().positive().optional(),
  featured: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
  tagIds: z.array(z.string()),
});

export const updatePublicationSchema = createPublicationSchema.partial();

export const publicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  platform: platformEnum.optional(),
  tag: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(['publishedAt', 'createdAt', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const syncPublicationsSchema = z.object({
  platforms: z.array(platformEnum).optional(),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
export type PublicationQueryInput = z.infer<typeof publicationQuerySchema>;
export type SyncPublicationsInput = z.infer<typeof syncPublicationsSchema>;

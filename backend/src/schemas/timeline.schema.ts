import { z } from 'zod';

export const contentTypeEnum = z.enum(['PUBLICATION', 'GUIDEBOOK', 'PROJECT']);

export const timelineQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  contentType: contentTypeEnum.optional(),
  tags: z.array(z.string()).or(z.string()).optional(),
});

export type TimelineQueryInput = z.infer<typeof timelineQuerySchema>;

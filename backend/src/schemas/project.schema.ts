import { z } from 'zod';

export const researchTypeEnum = z.enum(['FOUNDATIONAL', 'EVALUATIVE', 'GENERATIVE', 'MIXED']);

export const projectImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  order: z.number().int().min(0),
});

export const projectLinkSchema = z.object({
  title: z.string().min(1, 'Link title is required'),
  url: z.string().url('Invalid link URL'),
});

export const projectGridPictureSchema = z.object({
  url: z.string().url('Invalid picture URL'),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  order: z.number().int().min(0),
});

export const projectPictureGridSchema = z.object({
  position: z.enum([
    'before_objectives',
    'after_objectives',
    'before_methodology',
    'after_methodology',
    'before_findings',
    'after_findings',
    'before_impact',
    'after_impact',
  ]),
  columns: z.number().int().min(1).max(3),
  order: z.number().int().min(0).default(0),
  pictures: z.array(projectGridPictureSchema).min(1, 'At least one picture is required'),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  overview: z.string().min(10, 'Overview must be at least 10 characters').max(1000),
  objectives: z.string().min(10, 'Objectives must be at least 10 characters'),
  methodology: z.string().min(10, 'Methodology must be at least 10 characters'),
  findings: z.string().min(10, 'Findings must be at least 10 characters'),
  impact: z.string().min(10, 'Impact must be at least 10 characters'),

  // Custom section headings (optional, have defaults in DB)
  objectivesHeading: z.string().min(1).max(100).optional(),
  methodologyHeading: z.string().min(1).max(100).optional(),
  findingsHeading: z.string().min(1).max(100).optional(),
  impactHeading: z.string().min(1).max(100).optional(),

  coverImage: z.string().url('Invalid cover image URL').optional(),
  timeframe: z.string().min(1).max(100).optional(),
  duration: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.string().optional(),
  participants: z.string().optional(),
  researchType: researchTypeEnum,
  industry: z.string().optional(),
  methodsUsed: z.array(z.string()),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  order: z.number().int().min(0).default(0),
  tagIds: z.array(z.string()),
  images: z.array(projectImageSchema).optional(),
  links: z.array(projectLinkSchema).optional(),
  pictureGrids: z.array(projectPictureGridSchema).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  researchType: researchTypeEnum.optional(),
  industry: z.string().optional(),
  tag: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

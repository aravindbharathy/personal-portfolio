import { z } from 'zod';

export const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
});

export const updateAboutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().min(1, 'Title is required').max(200),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  profilePic: z.string().url('Invalid profile picture URL').optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  location: z.string().max(200).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

export type UpdateAboutInput = z.infer<typeof updateAboutSchema>;

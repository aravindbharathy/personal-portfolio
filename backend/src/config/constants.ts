export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // Rate limiting
  RATE_LIMIT_PUBLIC: parseInt(process.env.RATE_LIMIT_PUBLIC || '100'),
  RATE_LIMIT_AUTH: parseInt(process.env.RATE_LIMIT_AUTH || '500'),
  RATE_LIMIT_CONTACT: parseInt(process.env.RATE_LIMIT_CONTACT || '5'),

  // File upload
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'), // 5MB

  // Cache times (in seconds)
  CACHE_TIMELINE: 300, // 5 minutes
  CACHE_PROJECTS: 300, // 5 minutes
  CACHE_PUBLICATIONS: 600, // 10 minutes
  CACHE_GUIDEBOOKS: 900, // 15 minutes
  CACHE_TAGS: 3600, // 1 hour

  // External sync
  MEDIUM_API_URL: 'https://api.medium.com/v1',

  // Email
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'contact@example.com',
} as const;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',');

declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;
    DIRECT_DATABASE_URL?: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;

    // Next.js
    NEXT_PUBLIC_API_URL?: string;
    NODE_ENV: 'development' | 'production' | 'test';

    // External APIs
    MEDIUM_API_KEY?: string;
    MEDIUM_USER_ID?: string;
    SUBSTACK_RSS_URL?: string;

    // File Upload
    UPLOAD_MAX_SIZE?: string;
    BLOB_READ_WRITE_TOKEN?: string;

    // Cloudinary (alternative)
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;

    // Email
    SENDGRID_API_KEY?: string;
    SENDGRID_FROM_EMAIL?: string;
    RESEND_API_KEY?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    CONTACT_EMAIL?: string;

    // Rate Limiting
    RATE_LIMIT_PUBLIC?: string;
    RATE_LIMIT_AUTH?: string;
    RATE_LIMIT_CONTACT?: string;

    // CORS
    ALLOWED_ORIGINS?: string;

    // Analytics
    GOOGLE_ANALYTICS_ID?: string;
    VERCEL_ANALYTICS_ID?: string;

    // Error Tracking
    SENTRY_DSN?: string;

    // Admin
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
  }
}

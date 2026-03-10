# Backend Dockerfile for containerized deployment (Railway / Cloud Run)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# Note: Public directory may not exist for API-only apps
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Copy the startup script
COPY --from=builder /app/package.json ./package.json

# Regenerate Prisma Client for the runtime environment
# This ensures the binary matches the Alpine Linux runtime
RUN npx prisma generate

USER nextjs

EXPOSE ${PORT:-8080}

ENV PORT=${PORT:-8080}
ENV HOSTNAME="0.0.0.0"

# Run migrations and start server
# Skip migrations if DB connection unavailable (assume pre-migrated)
CMD ["sh", "-c", "npx prisma migrate deploy || true && node server.js"]

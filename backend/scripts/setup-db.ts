#!/usr/bin/env tsx

/**
 * Database Setup Script
 * Run this script to initialize the database from scratch
 */

import { execSync } from 'child_process';

console.log('🚀 Starting database setup...\n');

try {
  console.log('1️⃣  Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\n2️⃣  Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

  console.log('\n3️⃣  Seeding database with initial data...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

  console.log('\n✅ Database setup completed successfully!');
  console.log('\n📊 You can view your database using Prisma Studio:');
  console.log('   npm run db:studio');
} catch (error) {
  console.error('\n❌ Error during database setup:', error);
  process.exit(1);
}

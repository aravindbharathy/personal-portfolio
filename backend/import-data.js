const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres@localhost:5433/portfolio'
    }
  }
});

async function main() {
  try {
    console.log('Reading dump file...');
    const dump = fs.readFileSync('/tmp/portfolio_data.sql', 'utf-8');
    
    console.log('Executing SQL dump...');
    // Execute the dump
    const result = await prisma.$executeRawUnsafe(dump);
    
    console.log('✓ Data imported successfully!');
  } catch (error) {
    console.error('✗ Import failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123';

  console.log('Resetting admin user...');

  // Delete existing user if exists
  await prisma.user.deleteMany({
    where: { email },
  });

  console.log('Old user deleted (if existed)');

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Password hashed');

  // Create new admin user
  await prisma.user.create({
    data: {
      email,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('\n✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:    admin@example.com');
  console.log('Password: admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nLogin at: http://localhost:8081/admin/login');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

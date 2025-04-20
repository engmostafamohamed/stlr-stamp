import { PrismaClient, Prisma } from '@prisma/client';

import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    'admin',
    'customer',
    'employee',
    'merchant',
    'branch_manager',
  ];

  // Create all roles
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }


  const adminEmail = 'admin@admin.com';
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Get the admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  // Create admin user if not exists
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      username: 'admin',
      email: adminEmail,
      phone: '0000000000',
      password: adminPassword,
      roles: {
        connect: [{ id: adminRole.id }],
      },
    } as Prisma.UserCreateInput
  });

  console.log('Admin user seeded.');
}

main()
  .catch((e) => {
    console.error('Seeder failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

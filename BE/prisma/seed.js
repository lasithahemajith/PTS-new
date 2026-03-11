import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


async function main() {
    const email = process.env.SUPERADMIN_EMAIL;
    const plainPassword = process.env.SUPERADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);  
    await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
        name: 'Main Tutor',
        email,
        password: hashedPassword,
        role: 'Tutor',
    },
    });
  console.log('✅ Super Admin created');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

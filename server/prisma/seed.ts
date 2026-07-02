import { PrismaClient, UserRole, WithdrawalWindow, BannerType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Admin User
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@platform.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      referralCode: 'ADMINREF',
      availableBalance: 0,
      lockedBalance: 0,
    },
  });
  console.log('Admin user created/verified');

  // 2. Investment Plans
  // Deactivate all existing plans first
  await prisma.investmentPlan.updateMany({
    data: { active: false },
  });

  const plans = [
    {
      id: 'plan-package-a',
      name: 'Package A',
      minAmount: 3000,
      maxAmount: 50000,
      roiPercent: 30,
      durationHours: 60 * 24, // 60 Days
      displayOrder: 1
    },
    {
      id: 'plan-package-b',
      name: 'Package B',
      minAmount: 51000,
      maxAmount: 1000000,
      roiPercent: 30,
      durationHours: 90 * 24, // 90 Days
      displayOrder: 2
    },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        roiPercent: plan.roiPercent,
        durationHours: plan.durationHours,
        displayOrder: plan.displayOrder,
        active: true,
      },
      create: {
        id: plan.id,
        name: plan.name,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        roiPercent: plan.roiPercent,
        durationHours: plan.durationHours,
        displayOrder: plan.displayOrder,
        active: true,
      },
    });
  }
  console.log('Investment plans created/verified');

  // 3. System Settings
  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      withdrawalWindow: WithdrawalWindow.DAILY,
      withdrawalFreeze: false,
      maintenanceMode: false,
      commissionRate: 10,
      minWithdrawal: 1000,
      maxWithdrawal: 1000000,
    },
  });
  console.log('System settings created/verified');

  // 4. Sample Banners
  const banners = [
    { message: 'Welcome to our investment platform! Start earning today.', type: BannerType.INFO },
    { message: 'Maintenance scheduled for Sunday at 2 PM UTC.', type: BannerType.WARNING },
  ];

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: `banner-${banner.type.toLowerCase()}` },
      update: {
        message: banner.message,
        type: banner.type,
      },
      create: {
        id: `banner-${banner.type.toLowerCase()}`,
        message: banner.message,
        type: banner.type,
      },
    });
  }
  console.log('Sample banners created');

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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
  const plans = [
    { name: 'Starter', minAmount: 3000, maxAmount: 4999, roiPercent: 15, durationHours: 24, displayOrder: 1 },
    { name: 'Bronze', minAmount: 5000, maxAmount: 9999, roiPercent: 20, durationHours: 24, displayOrder: 2 },
    { name: 'Silver', minAmount: 10000, maxAmount: 49999, roiPercent: 25, durationHours: 48, displayOrder: 3 },
    { name: 'Gold', minAmount: 50000, maxAmount: 99999, roiPercent: 30, durationHours: 48, displayOrder: 4 },
    { name: 'Platinum', minAmount: 100000, maxAmount: 499999, roiPercent: 40, durationHours: 168, displayOrder: 5 }, // 7 days
    { name: 'Diamond', minAmount: 500000, maxAmount: 10000000, roiPercent: 50, durationHours: 360, displayOrder: 6 }, // 15 days
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { id: `plan-${plan.name.toLowerCase()}` }, // Stable ID for seeding
      update: {
        name: plan.name,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        roiPercent: plan.roiPercent,
        durationHours: plan.durationHours,
        displayOrder: plan.displayOrder,
      },
      create: {
        id: `plan-${plan.name.toLowerCase()}`,
        name: plan.name,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        roiPercent: plan.roiPercent,
        durationHours: plan.durationHours,
        displayOrder: plan.displayOrder,
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

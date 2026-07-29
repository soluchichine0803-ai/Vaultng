import { PrismaClient, UserRole, WithdrawalWindow, BannerType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Admin User
  const adminPassword = 'admin';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      email: 'admin@platform.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
    },
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
  console.log('Admin user created/verified with credentials: admin@platform.com / admin');

  // 2. Investment Plans
  const supportedPlans = [
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

  const supportedPlanIds = supportedPlans.map(p => p.id);

  // Identify and handle legacy plans
  const existingPlans = await prisma.investmentPlan.findMany({
    include: { _count: { select: { investments: true } } }
  });

  for (const existingPlan of existingPlans) {
    if (!supportedPlanIds.includes(existingPlan.id)) {
      if (existingPlan._count.investments === 0) {
        // Safe to delete if no investments
        await prisma.investmentPlan.delete({ where: { id: existingPlan.id } });
        console.log(`Deleted legacy plan: ${existingPlan.name}`);
      } else {
        // Deactivate if investments exist
        await prisma.investmentPlan.update({
          where: { id: existingPlan.id },
          data: { active: false }
        });
        console.log(`Deactivated legacy plan (preserved for history): ${existingPlan.name}`);
      }
    }
  }

  // Upsert supported plans
  for (const plan of supportedPlans) {
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
  console.log('Investment plans synced');

  // 3. System Settings - Only create if none exist
  const existingSettings = await prisma.systemSettings.findFirst();
  if (!existingSettings) {
    await prisma.systemSettings.create({
      data: {
        id: 1,
        withdrawalWindow: WithdrawalWindow.DAILY,
        withdrawalFreeze: false,
        maintenanceMode: false,
        commissionRate: 10,
        minWithdrawal: 1000,
        maxWithdrawal: 1000000,
      },
    });
    console.log('Default system settings created');
  } else {
    console.log('System settings already exist, skipping');
  }

  // 4. Sample Banners - Only create if none exist
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    const banners = [
      { id: 'banner-info', message: 'Welcome to our investment platform! Start earning today.', type: BannerType.INFO },
      { id: 'banner-warning', message: 'Maintenance scheduled for Sunday at 2 PM UTC.', type: BannerType.WARNING },
    ];

    for (const banner of banners) {
      await prisma.banner.create({
        data: banner,
      });
    }
    console.log('Sample banners created');
  } else {
    console.log('Banners already exist, skipping');
  }

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

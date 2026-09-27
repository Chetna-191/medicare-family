import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { format, subDays, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MediCare Family database...');

  // Clean existing records
  await prisma.doseLog.deleteMany();
  await prisma.medicineTiming.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@medicare.family',
      password: hashedPassword,
      name: 'The Miller Family',
    },
  });
  console.log(`👤 Created demo user: ${user.email}`);

  // Create 3 family members
  const grandpa = await prisma.familyMember.create({
    data: {
      userId: user.id,
      name: 'Arthur Miller',
      relation: 'Grandfather',
      age: 72,
      avatarColor: 'indigo',
    },
  });

  const mom = await prisma.familyMember.create({
    data: {
      userId: user.id,
      name: 'Sarah Miller',
      relation: 'Mother',
      age: 42,
      avatarColor: 'emerald',
    },
  });

  const leo = await prisma.familyMember.create({
    data: {
      userId: user.id,
      name: 'Leo Miller',
      relation: 'Son',
      age: 8,
      avatarColor: 'sky',
    },
  });

  console.log('👨‍👩‍👦 Created 3 family members');

  const today = new Date();
  const past30 = subDays(today, 30);
  const future7 = addDays(today, 7);

  // Grandpa Arthur's Medicines
  const metformin = await prisma.medicine.create({
    data: {
      memberId: grandpa.id,
      name: 'Metformin',
      dosage: '500mg',
      instructions: 'Take with food for blood sugar management',
      startDate: past30,
      endDate: null,
      colorTag: 'purple',
      timings: {
        create: [{ time: '08:00' }, { time: '20:00' }],
      },
    },
    include: { timings: true },
  });

  const lisinopril = await prisma.medicine.create({
    data: {
      memberId: grandpa.id,
      name: 'Lisinopril',
      dosage: '10mg',
      instructions: 'Take in morning with water for blood pressure',
      startDate: past30,
      endDate: null,
      colorTag: 'rose',
      timings: {
        create: [{ time: '08:30' }],
      },
    },
    include: { timings: true },
  });

  const atorvastatin = await prisma.medicine.create({
    data: {
      memberId: grandpa.id,
      name: 'Atorvastatin',
      dosage: '20mg',
      instructions: 'Take at night before bed for cholesterol',
      startDate: past30,
      endDate: null,
      colorTag: 'amber',
      timings: {
        create: [{ time: '21:30' }],
      },
    },
    include: { timings: true },
  });

  // Mom Sarah's Medicines
  const vitaminD = await prisma.medicine.create({
    data: {
      memberId: mom.id,
      name: 'Vitamin D3',
      dosage: '2000 IU',
      instructions: 'Take with morning meal',
      startDate: past30,
      endDate: null,
      colorTag: 'amber',
      timings: {
        create: [{ time: '09:00' }],
      },
    },
    include: { timings: true },
  });

  const iron = await prisma.medicine.create({
    data: {
      memberId: mom.id,
      name: 'Iron Complex',
      dosage: '65mg',
      instructions: 'Take with orange juice (avoid dairy within 1 hr)',
      startDate: past30,
      endDate: null,
      colorTag: 'emerald',
      timings: {
        create: [{ time: '13:00' }],
      },
    },
    include: { timings: true },
  });

  const omega3 = await prisma.medicine.create({
    data: {
      memberId: mom.id,
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg',
      instructions: 'Take after dinner',
      startDate: past30,
      endDate: null,
      colorTag: 'cyan',
      timings: {
        create: [{ time: '20:30' }],
      },
    },
    include: { timings: true },
  });

  // Son Leo's Medicines
  const multivitamin = await prisma.medicine.create({
    data: {
      memberId: leo.id,
      name: 'Kids Chewable Multivitamin',
      dosage: '1 gummy',
      instructions: 'Chew thoroughly after breakfast',
      startDate: past30,
      endDate: null,
      colorTag: 'amber',
      timings: {
        create: [{ time: '08:30' }],
      },
    },
    include: { timings: true },
  });

  const amoxicillin = await prisma.medicine.create({
    data: {
      memberId: leo.id,
      name: 'Amoxicillin Oral Suspension',
      dosage: '5ml (250mg)',
      instructions: 'Antibiotic course — shake well before measuring',
      startDate: subDays(today, 3),
      endDate: future7,
      colorTag: 'rose',
      timings: {
        create: [{ time: '09:00' }, { time: '14:00' }, { time: '19:00' }],
      },
    },
    include: { timings: true },
  });

  console.log('💊 Created 8 medicines with scheduled timings');

  // Generate 7 days of historical logs
  const allMeds = [metformin, lisinopril, atorvastatin, vitaminD, iron, omega3, multivitamin, amoxicillin];

  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const isToday = i === 0;

    for (const med of allMeds) {
      // Check if med is active on this day
      if (d < med.startDate || (med.endDate && d > med.endDate)) {
        continue;
      }

      for (const timing of med.timings) {
        let status = 'taken';
        let takenAt: Date | null = new Date(`${dateStr}T${timing.time}:00.000Z`);

        if (isToday) {
          // For today: morning doses marked taken, afternoon/evening pending for interactive demo!
          const [hour] = timing.time.split(':').map(Number);
          if (hour <= 9) {
            status = 'taken';
            takenAt = new Date();
          } else {
            status = 'pending';
            takenAt = null;
          }
        } else {
          // Past days: realistic adherence pattern
          const rand = Math.random();
          if (med.memberId === leo.id && i === 2 && timing.time === '14:00') {
            status = 'skipped';
            takenAt = null;
          } else if (med.memberId === grandpa.id && i === 4 && timing.time === '21:30') {
            status = 'missed';
            takenAt = null;
          } else if (rand > 0.95) {
            status = 'skipped';
            takenAt = null;
          }
        }

        await prisma.doseLog.create({
          data: {
            medicineId: med.id,
            scheduledDate: dateStr,
            scheduledTime: timing.time,
            status,
            takenAt,
          },
        });
      }
    }
  }

  console.log('📊 Generated historical and today dose logs');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

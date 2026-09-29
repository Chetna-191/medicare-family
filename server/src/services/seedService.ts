import bcrypt from 'bcryptjs';
import { format, subDays, addDays } from 'date-fns';
import prisma from '../prisma.js';

async function ensureTables(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "family_members" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "relation" TEXT NOT NULL,
        "age" INTEGER NOT NULL,
        "avatarColor" TEXT NOT NULL DEFAULT 'emerald',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "medicines" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "member_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "dosage" TEXT NOT NULL,
        "instructions" TEXT,
        "start_date" DATETIME NOT NULL,
        "end_date" DATETIME,
        "colorTag" TEXT NOT NULL DEFAULT 'blue',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "medicines_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "medicine_timings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "medicine_id" TEXT NOT NULL,
        "time" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "medicine_timings_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "dose_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "medicine_id" TEXT NOT NULL,
        "scheduled_date" TEXT NOT NULL,
        "scheduled_time" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "taken_at" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "dose_logs_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "dose_logs_medicine_id_scheduled_date_scheduled_time_key" ON "dose_logs"("medicine_id", "scheduled_date", "scheduled_time");
    `);
  } catch (err) {
    console.error('Schema auto-init notice:', err);
  }
}

export async function ensureDemoUserExists(): Promise<void> {
  try {
    await ensureTables();

    const existing = await prisma.user.findUnique({
      where: { email: 'demo@medicare.family' },
    });

    if (existing) {
      return;
    }

    console.log('🌱 Auto-seeding Demo Account: The Miller Family...');

    const hashedPassword = await bcrypt.hash('demo1234', 10);
    const user = await prisma.user.create({
      data: {
        email: 'demo@medicare.family',
        password: hashedPassword,
        name: 'The Miller Family',
      },
    });

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

    // Historical Logs
    const allMeds = [metformin, lisinopril, atorvastatin, vitaminD, iron, omega3, multivitamin, amoxicillin];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const isToday = i === 0;

      for (const med of allMeds) {
        if (d < med.startDate || (med.endDate && d > med.endDate)) continue;

        for (const timing of med.timings) {
          let status = 'taken';
          let takenAt: Date | null = new Date(`${dateStr}T${timing.time}:00.000Z`);

          if (isToday) {
            const [hour] = timing.time.split(':').map(Number);
            if (hour <= 9) {
              status = 'taken';
              takenAt = new Date();
            } else {
              status = 'pending';
              takenAt = null;
            }
          } else {
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

    console.log('✅ Demo account seeded successfully.');
  } catch (err) {
    console.error('Failed to auto-seed demo user:', err);
  }
}

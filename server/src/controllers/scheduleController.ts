import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDailySchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    // Target date in YYYY-MM-DD format (defaults to today's local date)
    const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const targetDateObj = new Date(`${targetDate}T23:59:59.999Z`);
    const targetDateStartObj = new Date(`${targetDate}T00:00:00.000Z`);

    // Fetch all family members and their active medicines for this date
    const members = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        medicines: {
          where: {
            startDate: { lte: targetDateObj },
            OR: [
              { endDate: null },
              { endDate: { gte: targetDateStartObj } },
            ],
          },
          include: {
            timings: {
              orderBy: { time: 'asc' },
            },
            doseLogs: {
              where: {
                scheduledDate: targetDate,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    let totalDoses = 0;
    let takenDoses = 0;
    let skippedDoses = 0;
    let pendingDoses = 0;
    let missedDoses = 0;

    const groupedSchedule = members.map((member) => {
      const memberDoses: any[] = [];

      member.medicines.forEach((med) => {
        med.timings.forEach((timing) => {
          const log = med.doseLogs.find((l) => l.scheduledTime === timing.time);
          const status = log ? log.status : 'pending';
          const takenAt = log ? log.takenAt : null;
          const logId = log ? log.id : null;

          totalDoses++;
          if (status === 'taken') takenDoses++;
          else if (status === 'skipped') skippedDoses++;
          else if (status === 'missed') missedDoses++;
          else pendingDoses++;

          memberDoses.push({
            logId,
            medicineId: med.id,
            medicineName: med.name,
            dosage: med.dosage,
            instructions: med.instructions,
            colorTag: med.colorTag,
            memberId: member.id,
            memberName: member.name,
            memberRelation: member.relation,
            memberAvatarColor: member.avatarColor,
            scheduledDate: targetDate,
            scheduledTime: timing.time,
            status,
            takenAt,
          });
        });
      });

      // Sort member doses chronologically by scheduled time
      memberDoses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

      const memberTaken = memberDoses.filter((d) => d.status === 'taken').length;
      const memberTotal = memberDoses.length;
      const memberCompletionRate = memberTotal > 0 ? Math.round((memberTaken / memberTotal) * 100) : 100;

      return {
        member: {
          id: member.id,
          name: member.name,
          relation: member.relation,
          age: member.age,
          avatarColor: member.avatarColor,
        },
        doses: memberDoses,
        summary: {
          total: memberTotal,
          taken: memberTaken,
          completionRate: memberCompletionRate,
        },
      };
    });

    // Flatten all doses for timeline view sorted by time
    const allDoses = groupedSchedule
      .flatMap((g) => g.doses)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    const overallAdherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    res.json({
      success: true,
      data: {
        date: targetDate,
        summary: {
          totalDoses,
          takenDoses,
          skippedDoses,
          pendingDoses,
          missedDoses,
          adherenceRate: overallAdherence,
        },
        groupedByMember: groupedSchedule,
        allDosesChronological: allDoses,
      },
    });
  } catch (error: any) {
    console.error('Error fetching daily schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: error.message });
  }
};

export const updateDoseStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { medicineId, scheduledDate, scheduledTime, status } = req.body;

    if (!medicineId || !scheduledDate || !scheduledTime || !status) {
      res.status(400).json({
        success: false,
        message: 'medicineId, scheduledDate (YYYY-MM-DD), scheduledTime (HH:mm), and status are required.',
      });
      return;
    }

    const validStatuses = ['pending', 'taken', 'skipped', 'missed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
      });
      return;
    }

    // Verify medicine belongs to user
    const medicine = await prisma.medicine.findFirst({
      where: {
        id: medicineId,
        member: { userId },
      },
      include: {
        member: true,
      },
    });

    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found or unauthorized.' });
      return;
    }

    const takenAt = status === 'taken' ? new Date() : null;

    // Upsert the dose log
    const doseLog = await prisma.doseLog.upsert({
      where: {
        medicineId_scheduledDate_scheduledTime: {
          medicineId,
          scheduledDate,
          scheduledTime,
        },
      },
      update: {
        status,
        takenAt,
      },
      create: {
        medicineId,
        scheduledDate,
        scheduledTime,
        status,
        takenAt,
      },
      include: {
        medicine: {
          include: {
            member: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `Dose for ${medicine.name} marked as ${status}.`,
      data: doseLog,
    });
  } catch (error: any) {
    console.error('Error updating dose status:', error);
    res.status(500).json({ success: false, message: 'Failed to update dose status', error: error.message });
  }
};

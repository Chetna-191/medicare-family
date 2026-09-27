import { Response } from 'express';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAdherenceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const daysCount = parseInt((req.query.days as string) || '7', 10);

    const today = new Date();
    const startDate = subDays(today, daysCount - 1);

    const dateList = eachDayOfInterval({ start: startDate, end: today }).map((d) =>
      format(d, 'yyyy-MM-dd')
    );

    // Fetch members and all medicines
    const members = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        medicines: {
          include: {
            timings: true,
            doseLogs: {
              where: {
                scheduledDate: {
                  in: dateList,
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const memberStats = members.map((member) => {
      let totalScheduledWeek = 0;
      let totalTakenWeek = 0;
      let totalSkippedWeek = 0;
      let totalMissedWeek = 0;
      let totalPendingWeek = 0;

      const dailyBreakdown: {
        date: string;
        dayName: string;
        scheduled: number;
        taken: number;
        skipped: number;
        missed: number;
        rate: number;
      }[] = [];

      // Calculate per-day statistics for the last N days
      for (const dateStr of dateList) {
        const dObj = new Date(`${dateStr}T23:59:59.999Z`);
        const dStartObj = new Date(`${dateStr}T00:00:00.000Z`);

        let dayScheduled = 0;
        let dayTaken = 0;
        let daySkipped = 0;
        let dayMissed = 0;

        member.medicines.forEach((med) => {
          // Check if medicine was active on this date
          const isActive =
            med.startDate <= dObj && (!med.endDate || med.endDate >= dStartObj);

          if (isActive) {
            med.timings.forEach((timing) => {
              dayScheduled++;
              const log = med.doseLogs.find(
                (l) => l.scheduledDate === dateStr && l.scheduledTime === timing.time
              );
              if (log) {
                if (log.status === 'taken') dayTaken++;
                else if (log.status === 'skipped') daySkipped++;
                else if (log.status === 'missed') dayMissed++;
              }
            });
          }
        });

        const dayPending = Math.max(0, dayScheduled - (dayTaken + daySkipped + dayMissed));
        const dayRate = dayScheduled > 0 ? Math.round((dayTaken / dayScheduled) * 100) : 100;

        totalScheduledWeek += dayScheduled;
        totalTakenWeek += dayTaken;
        totalSkippedWeek += daySkipped;
        totalMissedWeek += dayMissed;
        totalPendingWeek += dayPending;

        const dayParsed = parseISO(dateStr);
        dailyBreakdown.push({
          date: dateStr,
          dayName: format(dayParsed, 'EEE'),
          scheduled: dayScheduled,
          taken: dayTaken,
          skipped: daySkipped,
          missed: dayMissed,
          rate: dayRate,
        });
      }

      // Calculate streak: working backwards from yesterday (or today if today's doses are fully taken)
      let streak = 0;
      const reversedDays = [...dailyBreakdown].reverse();

      for (let i = 0; i < reversedDays.length; i++) {
        const day = reversedDays[i];
        if (day.scheduled === 0) {
          // No meds scheduled on this day, doesn't break streak if they had past streak
          continue;
        }

        // If it's today (index 0) and not all taken yet, don't count today as streak break yet
        if (i === 0 && day.date === format(today, 'yyyy-MM-dd')) {
          if (day.taken === day.scheduled) {
            streak++;
          }
          continue;
        }

        if (day.rate >= 80 || (day.taken > 0 && day.missed === 0)) {
          streak++;
        } else {
          break;
        }
      }

      const adherenceRate =
        totalScheduledWeek > 0 ? Math.round((totalTakenWeek / totalScheduledWeek) * 100) : 100;

      return {
        member: {
          id: member.id,
          name: member.name,
          relation: member.relation,
          age: member.age,
          avatarColor: member.avatarColor,
        },
        totalMedicines: member.medicines.length,
        totalScheduledWeek,
        totalTakenWeek,
        totalSkippedWeek,
        totalMissedWeek,
        totalPendingWeek,
        adherenceRate,
        streak,
        dailyBreakdown,
      };
    });

    // Compute family-wide chart timeline
    const chartData = dateList.map((dateStr) => {
      const dayParsed = parseISO(dateStr);
      let dayTotal = 0;
      let dayTaken = 0;
      let daySkipped = 0;
      let dayMissed = 0;
      const memberBreakdown: Record<string, number> = {};

      memberStats.forEach((m) => {
        const d = m.dailyBreakdown.find((item) => item.date === dateStr);
        if (d) {
          dayTotal += d.scheduled;
          dayTaken += d.taken;
          daySkipped += d.skipped;
          dayMissed += d.missed;
          memberBreakdown[m.member.name] = d.rate;
        }
      });

      const dayRate = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 100;

      return {
        date: dateStr,
        displayDate: format(dayParsed, 'MMM dd'),
        dayOfWeek: format(dayParsed, 'EEE'),
        total: dayTotal,
        taken: dayTaken,
        skipped: daySkipped,
        missed: dayMissed,
        rate: dayRate,
        ...memberBreakdown,
      };
    });

    const totalFamilyScheduled = memberStats.reduce((acc, m) => acc + m.totalScheduledWeek, 0);
    const totalFamilyTaken = memberStats.reduce((acc, m) => acc + m.totalTakenWeek, 0);
    const familyAdherence =
      totalFamilyScheduled > 0 ? Math.round((totalFamilyTaken / totalFamilyScheduled) * 100) : 100;
    const maxStreak = Math.max(0, ...memberStats.map((m) => m.streak));

    res.json({
      success: true,
      data: {
        timeframe: {
          startDate: dateList[0],
          endDate: dateList[dateList.length - 1],
          days: daysCount,
        },
        overall: {
          totalScheduled: totalFamilyScheduled,
          totalTaken: totalFamilyTaken,
          familyAdherenceRate: familyAdherence,
          maxStreak,
        },
        memberStats,
        chartData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching adherence statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch adherence analytics', error: error.message });
  }
};

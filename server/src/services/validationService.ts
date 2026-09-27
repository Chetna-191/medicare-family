import prisma from '../prisma.js';

export interface DateRange {
  startDate: Date;
  endDate: Date | null;
}

export const doDateRangesOverlap = (
  start1: Date,
  end1: Date | null,
  start2: Date,
  end2: Date | null
): boolean => {
  // Normalize dates to start of day for accurate comparison
  const s1 = new Date(start1.toISOString().split('T')[0]).getTime();
  const e1 = end1 ? new Date(end1.toISOString().split('T')[0]).getTime() : Infinity;
  const s2 = new Date(start2.toISOString().split('T')[0]).getTime();
  const e2 = end2 ? new Date(end2.toISOString().split('T')[0]).getTime() : Infinity;

  return s1 <= e2 && s2 <= e1;
};

export const validateDuplicateMedicine = async (
  memberId: string,
  name: string,
  startDate: Date,
  endDate: Date | null,
  excludeMedicineId?: string
): Promise<{ isValid: boolean; message?: string }> => {
  const normalizedName = name.trim().toLowerCase();

  // Find all existing medicines for this member
  const existingMeds = await prisma.medicine.findMany({
    where: {
      memberId,
      ...(excludeMedicineId ? { id: { not: excludeMedicineId } } : {}),
    },
  });

  const duplicate = existingMeds.find((med) => {
    if (med.name.trim().toLowerCase() !== normalizedName) {
      return false;
    }
    return doDateRangesOverlap(startDate, endDate, med.startDate, med.endDate);
  });

  if (duplicate) {
    const startStr = duplicate.startDate.toISOString().split('T')[0];
    const endStr = duplicate.endDate ? duplicate.endDate.toISOString().split('T')[0] : 'ongoing';
    return {
      isValid: false,
      message: `A medicine named "${duplicate.name}" is already scheduled for this member during an overlapping period (${startStr} to ${endStr}).`,
    };
  }

  return { isValid: true };
};

export const validateTimings = (
  timings: string[]
): { isValid: boolean; message?: string; normalizedTimings?: string[] } => {
  if (!timings || !Array.isArray(timings) || timings.length === 0) {
    return { isValid: false, message: 'At least one medicine timing must be specified.' };
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const uniqueSet = new Set<string>();
  const normalized: string[] = [];

  for (const time of timings) {
    const trimmed = (time || '').trim();
    if (!timeRegex.test(trimmed)) {
      return {
        isValid: false,
        message: `Invalid time format "${trimmed}". Please use 24-hour format "HH:mm" (e.g. "08:00", "14:30").`,
      };
    }

    if (uniqueSet.has(trimmed)) {
      return {
        isValid: false,
        message: `Duplicate timing entry detected: "${trimmed}". Each scheduled time for a medicine must be unique.`,
      };
    }

    uniqueSet.add(trimmed);
    normalized.push(trimmed);
  }

  // Sort timings chronologically
  normalized.sort((a, b) => a.localeCompare(b));

  return { isValid: true, normalizedTimings: normalized };
};

import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { validateDuplicateMedicine, validateTimings } from '../services/validationService.js';

export const getMedicines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { memberId } = req.query;

    const medicines = await prisma.medicine.findMany({
      where: {
        member: {
          userId,
          ...(memberId ? { id: String(memberId) } : {}),
        },
      },
      include: {
        member: {
          select: { id: true, name: true, relation: true, avatarColor: true },
        },
        timings: {
          orderBy: { time: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: medicines });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch medicines', error: error.message });
  }
};

export const getMedicineById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const medicine = await prisma.medicine.findFirst({
      where: {
        id,
        member: { userId },
      },
      include: {
        member: true,
        timings: {
          orderBy: { time: 'asc' },
        },
        doseLogs: {
          orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'desc' }],
          take: 30,
        },
      },
    });

    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }

    res.json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch medicine details', error: error.message });
  }
};

export const createMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { memberId, name, dosage, instructions, startDate, endDate, timings, colorTag } = req.body;

    if (!memberId || !name || !dosage || !startDate) {
      res.status(400).json({
        success: false,
        message: 'Member ID, medicine name, dosage, and start date are required.',
      });
      return;
    }

    // Verify member belongs to authenticated user
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, userId },
    });

    if (!member) {
      res.status(404).json({ success: false, message: 'Family member not found.' });
      return;
    }

    // Validate timings
    const timingValidation = validateTimings(timings);
    if (!timingValidation.isValid) {
      res.status(400).json({ success: false, message: timingValidation.message });
      return;
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid start date format.' });
      return;
    }

    let end: Date | null = null;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid end date format.' });
        return;
      }
      if (end < start) {
        res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
        return;
      }
    }

    // Backend validation: block duplicate medicine (same member + name + overlapping dates)
    const duplicateCheck = await validateDuplicateMedicine(memberId, name, start, end);
    if (!duplicateCheck.isValid) {
      res.status(409).json({ success: false, message: duplicateCheck.message });
      return;
    }

    // Create medicine and associated timings in a transaction
    const newMedicine = await prisma.$transaction(async (tx) => {
      const med = await tx.medicine.create({
        data: {
          memberId,
          name: name.trim(),
          dosage: dosage.trim(),
          instructions: instructions ? instructions.trim() : null,
          startDate: start,
          endDate: end,
          colorTag: colorTag || 'blue',
        },
      });

      // Create timings
      if (timingValidation.normalizedTimings && timingValidation.normalizedTimings.length > 0) {
        await tx.medicineTiming.createMany({
          data: timingValidation.normalizedTimings.map((time) => ({
            medicineId: med.id,
            time,
          })),
        });
      }

      return tx.medicine.findUnique({
        where: { id: med.id },
        include: {
          member: true,
          timings: {
            orderBy: { time: 'asc' },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully to schedule.',
      data: newMedicine,
    });
  } catch (error: any) {
    console.error('Error creating medicine:', error);
    res.status(500).json({ success: false, message: 'Failed to create medicine', error: error.message });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, dosage, instructions, startDate, endDate, timings, colorTag } = req.body;

    const existingMed = await prisma.medicine.findFirst({
      where: { id, member: { userId } },
      include: { member: true },
    });

    if (!existingMed) {
      res.status(404).json({ success: false, message: 'Medicine not found.' });
      return;
    }

    const start = startDate ? new Date(startDate) : existingMed.startDate;
    let end = existingMed.endDate;
    if (endDate !== undefined) {
      end = endDate ? new Date(endDate) : null;
    }

    if (end && end < start) {
      res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
      return;
    }

    // Validate duplicate if name or dates changed
    const medName = name ? name.trim() : existingMed.name;
    const duplicateCheck = await validateDuplicateMedicine(existingMed.memberId, medName, start, end, id);
    if (!duplicateCheck.isValid) {
      res.status(409).json({ success: false, message: duplicateCheck.message });
      return;
    }

    // Validate timings if provided
    let normalizedTimings: string[] | undefined;
    if (timings !== undefined) {
      const timingValidation = validateTimings(timings);
      if (!timingValidation.isValid) {
        res.status(400).json({ success: false, message: timingValidation.message });
        return;
      }
      normalizedTimings = timingValidation.normalizedTimings;
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.medicine.update({
        where: { id },
        data: {
          name: medName,
          dosage: dosage ? dosage.trim() : existingMed.dosage,
          instructions: instructions !== undefined ? (instructions ? instructions.trim() : null) : existingMed.instructions,
          startDate: start,
          endDate: end,
          colorTag: colorTag || existingMed.colorTag,
        },
      });

      if (normalizedTimings) {
        // Delete previous timings and re-insert new unique timings
        await tx.medicineTiming.deleteMany({
          where: { medicineId: id },
        });

        await tx.medicineTiming.createMany({
          data: normalizedTimings.map((time) => ({
            medicineId: id,
            time,
          })),
        });
      }

      return tx.medicine.findUnique({
        where: { id },
        include: {
          member: true,
          timings: { orderBy: { time: 'asc' } },
        },
      });
    });

    res.json({
      success: true,
      message: 'Medicine updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ success: false, message: 'Failed to update medicine', error: error.message });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.medicine.findFirst({
      where: { id, member: { userId } },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Medicine not found.' });
      return;
    }

    await prisma.medicine.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: `"${existing.name}" was removed from the schedule.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete medicine', error: error.message });
  }
};

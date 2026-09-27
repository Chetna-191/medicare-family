import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const members = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        medicines: {
          include: {
            timings: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: members });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch family members', error: error.message });
  }
};

export const getMemberById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const member = await prisma.familyMember.findFirst({
      where: { id, userId },
      include: {
        medicines: {
          include: {
            timings: {
              orderBy: { time: 'asc' },
            },
            doseLogs: {
              take: 30,
              orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'desc' }],
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) {
      res.status(404).json({ success: false, message: 'Family member not found' });
      return;
    }

    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch family member details', error: error.message });
  }
};

export const createMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, relation, age, avatarColor } = req.body;

    if (!name || !relation || age === undefined || age === null) {
      res.status(400).json({ success: false, message: 'Name, relation, and age are required.' });
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
      res.status(400).json({ success: false, message: 'Please provide a valid age between 0 and 130.' });
      return;
    }

    const member = await prisma.familyMember.create({
      data: {
        userId,
        name: name.trim(),
        relation: relation.trim(),
        age: parsedAge,
        avatarColor: avatarColor || 'emerald',
      },
      include: {
        medicines: {
          include: { timings: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add family member', error: error.message });
  }
};

export const updateMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, relation, age, avatarColor } = req.body;

    const existing = await prisma.familyMember.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Family member not found' });
      return;
    }

    let parsedAge = existing.age;
    if (age !== undefined && age !== null) {
      parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        res.status(400).json({ success: false, message: 'Please provide a valid age between 0 and 130.' });
        return;
      }
    }

    const updated = await prisma.familyMember.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        relation: relation ? relation.trim() : existing.relation,
        age: parsedAge,
        avatarColor: avatarColor || existing.avatarColor,
      },
      include: {
        medicines: {
          include: { timings: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Family member updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update family member', error: error.message });
  }
};

export const deleteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.familyMember.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Family member not found' });
      return;
    }

    await prisma.familyMember.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: `${existing.name}'s profile and associated medicines were removed.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete family member', error: error.message });
  }
};

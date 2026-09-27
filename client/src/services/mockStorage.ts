import type {
  User,
  FamilyMember,
  Medicine,
  DailyScheduleResponse,
  AdherenceStatsResponse,
  DoseLog,
  DoseItem,
  MemberScheduleGroup,
  MemberAdherenceStat,
  AvatarColor,
} from '../types';
import { format, subDays, addDays } from 'date-fns';

const DEMO_USER: User = {
  id: 'demo-user-miller',
  email: 'demo@medicare.family',
  name: 'The Miller Family',
};

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'member-arthur',
    userId: 'demo-user-miller',
    name: 'Arthur Miller',
    relation: 'Grandfather',
    age: 72,
    avatarColor: 'indigo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-sarah',
    userId: 'demo-user-miller',
    name: 'Sarah Miller',
    relation: 'Mother',
    age: 42,
    avatarColor: 'emerald',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'member-leo',
    userId: 'demo-user-miller',
    name: 'Leo Miller',
    relation: 'Son',
    age: 8,
    avatarColor: 'sky',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getInitialMedicines = (): Medicine[] => {
  const today = new Date();
  const past30 = subDays(today, 30).toISOString();
  const future7 = addDays(today, 7).toISOString();

  return [
    {
      id: 'med-metformin',
      memberId: 'member-arthur',
      name: 'Metformin',
      dosage: '500mg',
      instructions: 'Take with meals for blood glucose',
      startDate: past30,
      endDate: null,
      colorTag: 'purple',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-met-1', medicineId: 'med-metformin', time: '08:00', createdAt: new Date().toISOString() },
        { id: 't-met-2', medicineId: 'med-metformin', time: '20:00', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[0],
    },
    {
      id: 'med-lisinopril',
      memberId: 'member-arthur',
      name: 'Lisinopril',
      dosage: '10mg',
      instructions: 'Take in the morning for blood pressure',
      startDate: past30,
      endDate: null,
      colorTag: 'rose',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-lis-1', medicineId: 'med-lisinopril', time: '08:30', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[0],
    },
    {
      id: 'med-atorvastatin',
      memberId: 'member-arthur',
      name: 'Atorvastatin',
      dosage: '20mg',
      instructions: 'Take at night before bed',
      startDate: past30,
      endDate: null,
      colorTag: 'amber',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-ato-1', medicineId: 'med-atorvastatin', time: '21:30', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[0],
    },
    {
      id: 'med-vitamind',
      memberId: 'member-sarah',
      name: 'Vitamin D3',
      dosage: '2000 IU',
      instructions: 'Take with morning meal',
      startDate: past30,
      endDate: null,
      colorTag: 'amber',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-vit-1', medicineId: 'med-vitamind', time: '09:00', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[1],
    },
    {
      id: 'med-iron',
      memberId: 'member-sarah',
      name: 'Iron Complex',
      dosage: '65mg',
      instructions: 'Take with citrus juice',
      startDate: past30,
      endDate: null,
      colorTag: 'emerald',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-iron-1', medicineId: 'med-iron', time: '13:00', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[1],
    },
    {
      id: 'med-omega3',
      memberId: 'member-sarah',
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg',
      instructions: 'Take after dinner',
      startDate: past30,
      endDate: null,
      colorTag: 'cyan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-omg-1', medicineId: 'med-omega3', time: '20:30', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[1],
    },
    {
      id: 'med-multivit',
      memberId: 'member-leo',
      name: 'Kids Chewable Multivitamin',
      dosage: '1 gummy',
      instructions: 'Chew thoroughly after breakfast',
      startDate: past30,
      endDate: null,
      colorTag: 'amber',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-multi-1', medicineId: 'med-multivit', time: '08:30', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[2],
    },
    {
      id: 'med-amox',
      memberId: 'member-leo',
      name: 'Amoxicillin Oral Suspension',
      dosage: '5ml (250mg)',
      instructions: 'Antibiotic course — shake well',
      startDate: subDays(today, 3).toISOString(),
      endDate: future7,
      colorTag: 'rose',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: [
        { id: 't-amox-1', medicineId: 'med-amox', time: '09:00', createdAt: new Date().toISOString() },
        { id: 't-amox-2', medicineId: 'med-amox', time: '14:00', createdAt: new Date().toISOString() },
        { id: 't-amox-3', medicineId: 'med-amox', time: '19:00', createdAt: new Date().toISOString() },
      ],
      member: INITIAL_MEMBERS[2],
    },
  ];
};

export class MockStorage {
  private static load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(`medicare_mock_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`medicare_mock_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }

  static isMockActive(): boolean {
    return localStorage.getItem('medicare_is_mock') === 'true';
  }

  static activateMock(): { user: User; token: string } {
    localStorage.setItem('medicare_is_mock', 'true');
    localStorage.setItem('medicare_token', 'mock_jwt_token_demo_miller');
    
    if (!localStorage.getItem('medicare_mock_members')) {
      this.save('members', INITIAL_MEMBERS);
    }
    if (!localStorage.getItem('medicare_mock_medicines')) {
      this.save('medicines', getInitialMedicines());
    }
    if (!localStorage.getItem('medicare_mock_logs')) {
      this.save('logs', {});
    }

    return { user: DEMO_USER, token: 'mock_jwt_token_demo_miller' };
  }

  static deactivate(): void {
    localStorage.removeItem('medicare_is_mock');
  }

  static getMembers(): FamilyMember[] {
    return this.load<FamilyMember[]>('members', INITIAL_MEMBERS);
  }

  static createMember(payload: any): FamilyMember {
    const members = this.getMembers();
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      userId: DEMO_USER.id,
      name: payload.name,
      relation: payload.relation,
      age: Number(payload.age),
      avatarColor: (payload.avatarColor as AvatarColor) || 'emerald',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    members.push(newMember);
    this.save('members', members);
    return newMember;
  }

  static updateMember(id: string, payload: any): FamilyMember {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === id);
    if (idx !== -1) {
      members[idx] = { ...members[idx], ...payload, updatedAt: new Date().toISOString() };
      this.save('members', members);
      return members[idx];
    }
    throw new Error('Member not found');
  }

  static deleteMember(id: string): { success: boolean; message: string } {
    let members = this.getMembers();
    members = members.filter((m) => m.id !== id);
    this.save('members', members);
    return { success: true, message: 'Member deleted' };
  }

  static getMedicines(memberId?: string): Medicine[] {
    const meds = this.load<Medicine[]>('medicines', getInitialMedicines());
    const members = this.getMembers();
    const mapped = meds.map((m) => ({
      ...m,
      member: members.find((mem) => mem.id === m.memberId),
    }));
    if (memberId) return mapped.filter((m) => m.memberId === memberId);
    return mapped;
  }

  static createMedicine(payload: any): Medicine {
    const meds = this.getMedicines();
    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      memberId: payload.memberId,
      name: payload.name,
      dosage: payload.dosage,
      instructions: payload.instructions || null,
      startDate: payload.startDate,
      endDate: payload.endDate || null,
      colorTag: payload.colorTag || 'blue',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timings: (payload.timings || ['08:00']).map((t: string, i: number) => ({
        id: `t-${Date.now()}-${i}`,
        medicineId: `med-${Date.now()}`,
        time: t,
        createdAt: new Date().toISOString(),
      })),
    };
    meds.push(newMed);
    this.save('medicines', meds);
    return newMed;
  }

  static updateMedicine(id: string, payload: any): Medicine {
    const meds = this.getMedicines();
    const idx = meds.findIndex((m) => m.id === id);
    if (idx !== -1) {
      meds[idx] = {
        ...meds[idx],
        ...payload,
        timings: payload.timings
          ? payload.timings.map((t: string, i: number) => ({
              id: `t-${Date.now()}-${i}`,
              medicineId: id,
              time: t,
              createdAt: new Date().toISOString(),
            }))
          : meds[idx].timings,
        updatedAt: new Date().toISOString(),
      };
      this.save('medicines', meds);
      return meds[idx];
    }
    throw new Error('Medicine not found');
  }

  static deleteMedicine(id: string): { success: boolean; message: string } {
    let meds = this.getMedicines();
    meds = meds.filter((m) => m.id !== id);
    this.save('medicines', meds);
    return { success: true, message: 'Medicine deleted' };
  }

  static getLogs(): Record<string, string> {
    return this.load<Record<string, string>>('logs', {});
  }

  static updateDoseStatus(payload: {
    medicineId: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'pending' | 'taken' | 'skipped' | 'missed';
  }): DoseLog {
    const logs = this.getLogs();
    const key = `${payload.medicineId}_${payload.scheduledDate}_${payload.scheduledTime}`;
    logs[key] = payload.status;
    this.save('logs', logs);

    return {
      id: `log-${Date.now()}`,
      medicineId: payload.medicineId,
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      status: payload.status,
      takenAt: payload.status === 'taken' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  static getDailySchedule(dateStr?: string): DailyScheduleResponse {
    const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');
    const meds = this.getMedicines();
    const logs = this.getLogs();
    const members = this.getMembers();

    const allDosesChronological: DoseItem[] = [];
    let takenDoses = 0;
    let totalDoses = 0;
    let skippedDoses = 0;
    let pendingDoses = 0;
    let missedDoses = 0;

    for (const med of meds) {
      const start = med.startDate ? format(new Date(med.startDate), 'yyyy-MM-dd') : '';
      const end = med.endDate ? format(new Date(med.endDate), 'yyyy-MM-dd') : '';
      if (start && targetDate < start) continue;
      if (end && targetDate > end) continue;

      const mem = members.find((m) => m.id === med.memberId);

      for (const timing of med.timings) {
        totalDoses++;
        const logKey = `${med.id}_${targetDate}_${timing.time}`;
        let status = (logs[logKey] || 'pending') as 'pending' | 'taken' | 'skipped' | 'missed';

        if (status === 'taken') takenDoses++;
        else if (status === 'skipped') skippedDoses++;
        else if (status === 'missed') missedDoses++;
        else pendingDoses++;

        allDosesChronological.push({
          logId: `log-${med.id}-${timing.time}`,
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          colorTag: med.colorTag,
          scheduledDate: targetDate,
          scheduledTime: timing.time,
          status,
          takenAt: status === 'taken' ? new Date().toISOString() : null,
          memberId: mem?.id || '',
          memberName: mem?.name || 'Family Member',
          memberRelation: mem?.relation || '',
          memberAvatarColor: (mem?.avatarColor as AvatarColor) || 'emerald',
        });
      }
    }

    allDosesChronological.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    const groupedMap = new Map<string, DoseItem[]>();
    for (const d of allDosesChronological) {
      if (!groupedMap.has(d.memberId)) {
        groupedMap.set(d.memberId, []);
      }
      groupedMap.get(d.memberId)!.push(d);
    }

    const groupedByMember: MemberScheduleGroup[] = members.map((mem) => {
      const doses = groupedMap.get(mem.id) || [];
      const taken = doses.filter((d) => d.status === 'taken').length;
      return {
        member: {
          id: mem.id,
          name: mem.name,
          relation: mem.relation,
          age: mem.age,
          avatarColor: (mem.avatarColor as AvatarColor) || 'emerald',
        },
        doses,
        summary: {
          total: doses.length,
          taken,
          completionRate: doses.length > 0 ? Math.round((taken / doses.length) * 100) : 100,
        },
      };
    });

    return {
      date: targetDate,
      summary: {
        totalDoses,
        takenDoses,
        skippedDoses,
        pendingDoses,
        missedDoses,
        adherenceRate: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100,
      },
      groupedByMember,
      allDosesChronological,
    };
  }

  static getAdherenceStats(days: number = 7): AdherenceStatsResponse {
    const members = this.getMembers();
    const chartData: any[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');
      const sched = this.getDailySchedule(dateStr);

      chartData.push({
        date: dateStr,
        displayDate: format(d, 'MMM d'),
        dayOfWeek: dayLabel,
        total: sched.summary.totalDoses || 8,
        taken: i === 0 ? sched.summary.takenDoses : Math.max(1, (sched.summary.totalDoses || 8) - (i % 2 === 0 ? 0 : 1)),
        skipped: i === 2 ? 1 : 0,
        missed: 0,
        rate: 94,
      });
    }

    const memberStats: MemberAdherenceStat[] = members.map((m) => {
      const medCount = this.getMedicines(m.id).length;
      return {
        member: {
          id: m.id,
          name: m.name,
          relation: m.relation,
          age: m.age,
          avatarColor: (m.avatarColor as AvatarColor) || 'emerald',
        },
        totalMedicines: medCount,
        totalScheduledWeek: days * 3,
        totalTakenWeek: days * 3 - (m.name === 'Arthur Miller' ? 1 : 0),
        totalSkippedWeek: 0,
        totalMissedWeek: 0,
        totalPendingWeek: 0,
        adherenceRate: m.name === 'Arthur Miller' ? 95 : m.name === 'Sarah Miller' ? 100 : 88,
        streak: m.name === 'Arthur Miller' ? 6 : m.name === 'Sarah Miller' ? 14 : 4,
        dailyBreakdown: chartData.map((c) => ({
          date: c.date,
          dayName: c.dayOfWeek,
          scheduled: 3,
          taken: 3,
          skipped: 0,
          missed: 0,
          rate: 100,
        })),
      };
    });

    return {
      timeframe: {
        startDate: format(subDays(today, days - 1), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
        days,
      },
      overall: {
        totalScheduled: days * 8,
        totalTaken: days * 8 - 2,
        familyAdherenceRate: 94,
        maxStreak: 6,
      },
      memberStats,
      chartData,
    };
  }
}

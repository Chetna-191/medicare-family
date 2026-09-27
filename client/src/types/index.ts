export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  _count?: {
    familyMembers: number;
  };
}

export type AvatarColor = 'emerald' | 'sky' | 'purple' | 'rose' | 'amber' | 'indigo' | 'cyan';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string;
  age: number;
  avatarColor: AvatarColor;
  createdAt: string;
  updatedAt: string;
  medicines?: Medicine[];
}

export interface MedicineTiming {
  id: string;
  medicineId: string;
  time: string; // "HH:mm"
  createdAt?: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  scheduledDate: string; // "YYYY-MM-DD"
  scheduledTime: string; // "HH:mm"
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  takenAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medicine {
  id: string;
  memberId: string;
  member?: FamilyMember;
  name: string;
  dosage: string;
  instructions: string | null;
  startDate: string;
  endDate: string | null;
  colorTag: string;
  createdAt?: string;
  updatedAt?: string;
  timings: MedicineTiming[];
  doseLogs?: DoseLog[];
}

export interface DoseItem {
  logId: string | null;
  medicineId: string;
  medicineName: string;
  dosage: string;
  instructions: string | null;
  colorTag: string;
  memberId: string;
  memberName: string;
  memberRelation: string;
  memberAvatarColor: AvatarColor;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  takenAt: string | null;
}

export interface MemberScheduleGroup {
  member: {
    id: string;
    name: string;
    relation: string;
    age: number;
    avatarColor: AvatarColor;
  };
  doses: DoseItem[];
  summary: {
    total: number;
    taken: number;
    completionRate: number;
  };
}

export interface DailyScheduleResponse {
  date: string;
  summary: {
    totalDoses: number;
    takenDoses: number;
    skippedDoses: number;
    pendingDoses: number;
    missedDoses: number;
    adherenceRate: number;
  };
  groupedByMember: MemberScheduleGroup[];
  allDosesChronological: DoseItem[];
}

export interface DailyBreakdownItem {
  date: string;
  dayName: string;
  scheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  rate: number;
}

export interface MemberAdherenceStat {
  member: {
    id: string;
    name: string;
    relation: string;
    age: number;
    avatarColor: AvatarColor;
  };
  totalMedicines: number;
  totalScheduledWeek: number;
  totalTakenWeek: number;
  totalSkippedWeek: number;
  totalMissedWeek: number;
  totalPendingWeek: number;
  adherenceRate: number;
  streak: number;
  dailyBreakdown: DailyBreakdownItem[];
}

export interface AdherenceStatsResponse {
  timeframe: {
    startDate: string;
    endDate: string;
    days: number;
  };
  overall: {
    totalScheduled: number;
    totalTaken: number;
    familyAdherenceRate: number;
    maxStreak: number;
  };
  memberStats: MemberAdherenceStat[];
  chartData: Array<{
    date: string;
    displayDate: string;
    dayOfWeek: string;
    total: number;
    taken: number;
    skipped: number;
    missed: number;
    rate: number;
    [key: string]: any;
  }>;
}

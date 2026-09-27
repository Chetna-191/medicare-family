import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import type { DailyScheduleResponse, DoseItem } from '../types';
import { DoseCard } from '../components/DoseCard';
import { ProgressRing } from '../components/ProgressRing';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

interface DashboardProps {
  onOpenAddMedicine: () => void;
  onOpenAddMember: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAddMedicine }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduleData, setScheduleData] = useState<DailyScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const { showToast } = useToast();

  const fetchSchedule = useCallback(
    async (date: string) => {
      try {
        setIsLoading(true);
        const data = await api.getDailySchedule(date);
        setScheduleData(data);
      } catch (err: any) {
        showToast('error', 'Failed to fetch schedule', err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate, fetchSchedule]);

  const handleStatusChange = async (
    medicineId: string,
    scheduledDate: string,
    scheduledTime: string,
    status: 'pending' | 'taken' | 'skipped' | 'missed'
  ) => {
    try {
      await api.updateDoseStatus({
        medicineId,
        scheduledDate,
        scheduledTime,
        status,
      });

      await fetchSchedule(selectedDate);

      if (status === 'taken') {
        showToast('success', 'Dose Completed!', 'Medicine marked as taken on schedule.');
      } else if (status === 'skipped') {
        showToast('info', 'Dose Skipped', 'Medicine marked as skipped for this time.');
      } else {
        showToast('info', 'Status Updated', 'Dose status reset to pending.');
      }
    } catch (err: any) {
      showToast('error', 'Failed to update dose', err.message);
    }
  };

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00Z`);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filterDoses = (doses: DoseItem[]) => {
    return doses.filter((d) => {
      // Member filter
      if (selectedMemberFilter !== 'all' && d.memberId !== selectedMemberFilter) {
        return false;
      }
      // Time filter
      if (timeFilter !== 'all') {
        const hour = parseInt(d.scheduledTime.split(':')[0], 10);
        if (timeFilter === 'morning' && hour >= 12) return false;
        if (timeFilter === 'afternoon' && (hour < 12 || hour >= 17)) return false;
        if (timeFilter === 'evening' && hour < 17) return false;
      }
      return true;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Date Navigator & View Switcher */}
      <div className="bg-white rounded-3xl border border-[#BFE3F0] p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Daily Medication Schedule
              </h1>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0]">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Track and log daily doses for your entire family in real time
            </p>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
            <div className="flex items-center bg-[#EAF6F6] p-1 rounded-2xl border border-[#BFE3F0]">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 hover:bg-white text-slate-700 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isToday
                    ? 'bg-[#2A9D8F] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Today
              </button>

              <div className="px-2 font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                {formatDateDisplay(selectedDate)}
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-7 h-7 opacity-0 absolute cursor-pointer"
                title="Choose specific date"
              />

              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 hover:bg-white text-slate-700 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Adherence Summary Stats Cards */}
        {scheduleData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-[#BFE3F0]/60">
            <div className="p-3.5 rounded-2xl bg-[#EAF6F6] border border-[#BFE3F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                  Total Due
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {scheduleData.summary.totalDoses}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#0F766E] border border-[#BFE3F0] flex items-center justify-center font-bold shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EAF6F6] border border-[#BFE3F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                  Completed
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#0F766E] mt-0.5">
                  {scheduleData.summary.takenDoses}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#2A9D8F] border border-[#BFE3F0] flex items-center justify-center font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Remaining
                </span>
                <p className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5">
                  {scheduleData.summary.pendingDoses}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white text-amber-700 border border-amber-200 flex items-center justify-center font-bold shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#E0F0FF]/60 border border-[#BFE3F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Day Adherence
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#0F766E] mt-0.5">
                  {scheduleData.summary.adherenceRate}%
                </p>
              </div>
              <div className="shrink-0">
                <ProgressRing
                  progress={scheduleData.summary.adherenceRate}
                  size={42}
                  strokeWidth={5}
                  showPercent={false}
                  color="teal"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & View Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Family Member Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMemberFilter === 'all'
                ? 'bg-[#0F766E] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-[#EAF6F6] border border-[#BFE3F0]'
            }`}
          >
            All Family Members
          </button>

          {scheduleData?.groupedByMember.map((g) => (
            <button
              key={g.member.id}
              onClick={() => setSelectedMemberFilter(g.member.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedMemberFilter === g.member.id
                  ? 'bg-[#2A9D8F] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-[#EAF6F6] border border-[#BFE3F0]'
              }`}
            >
              <User className="w-3 h-3" />
              {g.member.name}
              <span className="text-[10px] opacity-80">({g.doses.length})</span>
            </button>
          ))}
        </div>

        {/* Time of Day Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="bg-white border border-[#BFE3F0] rounded-2xl p-1 flex text-xs font-semibold text-slate-600 shadow-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                timeFilter === 'all' ? 'bg-[#2A9D8F] text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              All Day
            </button>
            <button
              onClick={() => setTimeFilter('morning')}
              className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                timeFilter === 'morning' ? 'bg-[#2A9D8F] text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              Morning
            </button>
            <button
              onClick={() => setTimeFilter('afternoon')}
              className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                timeFilter === 'afternoon' ? 'bg-[#2A9D8F] text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setTimeFilter('evening')}
              className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                timeFilter === 'evening' ? 'bg-[#2A9D8F] text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              Evening
            </button>
          </div>
        </div>
      </div>

      {/* Main Schedule Content */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : scheduleData?.summary.totalDoses === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-[#BFE3F0] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#EAF6F6] border border-[#BFE3F0] text-[#0F766E] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#2A9D8F]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Medications Due on this Date</h3>
          <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed font-medium">
            There are no scheduled medicine doses for this day, or active medicines have expired.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={onOpenAddMedicine}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white transition-all shadow-md shadow-[#2A9D8F]/20 cursor-pointer"
            >
              + Schedule a Medicine
            </button>
          </div>
        </motion.div>
      ) : (
        /* Grouped by Family Member */
        <div className="space-y-8">
          {scheduleData?.groupedByMember
            .filter((g) => selectedMemberFilter === 'all' || g.member.id === selectedMemberFilter)
            .map((group) => {
              const filteredDoses = filterDoses(group.doses);
              if (filteredDoses.length === 0) return null;

              return (
                <div key={group.member.id} className="space-y-3.5">
                  {/* Member Header */}
                  <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-3xl border border-[#BFE3F0] shadow-[0_2px_12px_-2px_rgba(42,157,143,0.06),0_2px_6px_-1px_rgba(191,227,240,0.35)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-black text-sm shadow-sm">
                        {group.member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {group.member.name}
                        </h3>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {group.member.relation} • {group.member.age} yrs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">
                          {group.summary.taken} / {group.summary.total} doses taken
                        </span>
                        <div className="w-28 h-2 rounded-full bg-[#EAF6F6] border border-[#BFE3F0]/60 overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#2A9D8F] rounded-full transition-all duration-500"
                            style={{ width: `${group.summary.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDoses.map((dose) => (
                      <DoseCard
                        key={`${dose.medicineId}-${dose.scheduledDate}-${dose.scheduledTime}`}
                        dose={dose}
                        onStatusChange={handleStatusChange}
                        showMemberInfo={false}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

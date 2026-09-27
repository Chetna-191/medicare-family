import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BarChart3,
  LineChart as LineChartIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import type { AdherenceStatsResponse } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const Adherence: React.FC = () => {
  const [stats, setStats] = useState<AdherenceStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [timeRange, setTimeRange] = useState<number>(7);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAdherenceStats(timeRange);
        setStats(data);
      } catch (err: any) {
        showToast('error', 'Failed to load adherence statistics', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [timeRange, showToast]);

  if (isLoading || !stats) {
    return <TableSkeleton />;
  }

  const overall = stats.overall;
  const memberStats = stats.memberStats;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Family Adherence Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2A9D8F]" />
              {timeRange}-Day Report
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Weekly medication compliance percentage, consecutive streaks, and per-member trends
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#EAF6F6] p-1 rounded-2xl border border-[#BFE3F0]">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeRange === 7 ? 'bg-[#2A9D8F] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange(14)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeRange === 14 ? 'bg-[#2A9D8F] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Past 14 Days
          </button>
        </div>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Family Overall Adherence */}
        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Family Adherence
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {overall.familyAdherenceRate}%
            </div>
            <p className="text-xs text-[#0F766E] font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
              {overall.totalTaken} of {overall.totalScheduled} doses taken
            </p>
          </div>
          <ProgressRing
            progress={overall.familyAdherenceRate}
            size={72}
            strokeWidth={7}
            color="teal"
          />
        </div>

        {/* Highest Family Streak */}
        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Streak Record
            </span>
            <div className="text-3xl font-black text-amber-600 mt-1 flex items-center gap-1.5">
              <Flame className="w-7 h-7 text-amber-500 fill-amber-500 animate-bounce-subtle" />
              {overall.maxStreak} Days
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Consecutive 100% adherence streak
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Family Champion */}
        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top Performer
            </span>
            <div className="text-xl font-black text-slate-900 mt-1 truncate">
              {memberStats[0]?.member.name || 'All On Track'}
            </div>
            <p className="text-xs text-[#0F766E] font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2A9D8F]" />
              {memberStats[0]?.adherenceRate || 100}% compliance rate
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#EAF6F6] border border-[#BFE3F0] flex items-center justify-center text-[#0F766E] shadow-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Interactive Compliance Chart (Bar / Line) */}
      <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daily Compliance Trend</h3>
            <p className="text-xs text-slate-600 font-medium">
              Daily comparison of scheduled doses vs successfully taken doses
            </p>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 bg-[#EAF6F6] p-1 rounded-2xl border border-[#BFE3F0]">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-[#2A9D8F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-[#2A9D8F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              Line Trend
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2F1F8" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F766E',
                    borderRadius: '12px',
                    border: '1px solid #2A9D8F',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="taken" name="Doses Taken" fill="#2A9D8F" radius={[6, 6, 0, 0]} />
                <Bar dataKey="skipped" name="Skipped" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="missed" name="Missed" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2F1F8" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F766E',
                    borderRadius: '12px',
                    border: '1px solid #2A9D8F',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Adherence Rate (%)"
                  stroke="#2A9D8F"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2A9D8F' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Member Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Per-Member Weekly Adherence & Streaks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {memberStats.map((stat) => (
            <motion.div
              key={stat.member.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-3xl border border-[#BFE3F0] p-5 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {stat.member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {stat.member.name}
                      </h4>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {stat.member.relation} • {stat.totalMedicines} meds
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {stat.streak}d streak
                  </div>
                </div>

                {/* Progress Ring & Stats */}
                <div className="flex items-center justify-between py-2 px-3 bg-[#EAF6F6]/80 rounded-2xl border border-[#BFE3F0] mb-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[#0F766E] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
                      <span>{stat.totalTakenWeek} Taken</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stat.totalPendingWeek} Remaining</span>
                    </div>
                    {stat.totalSkippedWeek > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stat.totalSkippedWeek} Skipped</span>
                      </div>
                    )}
                  </div>

                  <ProgressRing
                    progress={stat.adherenceRate}
                    size={64}
                    strokeWidth={6}
                    color="teal"
                  />
                </div>

                {/* 7-Day Mini Dots */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Past 7 Days Status
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {stat.dailyBreakdown.map((d) => (
                      <div key={d.date} className="flex flex-col items-center">
                        <div
                          className={`w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            d.scheduled === 0
                              ? 'bg-slate-100 text-slate-400'
                              : d.rate === 100
                              ? 'bg-[#2A9D8F] text-white'
                              : d.rate > 0
                              ? 'bg-[#BFE3F0] text-[#0F766E]'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                          title={`${d.dayName}: ${d.taken}/${d.scheduled} taken (${d.rate}%)`}
                        >
                          {d.rate === 100 ? '✓' : `${d.taken}`}
                        </div>
                        <span className="text-[9px] text-slate-600 mt-1 font-bold">
                          {d.dayName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

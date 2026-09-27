import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Edit2, Trash2, Pill, User } from 'lucide-react';
import type { Medicine } from '../types';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (med: Medicine) => void;
  onDelete: (med: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onEdit,
  onDelete,
}) => {
  const startDateStr = new Date(medicine.startDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const endDateStr = medicine.endDate
    ? new Date(medicine.endDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Ongoing (Long-term)';

  const getPillTheme = (colorTag: string) => {
    switch (colorTag) {
      case 'purple':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'rose':
        return 'border-rose-200 bg-rose-50 text-rose-800';
      case 'amber':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'emerald':
        return 'border-teal-200 bg-teal-50 text-[#0F766E]';
      case 'cyan':
        return 'border-cyan-200 bg-cyan-50 text-cyan-900';
      default:
        return 'border-sky-200 bg-sky-50 text-sky-900';
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl border border-[#BFE3F0] p-5 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] hover:border-[#2A9D8F] transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${getPillTheme(medicine.colorTag)}`}>
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 leading-snug">{medicine.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                  {medicine.dosage}
                </span>
                {medicine.member && (
                  <span className="text-xs font-semibold text-[#0F766E] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#2A9D8F]" />
                    {medicine.member.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(medicine)}
              title="Edit Medicine"
              className="p-1.5 text-slate-400 hover:text-[#0F766E] hover:bg-[#EAF6F6] rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(medicine)}
              title="Remove Medicine"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        {medicine.instructions && (
          <p className="text-xs text-slate-700 bg-[#EAF6F6]/60 rounded-xl p-2.5 border border-[#BFE3F0]/70 mb-3.5 leading-relaxed font-medium">
            <span className="font-bold text-[#0F766E]">Instructions: </span>
            {medicine.instructions}
          </p>
        )}

        {/* Timings */}
        <div className="mb-3.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Daily Dosing Times ({medicine.timings?.length || 0})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {medicine.timings?.map((t) => (
              <span
                key={t.id || t.time}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0]"
              >
                {t.time}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Date Range */}
      <div className="pt-3 border-t border-[#BFE3F0]/60 flex items-center justify-between text-xs text-slate-600 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {startDateStr}
        </span>
        <span className="font-semibold text-slate-800">→ {endDateStr}</span>
      </div>
    </motion.div>
  );
};

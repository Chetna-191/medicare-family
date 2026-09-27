import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Pill, ChevronRight, HeartPulse } from 'lucide-react';
import type { FamilyMember, AvatarColor } from '../types';

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  onSelect: (member: FamilyMember) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const getAvatarGradient = (color: AvatarColor) => {
    switch (color) {
      case 'indigo':
        return 'from-indigo-600 to-indigo-800 shadow-indigo-500/25';
      case 'emerald':
        return 'from-[#0F766E] to-[#2A9D8F] shadow-[#2A9D8F]/25';
      case 'sky':
        return 'from-sky-600 to-blue-700 shadow-sky-500/25';
      case 'purple':
        return 'from-purple-600 to-pink-700 shadow-purple-500/25';
      case 'rose':
        return 'from-rose-600 to-red-700 shadow-rose-500/25';
      case 'amber':
        return 'from-amber-600 to-orange-600 shadow-amber-500/25';
      default:
        return 'from-[#0F766E] to-[#2A9D8F] shadow-[#2A9D8F]/25';
    }
  };

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const medCount = member.medicines?.length || 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl border border-[#BFE3F0] p-5 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] hover:border-[#2A9D8F] transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                member.avatarColor
              )} text-white flex items-center justify-center font-black text-base shadow-md`}
            >
              {initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#0F766E] transition-colors">
                {member.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0]">
                  {member.relation}
                </span>
                <span className="text-xs text-slate-600 font-medium">{member.age} yrs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(member);
              }}
              title="Edit Profile"
              className="p-1.5 text-slate-500 hover:text-[#0F766E] hover:bg-[#EAF6F6] rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(member);
              }}
              title="Delete Profile"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Medicines preview tags */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <Pill className="w-3.5 h-3.5 text-[#0F766E]" />
              Prescriptions ({medCount})
            </span>
          </div>

          {medCount > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {member.medicines?.map((med) => (
                <span
                  key={med.id}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#EAF6F6]/90 text-slate-800 border border-[#BFE3F0] flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" />
                  {med.name}
                  <span className="text-slate-600 text-[10px]">({med.dosage})</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-1 font-medium">No active medications assigned yet.</p>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t border-[#BFE3F0]/60 flex items-center justify-between">
        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
          Active profile
        </span>

        <button
          onClick={() => onSelect(member)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] hover:text-[#2A9D8F] transition-colors cursor-pointer"
        >
          View Schedule & Meds
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

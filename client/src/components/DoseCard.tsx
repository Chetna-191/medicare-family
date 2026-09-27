import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Clock, AlertCircle, Sparkles, User as UserIcon } from 'lucide-react';
import type { DoseItem, AvatarColor } from '../types';
import { triggerQuickSuccess } from './ConfettiEffect';

interface DoseCardProps {
  dose: DoseItem;
  onStatusChange: (
    medicineId: string,
    scheduledDate: string,
    scheduledTime: string,
    status: 'pending' | 'taken' | 'skipped' | 'missed'
  ) => Promise<void>;
  showMemberInfo?: boolean;
}

export const DoseCard: React.FC<DoseCardProps> = ({
  dose,
  onStatusChange,
  showMemberInfo = true,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTakenAnimation, setShowTakenAnimation] = useState(false);

  const handleAction = async (status: 'taken' | 'skipped' | 'pending', e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      if (status === 'taken') {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        triggerQuickSuccess(
          (rect.left + rect.width / 2) / window.innerWidth,
          (rect.top + rect.height / 2) / window.innerHeight
        );
        setShowTakenAnimation(true);
        setTimeout(() => setShowTakenAnimation(false), 1200);
      }
      await onStatusChange(dose.medicineId, dose.scheduledDate, dose.scheduledTime, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvatarBg = (color?: AvatarColor) => {
    switch (color) {
      case 'emerald':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'sky':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-teal-100 text-[#0F766E] border-teal-300';
    }
  };

  const getMedicinePillStyle = (color?: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'amber':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'emerald':
        return 'bg-teal-50 text-[#0F766E] border-teal-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-900 border-cyan-200';
      default:
        return 'bg-sky-50 text-sky-900 border-sky-200';
    }
  };

  const isTaken = dose.status === 'taken';
  const isSkipped = dose.status === 'skipped';
  const isMissed = dose.status === 'missed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-3xl border transition-all duration-200 ${
        isTaken
          ? 'bg-[#EAF6F6]/80 border-[#9fd5e8] shadow-sm'
          : isSkipped
          ? 'bg-slate-50/80 border-[#BFE3F0] shadow-sm opacity-85'
          : isMissed
          ? 'bg-rose-50/60 border-rose-200 shadow-sm'
          : 'bg-white border-[#BFE3F0] shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] hover:border-[#2A9D8F]'
      }`}
    >
      {/* Taken Celebration Overlay */}
      <AnimatePresence>
        {showTakenAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 bg-[#0F766E]/95 z-20 flex flex-col items-center justify-center text-white backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className="w-12 h-12 rounded-full bg-white text-[#0F766E] flex items-center justify-center shadow-lg mb-2"
            >
              <Check className="w-7 h-7 stroke-[3]" />
            </motion.div>
            <span className="font-bold text-sm tracking-wide flex items-center gap-1.5 text-white">
              <Sparkles className="w-4 h-4 text-teal-200" /> Dose Recorded!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Timing badge & Member / Medicine Info */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-[#EAF6F6] to-[#E0F0FF] border border-[#BFE3F0] shadow-xs">
              <Clock className="w-4 h-4 text-[#0F766E] mb-0.5" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {dose.scheduledTime}
              </span>
            </div>

            <div className="min-w-0">
              {showMemberInfo && (
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getAvatarBg(
                      dose.memberAvatarColor
                    )}`}
                  >
                    <UserIcon className="w-3 h-3" />
                    {dose.memberName}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    ({dose.memberRelation})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug truncate">
                  {dose.medicineName}
                </h4>
                <span
                  className={`text-xs px-2 py-0.5 font-semibold rounded-full border ${getMedicinePillStyle(
                    dose.colorTag
                  )}`}
                >
                  {dose.dosage}
                </span>
              </div>

              {dose.instructions && (
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 leading-relaxed font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2A9D8F] shrink-0" />
                  {dose.instructions}
                </p>
              )}
            </div>
          </div>

          {/* Right: Status Pill */}
          <div className="shrink-0">
            {isTaken && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-[#0F766E] border border-teal-300">
                <Check className="w-3.5 h-3.5" />
                Taken
              </span>
            )}
            {isSkipped && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
                <X className="w-3.5 h-3.5" />
                Skipped
              </span>
            )}
            {isMissed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Missed
              </span>
            )}
            {!isTaken && !isSkipped && !isMissed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Due Today
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3.5 border-t border-[#BFE3F0]/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-medium">
            {dose.takenAt && isTaken && (
              <span>Logged at {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isTaken ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isUpdating}
                  onClick={(e) => handleAction('skipped', e)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-[#BFE3F0] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Skip
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isUpdating}
                  onClick={(e) => handleAction('taken', e)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-[#2A9D8F]/20 border border-teal-400/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Mark Taken
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                disabled={isUpdating}
                onClick={(e) => handleAction('pending', e)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-[#BFE3F0] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                Undo
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

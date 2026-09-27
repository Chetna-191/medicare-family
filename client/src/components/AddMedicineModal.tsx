import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Pill,
  Clock,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  User,
  Sparkles,
} from 'lucide-react';
import type { FamilyMember, Medicine } from '../types';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    memberId: string;
    name: string;
    dosage: string;
    instructions?: string;
    startDate: string;
    endDate?: string | null;
    timings: string[];
    colorTag?: string;
  }) => Promise<void>;
  members: FamilyMember[];
  selectedMemberId?: string;
  editMedicine?: Medicine | null;
}

const COLOR_TAGS = [
  { id: 'sky', label: 'Blue', bg: 'bg-sky-500' },
  { id: 'emerald', label: 'Green', bg: 'bg-emerald-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { id: 'cyan', label: 'Teal', bg: 'bg-teal-500' },
];

const TIME_PRESETS = [
  { label: 'Morning', time: '08:00' },
  { label: 'Noon', time: '13:00' },
  { label: 'Afternoon', time: '17:00' },
  { label: 'Night', time: '20:30' },
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  selectedMemberId,
  editMedicine,
}) => {
  const [memberId, setMemberId] = useState('');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [timings, setTimings] = useState<string[]>(['08:00']);
  const [newTimeInput, setNewTimeInput] = useState('12:00');
  const [colorTag, setColorTag] = useState('sky');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editMedicine) {
      setMemberId(editMedicine.memberId);
      setName(editMedicine.name);
      setDosage(editMedicine.dosage);
      setInstructions(editMedicine.instructions || '');
      setStartDate(editMedicine.startDate.split('T')[0]);
      if (editMedicine.endDate) {
        setHasEndDate(true);
        setEndDate(editMedicine.endDate.split('T')[0]);
      } else {
        setHasEndDate(false);
        setEndDate('');
      }
      setTimings(editMedicine.timings.map((t) => t.time));
      setColorTag(editMedicine.colorTag || 'sky');
    } else {
      setMemberId(selectedMemberId || (members[0]?.id ?? ''));
      setName('');
      setDosage('');
      setInstructions('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setHasEndDate(false);
      setEndDate('');
      setTimings(['08:00']);
      setColorTag('sky');
    }
    setError(null);
  }, [editMedicine, selectedMemberId, members, isOpen]);

  const addTiming = (timeToAdd: string) => {
    const formatted = timeToAdd.trim();
    if (!formatted) return;
    if (timings.includes(formatted)) {
      setError(`Time ${formatted} is already in the list.`);
      return;
    }
    setError(null);
    setTimings((prev) => [...prev, formatted].sort((a, b) => a.localeCompare(b)));
  };

  const removeTiming = (timeToRemove: string) => {
    if (timings.length === 1) {
      setError('A medicine must have at least one scheduled timing.');
      return;
    }
    setError(null);
    setTimings((prev) => prev.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!memberId) {
      setError('Please select a family member.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter the medicine name.');
      return;
    }
    if (!dosage.trim()) {
      setError('Please enter the dosage (e.g., 500mg, 1 tablet).');
      return;
    }
    if (timings.length === 0) {
      setError('Please add at least one daily dose time.');
      return;
    }

    if (hasEndDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        setError('End date cannot be earlier than start date.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        memberId,
        name: name.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim() || undefined,
        startDate,
        endDate: hasEndDate && endDate ? endDate : null,
        timings,
        colorTag,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save medicine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-xl border border-[#BFE3F0] max-w-xl w-full my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-[#0F766E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {editMedicine ? 'Edit Medication Schedule' : 'Add Medication Schedule'}
                </h3>
                <p className="text-xs text-emerald-100">
                  Configure dose frequency, instructions & validation rules
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-2 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Member Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assign Family Member *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={memberId}
                  disabled={!!editMedicine}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white disabled:bg-slate-100 transition-all font-medium text-slate-800"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medicine Name & Dosage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Medicine Name *
                </label>
                <div className="relative">
                  <Pill className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metformin, Lisinopril..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500mg, 1 tablet, 5ml"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Daily Dosing Timings */}
            <div className="p-4 rounded-2xl bg-[#EAF6F6]/40 border border-[#BFE3F0] space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                  Daily Dose Timings ({timings.length})
                </span>
                <span className="text-[11px] font-normal text-slate-500">24-hour format</span>
              </label>

              {/* Active Timings Chips */}
              <div className="flex flex-wrap gap-2">
                {timings.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0] font-bold text-xs shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    {time}
                    <button
                      type="button"
                      onClick={() => removeTiming(time)}
                      className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-0.5 rounded transition-colors"
                      title="Remove time"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Time & Quick Presets */}
              <div className="pt-2 border-t border-[#BFE3F0]/60 flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#BFE3F0] text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => addTiming(newTimeInput)}
                  className="px-3 py-1.5 rounded-lg bg-[#2A9D8F] hover:bg-[#238276] text-white text-xs font-semibold inline-flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Time
                </button>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] text-slate-500 font-medium">Quick:</span>
                  {TIME_PRESETS.map((p) => (
                    <button
                      key={p.time}
                      type="button"
                      onClick={() => addTiming(p.time)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-[#BFE3F0] transition-colors"
                    >
                      {p.label} ({p.time})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                Usage Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Take with a meal. Avoid dairy 1 hr before/after."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all resize-none text-slate-800"
              />
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    End Date
                  </label>
                  <label className="text-xs text-[#0F766E] font-semibold flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!hasEndDate}
                      onChange={(e) => setHasEndDate(!e.target.checked)}
                      className="rounded text-[#0F766E] focus:ring-[#2A9D8F] w-3.5 h-3.5"
                    />
                    Ongoing course
                  </label>
                </div>
                {hasEndDate ? (
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-white transition-all text-slate-800"
                    />
                  </div>
                ) : (
                  <div className="py-2.5 px-4 rounded-xl border border-dashed border-[#BFE3F0] bg-[#EAF6F6]/40 text-xs text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                    Continuous / Long-term regimen
                  </div>
                )}
              </div>
            </div>

            {/* Pill Color Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Card Accent Color
              </label>
              <div className="flex items-center gap-3">
                {COLOR_TAGS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorTag(c.id)}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-all flex items-center justify-center text-white ${
                      colorTag === c.id ? 'ring-4 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {colorTag === c.id && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#BFE3F0]/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-[#2A9D8F]/20 transition-all inline-flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editMedicine ? 'Save Changes' : 'Schedule Medication'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

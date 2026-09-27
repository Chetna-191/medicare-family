import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, HeartHandshake, Calendar, Palette, Loader2 } from 'lucide-react';
import type { FamilyMember, AvatarColor } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; relation: string; age: number; avatarColor: AvatarColor }) => Promise<void>;
  editMember?: FamilyMember | null;
}

const AVATAR_COLORS: { id: AvatarColor; label: string; bg: string; ring: string }[] = [
  { id: 'emerald', label: 'Teal', bg: 'bg-[#0F766E]', ring: 'ring-[#2A9D8F]' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-400' },
  { id: 'sky', label: 'Sky Blue', bg: 'bg-sky-600', ring: 'ring-sky-400' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-600', ring: 'ring-purple-400' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-600', ring: 'ring-rose-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-600', ring: 'ring-amber-400' },
];

const COMMON_RELATIONS = ['Mother', 'Father', 'Spouse', 'Son', 'Daughter', 'Grandmother', 'Grandfather', 'Self', 'Other'];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editMember,
}) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [age, setAge] = useState('');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>('emerald');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editMember) {
      setName(editMember.name);
      setRelation(editMember.relation);
      setAge(String(editMember.age));
      setAvatarColor(editMember.avatarColor || 'emerald');
    } else {
      setName('');
      setRelation('Mother');
      setAge('');
      setAvatarColor('emerald');
    }
    setError(null);
  }, [editMember, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for the family member.');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
      setError('Please enter a valid age between 0 and 130.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        relation: relation.trim(),
        age: parsedAge,
        avatarColor,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save family member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-[#BFE3F0] max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-[#0F766E] text-white flex items-center justify-between border-b border-teal-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/15 rounded-2xl border border-teal-400/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editMember ? 'Edit Family Member' : 'Add New Family Member'}
                </h3>
                <p className="text-xs text-teal-100 font-medium">
                  {editMember ? 'Update details and profile color' : 'Track medicine reminders for your loved one'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-teal-200 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Arthur Miller, Sarah..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-[#EAF6F6]/30 focus:bg-white transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Relation & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Relationship *
                </label>
                <div className="relative">
                  <HeartHandshake className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-[#EAF6F6]/30 focus:bg-white transition-all text-slate-900 font-medium cursor-pointer"
                  >
                    {COMMON_RELATIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min="0"
                    max="130"
                    required
                    placeholder="e.g. 72"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-[#EAF6F6]/30 focus:bg-white transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Profile Avatar Color Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#0F766E]" />
                Profile Theme Color
              </label>
              <div className="flex items-center gap-3">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAvatarColor(c.id)}
                    className={`w-9 h-9 rounded-full ${c.bg} transition-all flex items-center justify-center text-white cursor-pointer ${
                      avatarColor === c.id ? `ring-4 ring-offset-2 ${c.ring} scale-110` : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {avatarColor === c.id && <span className="text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#BFE3F0]/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-[#2A9D8F]/25 border border-teal-400/30 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editMember ? 'Update Member' : 'Save Member'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

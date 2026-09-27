import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, HeartPulse, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import type { FamilyMember } from '../types';
import { api } from '../services/api';
import { MemberCard } from '../components/MemberCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface FamilyMembersProps {
  onOpenAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
}

export const FamilyMembers: React.FC<FamilyMembersProps> = ({
  onOpenAddMember,
  onEditMember,
}) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCandidate, setDeleteCandidate] = useState<FamilyMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMembers();
      setMembers(data);
    } catch (err: any) {
      showToast('error', 'Failed to load family members', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      await api.deleteMember(deleteCandidate.id);
      showToast('info', 'Member Removed', `${deleteCandidate.name}'s profile was removed.`);
      setDeleteCandidate(null);
      await fetchMembers();
    } catch (err: any) {
      showToast('error', 'Failed to delete member', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectMember = (member: FamilyMember) => {
    navigate(`/members/${member.id}`);
  };

  const totalMedicines = members.reduce((acc, m) => acc + (m.medicines?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Family Member Profiles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0]">
              {members.length} {members.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Manage individual family accounts, assigned prescriptions, and personalized schedules
          </p>
        </div>

        <button
          onClick={onOpenAddMember}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-[#2A9D8F]/20 border border-teal-400/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Family Member
        </button>
      </div>

      {/* Quick Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-4 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex items-center gap-3.5">
          <div className="p-3 bg-[#EAF6F6] rounded-2xl text-[#0F766E] border border-[#BFE3F0]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Family Members</span>
            <p className="text-xl font-black text-slate-900">{members.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-4 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex items-center gap-3.5">
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-700 border border-sky-200">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Active Prescriptions</span>
            <p className="text-xl font-black text-slate-900">{totalMedicines}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-4 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)] flex items-center gap-3.5">
          <div className="p-3 bg-[#EAF6F6] rounded-2xl text-[#0F766E] border border-[#BFE3F0]">
            <Sparkles className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600">Adherence Guard</span>
            <p className="text-xs font-bold text-[#0F766E] mt-1">Active Protection</p>
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : members.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-12 text-center max-w-md mx-auto shadow-sm">
          <Users className="w-12 h-12 text-[#0F766E] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Family Members Added</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4 font-medium">
            Add your first family member to start scheduling medication reminders.
          </p>
          <button
            onClick={onOpenAddMember}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white transition-all cursor-pointer"
          >
            + Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={onEditMember}
              onDelete={(m) => setDeleteCandidate(m)}
              onSelect={handleSelectMember}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#BFE3F0] text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Family Member?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Are you sure you want to remove <strong className="text-slate-900">{deleteCandidate.name}</strong>?
                This will delete all associated medicine schedules and dose logs permanently.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Delete Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Pill,
  Trash2,
} from 'lucide-react';
import type { FamilyMember, Medicine } from '../types';
import { api } from '../services/api';
import { MedicineCard } from '../components/MedicineCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

interface MemberDetailProps {
  onOpenAddMedicineForMember: (memberId: string) => void;
  onEditMedicine: (med: Medicine) => void;
}

export const MemberDetail: React.FC<MemberDetailProps> = ({
  onOpenAddMedicineForMember,
  onEditMedicine,
}) => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMedCandidate, setDeleteMedCandidate] = useState<Medicine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchMember = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await api.getMemberById(id);
      setMember(data);
    } catch (err: any) {
      showToast('error', 'Failed to load member profile', err.message);
      navigate('/members');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleDeleteMedicine = async () => {
    if (!deleteMedCandidate) return;
    try {
      setIsDeleting(true);
      await api.deleteMedicine(deleteMedCandidate.id);
      showToast('info', 'Medicine Removed', `${deleteMedCandidate.name} was removed.`);
      setDeleteMedCandidate(null);
      await fetchMember();
    } catch (err: any) {
      showToast('error', 'Failed to delete medicine', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !member) {
    return <CardSkeleton count={3} />;
  }

  const medicines = member.medicines || [];

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/members')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#2A9D8F] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Family Profiles
      </button>

      {/* Member Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0F766E] to-[#2A9D8F] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#2A9D8F]/25">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{member.name}</h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0]">
                {member.relation}
              </span>
              <span className="text-xs text-slate-600 font-semibold">{member.age} years old</span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Active profile with {medicines.length} scheduled{' '}
              {medicines.length === 1 ? 'medication' : 'medications'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAddMedicineForMember(member.id)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-[#2A9D8F]/20 border border-teal-400/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Medicine for {member.name.split(' ')[0]}
        </button>
      </div>

      {/* Medicines Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-lg font-bold text-slate-900">Assigned Prescriptions</h2>
          </div>
          <span className="text-xs text-slate-600 font-semibold">
            Total {medicines.length} medications
          </span>
        </div>

        {medicines.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#BFE3F0] p-10 text-center shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)]">
            <Pill className="w-10 h-10 text-[#0F766E] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-900">No Prescriptions Yet</h4>
            <p className="text-xs text-slate-600 mt-1 mb-4 font-medium">
              Schedule daily dosage times and instructions for {member.name}.
            </p>
            <button
              onClick={() => onOpenAddMedicineForMember(member.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white transition-all shadow-sm cursor-pointer"
            >
              + Add First Medicine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {medicines.map((med) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onEdit={onEditMedicine}
                onDelete={(m) => setDeleteMedCandidate(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteMedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#BFE3F0] text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Remove Medicine?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
              Are you sure you want to remove <strong>{deleteMedCandidate.name}</strong> from {member.name}'s schedule?
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setDeleteMedCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMedicine}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

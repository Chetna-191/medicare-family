import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Search, Filter, Trash2 } from 'lucide-react';
import type { Medicine, FamilyMember } from '../types';
import { api } from '../services/api';
import { MedicineCard } from '../components/MedicineCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

interface MedicinesListProps {
  onOpenAddMedicine: () => void;
  onEditMedicine: (med: Medicine) => void;
}

export const MedicinesList: React.FC<MedicinesListProps> = ({
  onOpenAddMedicine,
  onEditMedicine,
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('all');
  const [deleteCandidate, setDeleteCandidate] = useState<Medicine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [medsData, membersData] = await Promise.all([
        api.getMedicines(),
        api.getMembers(),
      ]);
      setMedicines(medsData);
      setMembers(membersData);
    } catch (err: any) {
      showToast('error', 'Failed to fetch medications', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      await api.deleteMedicine(deleteCandidate.id);
      showToast('info', 'Medicine Removed', `${deleteCandidate.name} was deleted.`);
      setDeleteCandidate(null);
      await fetchData();
    } catch (err: any) {
      showToast('error', 'Failed to delete medicine', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.instructions && m.instructions.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.member && m.member.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMember =
      selectedMemberFilter === 'all' || m.memberId === selectedMemberFilter;
    return matchesSearch && matchesMember;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#BFE3F0] p-6 shadow-[0_4px_20px_-2px_rgba(42,157,143,0.07),0_2px_8px_-1px_rgba(191,227,240,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Prescriptions & Medicines
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0]">
              {medicines.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Complete active catalog of medications, dosages, and dosing schedules
          </p>
        </div>

        <button
          onClick={onOpenAddMedicine}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-[#2A9D8F]/20 border border-teal-400/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Medicine
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-[#BFE3F0] shadow-[0_4px_20px_-2px_rgba(42,157,143,0.06),0_2px_8px_-1px_rgba(191,227,240,0.35)]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-[#BFE3F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] bg-[#EAF6F6]/40 focus:bg-white transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#0F766E] shrink-0 hidden sm:block" />
          <select
            value={selectedMemberFilter}
            onChange={(e) => setSelectedMemberFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-2xl border border-[#BFE3F0] text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] cursor-pointer"
          >
            <option value="all">All Family Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Grid */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#BFE3F0] p-12 text-center max-w-md mx-auto shadow-sm">
          <Pill className="w-12 h-12 text-[#0F766E] mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-slate-900">No Medications Found</h3>
          <p className="text-xs text-slate-600 mt-1 mb-4 font-medium">
            {searchTerm || selectedMemberFilter !== 'all'
              ? 'No medicines match the selected filter.'
              : 'Add your first medication to get started.'}
          </p>
          <button
            onClick={onOpenAddMedicine}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white transition-all cursor-pointer"
          >
            + Add Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onEdit={onEditMedicine}
              onDelete={(m) => setDeleteCandidate(m)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#BFE3F0] text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Medicine?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
              Are you sure you want to remove <strong>{deleteCandidate.name}</strong> from the schedule?
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
